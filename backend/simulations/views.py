from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SimulationSession, TelemetryLog, TrainingJob, TrainingMetric
from .serializers import SimulationSessionSerializer, TelemetryLogSerializer, TrainingJobSerializer, TrainingMetricSerializer
from .tasks import run_remote_training

class SimulationSessionViewSet(viewsets.ModelViewSet):
    queryset = SimulationSession.objects.all().order_by('-start_time')
    serializer_class = SimulationSessionSerializer

    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        session = self.get_object()
        session.is_active = False
        import datetime
        session.end_time = datetime.datetime.now()
        session.save()
        return Response({'status': 'session stopped'})

class TelemetryLogViewSet(viewsets.ModelViewSet):
    queryset = TelemetryLog.objects.all()
    serializer_class = TelemetryLogSerializer

class TrainingMetricViewSet(viewsets.ModelViewSet):
    queryset = TrainingMetric.objects.all().order_by('epoch')
    serializer_class = TrainingMetricSerializer

class TrainingJobViewSet(viewsets.ModelViewSet):
    queryset = TrainingJob.objects.all().order_by('-created_at')
    serializer_class = TrainingJobSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = serializer.save()
        
        # Trigger remote training task
        run_remote_training.delay(job.id)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
