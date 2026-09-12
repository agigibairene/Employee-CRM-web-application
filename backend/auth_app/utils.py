from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import Invitation


def create_and_send_invitation(user, request=None) -> Invitation:
    invitation = Invitation.objects.create(
        user=user, expires_at=timezone.now() + timedelta(days=3)
    )

    activation_link = f"{settings.FRONTEND_URL}/activate?token={invitation.token}"

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