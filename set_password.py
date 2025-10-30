#!/usr/bin/env python
"""Quick script to set admin password"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'political_crm.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(username='admin')
user.set_password('admin123')
user.save()
print('Password set successfully!')
print('  Username: admin')
print('  Password: admin123')
