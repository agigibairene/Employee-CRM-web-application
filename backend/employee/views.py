from django.db.models import Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from auth_app.permissions import IsHRAdmin

from .models import Department, Employee, EmployeeActivity, LeaveRequest
from .permissions import IsHRAdminOrReadOnly
from .serializers import (
    AddEmployeeSerializer,
    DepartmentSerializer,
    EmployeeDetailSerializer,
    EmployeeListSerializer,
    EmployeeUpdateSerializer,
    LeaveRequestSerializer,
    log_activity,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.annotate(employee_count=Count("employees"))
    serializer_class = DepartmentSerializer
    permission_classes = [IsHRAdminOrReadOnly]

    def destroy(self, request, *args, **kwargs):
        department = self.get_object()
        if department.employees.exists():
            return Response(
                {"detail": "Reassign employees before deleting this department."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("user", "department", "manager__user")
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["department", "employment_status"]
    search_fields = ["user__full_name", "user__email", "job_title"]

    def get_serializer_class(self):
        if self.action == "list":
            return EmployeeListSerializer
        if self.action == "create":
            return AddEmployeeSerializer
        if self.action in ("update", "partial_update"):
            return EmployeeUpdateSerializer
        return EmployeeDetailSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsHRAdmin()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        out = EmployeeDetailSerializer(employee)
        return Response(out.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Soft delete: deactivate instead of hard-deleting employee records."""
        employee = self.get_object()
        employee.employment_status = Employee.Status.INACTIVE
        employee.save(update_fields=["employment_status"])
        employee.user.is_active = False
        employee.user.save(update_fields=["is_active"])
        log_activity(employee, "Account deactivated")
        return Response(status=status.HTTP_204_NO_CONTENT)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = LeaveRequest.objects.select_related("employee__user")
        user = self.request.user
        if user.role == user.Role.HR_ADMIN:
            return qs
        return qs.filter(employee__user=user)

    def perform_create(self, serializer):
        employee = self.request.user.employee
        leave = serializer.save(employee=employee)
        log_activity(employee, f"Requested leave ({leave.start_date} to {leave.end_date})")

    def get_permissions(self):
        if self.action in ("approve", "reject", "destroy"):
            return [IsHRAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._review(request, pk, LeaveRequest.Status.APPROVED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._review(request, pk, LeaveRequest.Status.REJECTED)

    def _review(self, request, pk, new_status):
        leave = self.get_object()
        leave.status = new_status
        leave.reviewed_by = request.user.employee
        leave.reviewed_at = timezone.now()
        leave.save(update_fields=["status", "reviewed_by", "reviewed_at"])

        if new_status == LeaveRequest.Status.APPROVED:
            leave.employee.employment_status = Employee.Status.ON_LEAVE
            leave.employee.save(update_fields=["employment_status"])

        log_activity(leave.employee, f"Leave request {new_status.lower()}")
        return Response(LeaveRequestSerializer(leave).data)


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        employees = Employee.objects.all()
        data = {
            "total_employees": employees.count(),
            "active_employees": employees.filter(employment_status=Employee.Status.ACTIVE).count(),
            "on_leave_employees": employees.filter(employment_status=Employee.Status.ON_LEAVE).count(),
            "departments_count": Department.objects.count(),
            "recent_activity": [
                {"id": a.id, "description": a.description, "created_at": a.created_at, "employee": a.employee.user.full_name}
                for a in EmployeeActivity.objects.select_related("employee__user")[:10]
            ],
        }
        return Response(data)
    
    
    
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        employee_id = getattr(getattr(user, "employee", None), "id", None)
        return Response({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "employee_id": employee_id,
        })