from django.conf import settings
from django.core.exceptions import ValidationError


def validate_company_email(email):
    allowed_domains = getattr(settings, "ALLOWED_EMAIL_DOMAINS", [])
    if not allowed_domains:
        return
    
    domain = email.strip().lower().split("@")[-1]
    if domain not in allowed_domains:
        raise ValidationError(
            f"Only company email addresses are allowed ({', '.join(allowed_domains)})."
        )