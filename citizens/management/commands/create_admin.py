"""
Django management command to create admin user
Usage: python manage.py create_admin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create admin superuser'

    def handle(self, *args, **options):
        User = get_user_model()

        username = 'admin'
        email = 'admin@example.com'
        password = 'ChangeMe123!'

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists!')
            )
            user = User.objects.get(username=username)
            user.set_password(password)
            user.is_superuser = True
            user.is_staff = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Password reset for "{username}"!')
            )
        else:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f'Superuser "{username}" created!')
            )

        self.stdout.write('')
        self.stdout.write('=' * 50)
        self.stdout.write('  LOGIN CREDENTIALS')
        self.stdout.write('=' * 50)
        self.stdout.write(f'  Username: {username}')
        self.stdout.write(f'  Password: {password}')
        self.stdout.write('=' * 50)
        self.stdout.write('')
        self.stdout.write('WARNING: Change password after first login!')
