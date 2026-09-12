from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from employee.models import Employee

User = get_user_model()


class EmployeeCreationTests(APITestCase):
    def setUp(self):
        self.hr_user = User.objects.create_user(
            email="hr_admin@example.com",
            password="password123",
            full_name="HR Admin",
            role=User.Role.HR_ADMIN,
            is_active=True,
        )
        self.client.force_authenticate(user=self.hr_user)

    def test_create_employee_success(self):
        data = {
            "email": "new.hire@example.com",
            "full_name": "New Hire",
            "job_title": "Software Engineer",
        }
        response = self.client.post("/api/employees/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Employee.objects.filter(user__email="new.hire@example.com").exists())
        self.assertTrue(User.objects.filter(email="new.hire@example.com").exists())
