from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import AcceptInviteView, CreateEmployeeView, EmailTokenObtainPairView

urlpatterns = [
    path("employees/create/", CreateEmployeeView.as_view(), name="create_employee"),
    path("invite/accept/", AcceptInviteView.as_view(), name="accept_invite"),
    path("login/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("login/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]