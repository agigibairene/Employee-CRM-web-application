from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import Invitation


def create_and_send_invitation(user, request=None) -> Invitation:
    invitation = Invitation.objects.create(
        user=user, expires_at=timezone.now() + timedelta(days=3)
    )

    frontend_url = getattr(settings, "FRONTEND_URL", None)
    if not frontend_url and request:
        frontend_url = request.headers.get("Origin") or request.build_absolute_uri("/").rstrip("/")
    if not frontend_url:
        frontend_url = "http://localhost:5173"

    activation_link = f"{frontend_url.rstrip('/')}/activate?token={invitation.token}"

    send_mail(
        subject="You've been added to the HR System — Activate your account",
        message=(
            f"Hi {user.full_name or user.email},\n\n"
            f"An HR account has been created for you.\n"
            f"Set your password here (link expires in 3 days):\n{activation_link}\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )
    return invitation