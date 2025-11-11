#!/usr/bin/env python
"""
Script to create a superuser for the Political CRM system.
Usage: python create_superuser.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'political_crm.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Superuser credentials
USERNAME = 'admin'
EMAIL = 'admin@example.com'
PASSWORD = 'admin123'  # CHANGE THIS!

# Check if superuser exists
if User.objects.filter(username=USERNAME).exists():
    print(f'❌ User "{USERNAME}" already exists!')
else:
    # Create superuser
    User.objects.create_superuser(
        username=USERNAME,
        email=EMAIL,
        password=PASSWORD
    )
    print(f'✅ Superuser "{USERNAME}" created successfully!')
    print(f'   Username: {USERNAME}')
    print(f'   Email: {EMAIL}')
    print(f'   Password: {PASSWORD}')
    print('')
    print('⚠️  IMPORTANT: Change the password after first login!')
