from rest_framework import serializers
from .models import SimulationSession, TelemetryLog, TrainingJob, TrainingMetric

class TelemetryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelemetryLog
        fields = ['id', 'timestamp', 'fps', 'latency_ms', 'miou', 'pose_x', 'pose_y', 'pose_z']

class TrainingMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingMetric
        fields = ['id', 'epoch', 'loss', 'miou', 'timestamp', 'class_stats']

class SimulationSessionSerializer(serializers.ModelSerializer):
    logs = TelemetryLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = SimulationSession
        fields = ['id', 'name', 'start_time', 'end_time', 'is_active', 'vehicle_id', 'weather_condition', 'logs']

class TrainingJobSerializer(serializers.ModelSerializer):
    metrics = TrainingMetricSerializer(many=True, read_only=True)
    
    class Meta:
        model = TrainingJob
        fields = ['id', 'created_at', 'status', 'epochs', 'batch_size', 'model_version', 'final_miou', 'checkpoint_url', 'metrics']
