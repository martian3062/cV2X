from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from simulations.views import SimulationSessionViewSet, TelemetryLogViewSet, TrainingJobViewSet, TrainingMetricViewSet

router = routers.DefaultRouter()
router.register(r'simulations', SimulationSessionViewSet)
router.register(r'logs', TelemetryLogViewSet)
router.register(r'training', TrainingJobViewSet)
router.register(r'metrics', TrainingMetricViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
