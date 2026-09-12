import random
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from employee.models import Department, Employee

User = get_user_model()

FIRST_NAMES = ["Ama", "Kwame", "Efua", "Kojo", "Akosua", "Kofi", "Abena", "Yaw", "Adjoa", "Kwabena"]
LAST_NAMES = ["Mensah", "Owusu", "Boateng", "Asante", "Appiah", "Osei", "Adjei", "Darko", "Agyemang"]
JOB_TITLES = ["Software Engineer", "Product Manager", "Sales Rep", "Marketing Associate", "HR Coordinator", "Accountant"]
LOCATIONS = ["Kumasi", "Accra", "Remote"]

DEPARTMENT_NAMES = ["Engineering", "Product", "Sales", "Marketing", "Human Resources", "Operations"]


class Command(BaseCommand):
    help = "Seeds the database with sample departments and employees for local testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--count", type=int, default=15, help="Number of employees to create (default: 15)"
        )
        parser.add_argument(
            "--domain", type=str, default="plasera.com", help="Company email domain to use"
        )

    @transaction.atomic
    def handle(self, *args, **options):
        count = options["count"]
        domain = options["domain"]

        departments = []
        for name in DEPARTMENT_NAMES:
            dept, _ = Department.objects.get_or_create(name=name)
            departments.append(dept)

        created = []
        for i in range(count):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            full_name = f"{first} {last}"
            email = f"{first.lower()}.{last.lower()}{i}@{domain}"

            if User.objects.filter(email__iexact=email).exists():
                continue

            user = User.objects.create_user(email=email, full_name=full_name, password="ChangeMe123!")
            user.is_active = True
            user.save(update_fields=["is_active"])

            Employee.objects.create(
                user=user,
                job_title=random.choice(JOB_TITLES),
                department=random.choice(departments),
                employment_status=random.choices(
                    [Employee.Status.ACTIVE, Employee.Status.ON_LEAVE],
                    weights=[85, 15],
                )[0],
                start_date=date.today() - timedelta(days=random.randint(30, 900)),
                location=random.choice(LOCATIONS),
                phone=f"+2335{random.randint(10000000, 99999999)}",
            )
            created.append(email)

        self.stdout.write(self.style.SUCCESS(f"Created {len(created)} employees."))
        for email in created:
            self.stdout.write(f"  - {email}  (password: ChangeMe123!)")