import os
import subprocess
from celery import shared_task
from .models import TrainingJob
import uuid

@shared_task
def run_remote_training(job_id):
    try:
        job = TrainingJob.objects.get(id=job_id)
        job.status = TrainingJob.Status.RUNNING
        job.save()

        # Remote details (In production, replace with environment variables)
        VM_IP = "34.31.236.150"
        VM_USER = "pardeep"
        KEY_PATH = r"T:\data\evolet_rsa"
        
        # Command to run on remote VM
        # 1. Sync code, 2. Enter venv, 3. Run training
        # We can reuse the logic from our powershell script but written in Python
        
        # Simple sync using scp for this demo
        local_path = r"T:\MAHE Mobility\drivable_space\ai_service"
        remote_path = f"{VM_USER}@{VM_IP}:~/drivable_space/"
        
        # Syncing code
        sync_cmd = f'scp -i {KEY_PATH} -o StrictHostKeyChecking=no -r "{local_path}" "{remote_path}"'
        subprocess.run(sync_cmd, shell=True, check=True)
        
        # Starting training in tmux
        train_cmd = (
            f"ssh -i {KEY_PATH} -o StrictHostKeyChecking=no {VM_USER}@{VM_IP} "
            f"\"cd ~/drivable_space/ai_service && tmux new-session -d -s train_{job_id} "
            f"'source venv/bin/activate && python training/train.py --epochs {job.epochs} --batch_size {job.batch_size}'\""
        )
        subprocess.run(train_cmd, shell=True, check=True)
        
        # Note: In a real system, we would poll the VM for status or have the VM 
        # call back to the backend. For this demo, we mark it as running.
        
    except Exception as e:
        if 'job' in locals():
            job.status = TrainingJob.Status.FAILED
            job.error_log = str(e)
            job.save()
        print(f"Failed to start remote training: {e}")
