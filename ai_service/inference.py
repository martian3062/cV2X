import os
import cv2
import torch
import numpy as np
import time
from models.fusion_net import MultiSensorFusionNet

def export_onnx(model, dummy_image, dummy_map, dummy_pose, output_path='drivable_fusion.onnx'):
    """
    Export the PyTorch model to ONNX for TensorRT rapid inference.
    """
    print(f"Exporting graph to {output_path}...")
    torch.onnx.export(
        model,
        (dummy_image, dummy_map, dummy_pose),
        output_path,
        export_params=True,
        opset_version=12,
        do_constant_folding=True,
        input_names=['image', 'map_mask', 'ego_pose'],
        output_names=['drivable_space_mask'],
        dynamic_axes={'image': {0: 'batch_size'},
                      'map_mask': {0: 'batch_size'},
                      'drivable_space_mask': {0: 'batch_size'}}
    )

def post_process_mask(mask, temporal_mask=None, alpha=0.7):
    """
    - Morphological Opening/Closing to remove noise
    - Exponential Moving Average (EMA) for temporal flickering smoothing
    """
    # Thresholding
    binary_mask = (mask > 0.5).astype(np.uint8) * 255
    
    # Mathematical Morphology
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    cleaned = cv2.morphologyEx(binary_mask, cv2.MORPH_OPEN, kernel)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)

    # Temporal Smoothing
    if temporal_mask is not None:
        cleaned = cv2.addWeighted(cleaned, alpha, temporal_mask, 1 - alpha, 0)
        
    return cleaned

def benchmark_latency(model, device):
    """
    Validate we achieve > 30FPS on the inference path.
    """
    B = 1; H = 360; W = 640
    dummy_img = torch.randn(B, 3, H, W, device=device)
    dummy_map = torch.randn(B, 1, H, W, device=device)
    dummy_pose = torch.randn(B, 7, device=device)

    model.eval()
    
    # GPU Warmup
    for _ in range(10):
        with torch.no_grad():
            _ = model(dummy_img, dummy_map, dummy_pose)

    torch.cuda.synchronize()
    start = time.time()
    iters = 100
    for _ in range(iters):
        with torch.no_grad():
            out = model(dummy_img, dummy_map, dummy_pose)
    torch.cuda.synchronize()
    end = time.time()
    
    latency = (end - start) / iters * 1000 # ms
    fps = 1000 / latency
    print(f"\\nLatency: {latency:.2f} ms | FPS: {fps:.2f} ")
    print(f"{'> 30 FPS target HIT' if fps >= 30 else 'Below target speed!'}")

def main():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = MultiSensorFusionNet(backbone_name='efficientnet_b0', curriculum_stage=3).to(device)
    
    # Load weights
    # model.load_state_dict(torch.load('checkpoint_epoch_50.pth')['model_state_dict'])

    # Validate timing target
    try:
        benchmark_latency(model, device)
    except Exception as e:
        print("Latency benchmark failed:", e)

if __name__ == '__main__':
    main()
