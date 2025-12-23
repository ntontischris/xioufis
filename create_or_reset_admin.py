#!/usr/bin/env python
"""
Create or reset admin user for Railway deployment.
Uses environment variables for credentials.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'political_crm.settings')
django.setup()

from django.contrib.auth.models import User

def create_or_reset_admin():
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Admin123!@#')

    try:
        # Try to get existing user
        user = User.objects.filter(username=username).first()

        if user:
            # User exists - reset password
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.email = email
            user.save()
            print(f">>> Admin user '{username}' password reset successfully")
        else:
            # Create new user
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            print(f">>> Admin user '{username}' created successfully")

        return True

    except Exception as e:
        print(f">>> Error creating/resetting admin: {e}")
        return False

if __name__ == '__main__':
    success = create_or_reset_admin()
    sys.exit(0 if success else 1)
