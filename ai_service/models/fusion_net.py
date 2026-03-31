import torch
import torch.nn as nn
import torch.nn.functional as F
import timm

class SpatialAttention(nn.Module):
    def __init__(self, kernel_size=7):
        super(SpatialAttention, self).__init__()
        assert kernel_size in (3, 7), 'kernel size must be 3 or 7'
        padding = 3 if kernel_size == 7 else 1
        self.conv1 = nn.Conv2d(2, 1, kernel_size, padding=padding, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        x_att = torch.cat([avg_out, max_out], dim=1)
        x_att = self.conv1(x_att)
        return self.sigmoid(x_att)

class ChannelAttention(nn.Module):
    def __init__(self, in_planes, ratio=16):
        super(ChannelAttention, self).__init__()
        self.avg_pool = nn.AdaptiveAvgPool2d(1)
        self.max_pool = nn.AdaptiveMaxPool2d(1)

        self.fc1 = nn.Conv2d(in_planes, in_planes // ratio, 1, bias=False)
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Conv2d(in_planes // ratio, in_planes, 1, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = self.fc2(self.relu1(self.fc1(self.avg_pool(x))))
        max_out = self.fc2(self.relu1(self.fc1(self.max_pool(x))))
        out = avg_out + max_out
        return self.sigmoid(out)

class CBAM(nn.Module):
    def __init__(self, in_planes, ratio=16, kernel_size=7):
        super(CBAM, self).__init__()
        self.ca = ChannelAttention(in_planes, ratio)
        self.sa = SpatialAttention(kernel_size)

    def forward(self, x):
        x = x * self.ca(x)
        x = x * self.sa(x)
        return x

class MapEncoder(nn.Module):
    """
    Shallow CNN that encodes the binary map image (1 channel) down to the 
    bottleneck dimensions of our RGB network.
    """
    def __init__(self, out_channels=320): 
        super(MapEncoder, self).__init__()
        # Optimized: Fewer layers and channels for 4GB VRAM
        self.net = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(32), nn.ReLU(True),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(64), nn.ReLU(True),
            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(128), nn.ReLU(True),
            nn.Conv2d(128, out_channels, kernel_size=3, stride=2, padding=1),
            nn.BatchNorm2d(out_channels), nn.ReLU(True),
            nn.AdaptiveAvgPool2d((12, 20))
        )

    def forward(self, x):
        return self.net(x)

class EgoPoseEmbedding(nn.Module):
    """
    MLP that projects a 7-DOF pose standard vector into a dense channel-map 
    for element-wise injection or concatenation.
    """
    def __init__(self, pose_dim=7, embed_dim=128):
        super(EgoPoseEmbedding, self).__init__()
        self.mlp = nn.Sequential(
            nn.Linear(pose_dim, 64),
            nn.ReLU(True),
            nn.Linear(64, embed_dim),
            nn.ReLU(True)
        )

    def forward(self, x):
        return self.mlp(x) # [B, embed_dim]

class ASPP(nn.Module):
    """
    DeepLabV3+ style ASPP module for multi-scale context capturing over fused features.
    """
    def __init__(self, in_channels, out_channels, num_classes=1):
        super(ASPP, self).__init__()
        
        self.conv1 = nn.Conv2d(in_channels, out_channels, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        
        self.conv2 = nn.Conv2d(in_channels, out_channels, 3, padding=6, dilation=6, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        self.conv3 = nn.Conv2d(in_channels, out_channels, 3, padding=12, dilation=12, bias=False)
        self.bn3 = nn.BatchNorm2d(out_channels)
        
        self.conv4 = nn.Conv2d(in_channels, out_channels, 3, padding=18, dilation=18, bias=False)
        self.bn4 = nn.BatchNorm2d(out_channels)

        self.global_avg_pool = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Conv2d(in_channels, out_channels, 1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

        self.project = nn.Sequential(
            nn.Conv2d(5 * out_channels, out_channels, 1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5)
        )

        self.classifier = nn.Conv2d(out_channels, num_classes, kernel_size=1)

    def forward(self, x):
        res = []
        res.append(F.relu(self.bn1(self.conv1(x))))
        res.append(F.relu(self.bn2(self.conv2(x))))
        res.append(F.relu(self.bn3(self.conv3(x))))
        res.append(F.relu(self.bn4(self.conv4(x))))
        
        pool_feat = self.global_avg_pool(x)
        pool_feat = F.interpolate(pool_feat, size=x.shape[2:], mode='bilinear', align_corners=False)
        res.append(pool_feat)
        
        out = torch.cat(res, dim=1)
        out = self.project(out)
        out = self.classifier(out)
        return out

class MultiSensorFusionNet(nn.Module):
    """
    Core Architecture combining standard efficient net backbone 
    with multimodal embeddings using Attention constraints.
    """
    def __init__(self, backbone_name='efficientnet_b0', num_classes=1, curriculum_stage=1):
        super(MultiSensorFusionNet, self).__init__()
        self.curriculum_stage = curriculum_stage # 1: Camera only. 2: +Map. 3: +Map+Pose.

        print(f"Initializing {backbone_name} with features_only=True")
        self.rgb_encoder = timm.create_model(backbone_name, pretrained=True, features_only=True)
        rgb_channels = self.rgb_encoder.feature_info.channels()[-1] # Usually 320 for b0

        self.map_encoder = MapEncoder(out_channels=128)
        self.pose_encoder = EgoPoseEmbedding(pose_dim=7, embed_dim=64)

        # Assuming we concatenate the RGB (320) + Map (128) + Pose (64)
        total_channels = rgb_channels
        if self.curriculum_stage >= 2:
            total_channels += 128
        if self.curriculum_stage >= 3:
            total_channels += 64

        self.fusion_cbam = CBAM(total_channels, ratio=16)
        
        # Decoder section
        self.decoder = ASPP(in_channels=total_channels, out_channels=256, num_classes=num_classes)

    def forward(self, image, map_mask=None, pose=None):
        B, C, H, W = image.shape
        
        # 1. Image features
        rgb_feats = self.rgb_encoder(image)
        bottleneck_feat = rgb_feats[-1] # [B, 320, H/32, W/32]
        _, _, b_H, b_W = bottleneck_feat.shape
        
        fused_feat = bottleneck_feat
        
        # 2. Map Features
        if self.curriculum_stage >= 2 and map_mask is not None:
            map_feat = self.map_encoder(map_mask)
            # Ensure spatial alignment just in case
            if map_feat.shape[2:] != bottleneck_feat.shape[2:]:
                map_feat = F.interpolate(map_feat, size=(b_H, b_W), mode='bilinear', align_corners=False)
            fused_feat = torch.cat([fused_feat, map_feat], dim=1)
            
        # 3. Pose Features
        if self.curriculum_stage >= 3 and pose is not None:
            pose_feat = self.pose_encoder(pose) # [B, 64]
            # Broadcast scalar embedding across entire spatial dimension
            pose_spatial = pose_feat.unsqueeze(2).unsqueeze(3).expand(-1, -1, b_H, b_W) # [B, 64, b_H, b_W]
            fused_feat = torch.cat([fused_feat, pose_spatial], dim=1)
            
        # 4. Attention mechanism (Focus on important channels/spatial regions)
        fused_feat = self.fusion_cbam(fused_feat)
        
        # 5. Semantic Decoder
        out = self.decoder(fused_feat)
        
        # Upsample mask to original inputs
        out = F.interpolate(out, size=(H, W), mode='bilinear', align_corners=False)
        return out
