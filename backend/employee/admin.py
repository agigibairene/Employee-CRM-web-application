from django.contrib import admin
from .models import Department, Employee, EmployeeActivity, LeaveRequest

admin.site.register(Department)
admin.site.register(EmployeeActivity)
admin.site.register(Employee)
admin.site.register(LeaveRequest)