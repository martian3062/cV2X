from django.db import models
import uuid

class SimulationSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Metadata
    vehicle_id = models.CharField(max_length=100, default="MAHE-EGO-01")
    weather_condition = models.CharField(max_length=100, default="Clear")

    def __str__(self):
        return f"{self.name} ({self.id})"

class TelemetryLog(models.Model):
    session = models.ForeignKey(SimulationSession, related_name='logs', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Metrics
    fps = models.FloatField()
    latency_ms = models.FloatField()
    miou = models.FloatField()
    
    # Pose
    pose_x = models.FloatField()
    pose_y = models.FloatField()
    pose_z = models.FloatField()
    
    def __cl__(self):
        return f"Log {self.timestamp} - FPS: {self.fps}"

class TrainingJob(models.Model):
    class Status(models.TextChoices):
        QUEUED = 'QUEUED', 'Queued'
        RUNNING = 'RUNNING', 'Running'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)
    
    # Training Config
    epochs = models.IntegerField(default=50)
    batch_size = models.IntegerField(default=4)
    model_version = models.CharField(max_length=100, default="v1.0-fusion")
    
    # Results
    final_miou = models.FloatField(null=True, blank=True)
    checkpoint_url = models.URLField(max_length=500, null=True, blank=True)
    error_log = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Job {self.id} - {self.status}"

class TrainingMetric(models.Model):
    job = models.ForeignKey(TrainingJob, related_name='metrics', on_delete=models.CASCADE)
    epoch = models.IntegerField()
    loss = models.FloatField()
    miou = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Class-wise stats (JSON for flexibility)
    class_stats = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['epoch']

    def __str__(self):
        return f"Job {self.job.id} - Epoch {self.epoch} - mIoU: {self.miou}"
