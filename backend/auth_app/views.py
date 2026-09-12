from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsHRAdmin
from .serializers import (
    AcceptInviteSerializer,
    CreateEmployeeSerializer,
    EmailTokenObtainPairSerializer,
)
from .utils import create_and_send_invitation


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class CreateEmployeeView(generics.CreateAPIView):
    """HR Admin only: provisions a new employee + sends invite email."""
    serializer_class = CreateEmployeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsHRAdmin]

    def perform_create(self, serializer):
        user = serializer.save()
        create_and_send_invitation(user, request=self.request)


class AcceptInviteView(APIView):
    """Public: employee sets their password using the emailed token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = AcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Account activated. You can now log in."}, status=status.HTTP_200_OK)