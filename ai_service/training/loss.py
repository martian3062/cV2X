import torch
import torch.nn as nn
import torch.nn.functional as F

class FocalLoss(nn.Module):
    def __init__(self, alpha=0.5, gamma=2.0, reduction='mean'):
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, inputs, targets):
        BCE_loss = F.binary_cross_entropy_with_logits(inputs, targets, reduction='none')
        pt = torch.exp(-BCE_loss)
        F_loss = self.alpha * (1 - pt)**self.gamma * BCE_loss

        if self.reduction == 'mean':
            return torch.mean(F_loss)
        elif self.reduction == 'sum':
            return torch.sum(F_loss)
        else:
            return F_loss

class DiceLoss(nn.Module):
    def __init__(self, smooth=1.0):
        super(DiceLoss, self).__init__()
        self.smooth = smooth

    def forward(self, inputs, targets):
        inputs = torch.sigmoid(inputs)
        inputs = inputs.view(-1)
        targets = targets.view(-1)
        
        intersection = (inputs * targets).sum()
        dice = (2. * intersection + self.smooth) / (inputs.sum() + targets.sum() + self.smooth)
        
        return 1.0 - dice

class BoundaryLoss(nn.Module):
    """
    Surface/Boundary loss to sharply distinguish boundaries (lanes vs non-drivable).
    Implemented via morphological gradients.
    """
    def __init__(self):
        super(BoundaryLoss, self).__init__()
        kernel = torch.ones((1, 1, 3, 3), dtype=torch.float32)
        # Using sobel or simple max-pool for edge extraction
        self.pool = nn.MaxPool2d(3, stride=1, padding=1)
        
    def get_boundary(self, mask):
        # Extract edge regions from masks
        eroded = -self.pool(-mask)
        dilated = self.pool(mask)
        return dilated - eroded
        
    def forward(self, inputs, targets):
        inputs = torch.sigmoid(inputs)
        # Binarize outputs softly
        
        pred_bound = self.get_boundary(inputs)
        targ_bound = self.get_boundary(targets)
        
        # Simple MSE on the edges
        return F.mse_loss(pred_bound, targ_bound)

class DrivableSpaceLoss(nn.Module):
    """
    0.4 x Focal + 0.4 x Dice + 0.2 x Boundary
    """
    def __init__(self):
        super(DrivableSpaceLoss, self).__init__()
        self.focal = FocalLoss(alpha=0.25, gamma=2.0)
        self.dice = DiceLoss(smooth=1.0)
        self.boundary = BoundaryLoss()

    def forward(self, inputs, targets):
        lfocal = self.focal(inputs, targets)
        ldice = self.dice(inputs, targets)
        lbound = self.boundary(inputs, targets)
        
        return (0.4 * lfocal) + (0.4 * ldice) + (0.2 * lbound)
