from rest_framework.permissions import SAFE_METHODS, BasePermission

from auth_app.permissions import IsHRAdmin 


class IsHRAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return IsHRAdmin().has_permission(request, view)