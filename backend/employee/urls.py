from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DashboardView, DepartmentViewSet, EmployeeViewSet, LeaveRequestViewSet

router = DefaultRouter()
router.register("departments", DepartmentViewSet, basename="department")
router.register("employees", EmployeeViewSet, basename="employee")
router.register("leave-requests", LeaveRequestViewSet, basename="leave-request")

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("", include(router.urls)),
]