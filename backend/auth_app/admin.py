from django.contrib import admin
from .models import UserManager, User, Invitation

admin.site.register(User)
# admin.site.register(UserManager)
admin.site.register(Invitation)