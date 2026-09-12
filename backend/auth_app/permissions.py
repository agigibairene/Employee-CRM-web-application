from rest_framework.permissions import BasePermission


class IsHRAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == request.user.Role.HR_ADMIN
        )