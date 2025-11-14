#!/usr/bin/env python
"""
Create superuser on Railway (non-interactive)
Usage: railway run python create_admin_railway.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'political_crm.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Default credentials - CHANGE THE PASSWORD AFTER FIRST LOGIN!
USERNAME = 'admin'
EMAIL = 'admin@example.com'
PASSWORD = 'ChangeMe123!'  # CHANGE THIS AFTER LOGIN!

print('Creating superuser on Railway database...')
print('')

# Check if user exists
if User.objects.filter(username=USERNAME).exists():
    print(f'WARNING: User "{USERNAME}" already exists!')
    user = User.objects.get(username=USERNAME)
    user.set_password(PASSWORD)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print(f'SUCCESS: Password reset for "{USERNAME}"!')
else:
    # Create superuser
    User.objects.create_superuser(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD
    )
    print(f'SUCCESS: Superuser "{USERNAME}" created successfully!')

print('')
print('═════════════════════════════════════════')
print('  LOGIN CREDENTIALS')
print('═════════════════════════════════════════')
print(f'  Username: {USERNAME}')
print(f'  Password: {PASSWORD}')
print('═════════════════════════════════════════')
print('')
print('WARNING: Change this password after first login!')
print('Go to: https://your-app.up.railway.app/admin/')
print('')
