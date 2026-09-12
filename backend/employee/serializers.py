from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from auth_app.utils import create_and_send_invitation
from auth_app.validators import validate_company_email

from .models import Department, Employee, EmployeeActivity, LeaveRequest

User = get_user_model()


def log_activity(employee: Employee, description: str) -> None:
    EmployeeActivity.objects.create(employee=employee, description=description)


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Department
        fields = ["id", "name", "description", "employee_count", "created_at"]


class ManagerSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField(source="user.full_name")


class EmployeeListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)
    manager_name = serializers.CharField(source="manager.user.full_name", read_only=True, default=None)

    class Meta:
        model = Employee
        fields = [
            "id", "full_name", "email", "avatar_url", "job_title",
            "department", "department_name", "employment_status",
            "start_date", "location", "manager", "manager_name",
        ]


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeActivity
        fields = ["id", "description", "created_at"]


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.user.full_name", read_only=True)
    reviewed_by_name = serializers.CharField(source="reviewed_by.user.full_name", read_only=True, default=None)

    class Meta:
        model = LeaveRequest
        fields = [
            "id", "employee", "employee_name", "start_date", "end_date",
            "reason", "status", "reviewed_by_name", "reviewed_at", "created_at",
        ]
        read_only_fields = ["status", "reviewed_by_name", "reviewed_at", "employee_name"]

    def validate(self, data):
        if data["end_date"] < data["start_date"]:
            raise serializers.ValidationError("End date cannot be before the start date.")
        return data


class EmployeeDetailSerializer(EmployeeListSerializer):
    date_joined = serializers.DateTimeField(source="user.date_joined", read_only=True)
    leave_requests = LeaveRequestSerializer(many=True, read_only=True)
    recent_activity = ActivitySerializer(source="activities", many=True, read_only=True)

    class Meta(EmployeeListSerializer.Meta):
        fields = EmployeeListSerializer.Meta.fields + [
            "phone", "date_joined", "leave_requests", "recent_activity",
        ]


class AddEmployeeSerializer(serializers.Serializer):
    """HR Admin only: creates the User (invited) + Employee profile together."""

    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    job_title = serializers.CharField(max_length=120, required=False, allow_blank=True)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), required=False, allow_null=True
    )
    manager = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), required=False, allow_null=True
    )
    start_date = serializers.DateField(required=False, allow_null=True)
    location = serializers.CharField(max_length=120, required=False, allow_blank=True)

    def validate_email(self, value):
        validate_company_email(value)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=None,
        )
        employee = Employee.objects.create(
            user=user,
            phone=validated_data.get("phone", ""),
            job_title=validated_data.get("job_title", ""),
            department=validated_data.get("department"),
            manager=validated_data.get("manager"),
            start_date=validated_data.get("start_date"),
            location=validated_data.get("location", ""),
        )
        create_and_send_invitation(user)
        log_activity(employee, "Joined the company")
        return employee


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", required=False)

    class Meta:
        model = Employee
        fields = [
            "full_name", "phone", "job_title", "department",
            "manager", "employment_status", "start_date", "location", "avatar_url",
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        if user_data and "full_name" in user_data:
            instance.user.full_name = user_data["full_name"]
            instance.user.save(update_fields=["full_name"])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        log_activity(instance, "Profile updated")
        return instance