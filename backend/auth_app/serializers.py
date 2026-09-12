from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Invitation
from .validators import validate_company_email

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login with email + password only."""
    username_field = User.USERNAME_FIELD  # "email"


class CreateEmployeeSerializer(serializers.ModelSerializer):
    """Used by HR Admins to provision a new employee account (no password set here)."""

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role"]

    def validate_email(self, value):
        validate_company_email(value)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(password=None, **validated_data)


class AcceptInviteSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_token(self, value):
        try:
            invitation = Invitation.objects.select_related("user").get(token=value)
        except Invitation.DoesNotExist:
            raise serializers.ValidationError("Invalid invitation token.")
        if not invitation.is_valid:
            raise serializers.ValidationError("This invitation has expired or was already used.")
        self.invitation = invitation
        return value

    def save(self, **kwargs):
        invitation = self.invitation
        user = invitation.user
        user.set_password(self.validated_data["password"])
        user.is_active = True
        user.save(update_fields=["password", "is_active"])

        invitation.accepted_at = timezone.now()
        invitation.save(update_fields=["accepted_at"])
        return user