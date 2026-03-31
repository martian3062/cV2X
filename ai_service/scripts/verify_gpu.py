import torch
import sys
import os
import psutil

def verify_hardware():
    print("=== MAHE Autonomous Perception: Hardware Diagnostics ===")
    print(f"Python Version: {sys.version}")
    print(f"System RAM: {psutil.virtual_memory().total / (1024**3):.2f} GB")
    print(f"Available RAM: {psutil.virtual_memory().available / (1024**3):.2f} GB")
    
    cuda_available = torch.cuda.is_available()
    print(f"\nCUDA Available: {cuda_available}")
    
    if cuda_available:
        device_id = torch.cuda.current_device()
        props = torch.cuda.get_device_properties(device_id)
        print(f"Device Name: {props.name}")
        print(f"Total VRAM: {props.total_memory / (1024**2):.2f} MB")
        
        # Current utilization
        allocated = torch.cuda.memory_allocated(device_id) / (1024**2)
        reserved = torch.cuda.memory_reserved(device_id) / (1024**2)
        print(f"Allocated VRAM: {allocated:.2f} MB")
        print(f"Reserved VRAM: {reserved:.2f} MB")
        
        print("\n[SUCCESS] Hardware is ready for Local High-Fidelity Perception.")
        print("[ADVISORY] Target Batch Size: 2 | Use Mixed Precision (AMP)")
    else:
        print("\n[CRITICAL] CUDA NOT FOUND.")
        print("Ensure NVIDIA Drivers are updated and PyTorch is installed with 'cu121/cu124' wheels.")

if __name__ == "__main__":
    verify_hardware()
