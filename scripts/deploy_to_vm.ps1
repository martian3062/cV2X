$VM_IP="34.31.236.150"
$VM_USER="pardeep"
$KEY_PATH="T:\data\evolet_rsa"

$LOCAL_AI_DIR="T:\MAHE Mobility\drivable_space\ai_service"
$DATASET_FILE="T:\MAHE Mobility\v1.0-mini.tgz"

Write-Host "[1] Copying AI Perception Code to $VM_USER@$VM_IP..." -ForegroundColor Cyan
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no $VM_USER@$VM_IP "mkdir -p ~/drivable_space/ai_service"
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no -r "$LOCAL_AI_DIR\*" "${VM_USER}@${VM_IP}:~/drivable_space/ai_service/"

Write-Host "[2] Transferring v1.0-mini.tgz dataset to $VM_USER@$VM_IP (This may take a few minutes if not already present)..." -ForegroundColor Cyan
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$DATASET_FILE" "${VM_USER}@${VM_IP}:~/drivable_space/"

Write-Host "[3] Initializing PyTorch GPU Virtual Environment & Extracting Dataset on VM..." -ForegroundColor Green
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no $VM_USER@$VM_IP "
    cd ~/drivable_space
    mkdir -p data/nuscenes
    tar -xzf v1.0-mini.tgz -C data/nuscenes 2>/dev/null || tar -xf v1.0-mini.tgz -C data/nuscenes
    
    python3 -m venv venv
    source venv/bin/activate
    pip install -U pip
    pip install -r ai_service/requirements.txt 
    pip install pyquaternion
    pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
    
    # Launch training session
    tmux new-session -d -s drivable_seg_train 'cd ~/drivable_space && source venv/bin/activate && python ai_service/training/train.py --batch_size 4 --epochs 50 --curriculum_stage 3'
"
Write-Host "Training sequence dispatched and detached out via TMUX! Connect using: ssh -i $KEY_PATH $VM_USER@$VM_IP -t 'tmux attach -t drivable_seg_train'" -ForegroundColor Yellow
