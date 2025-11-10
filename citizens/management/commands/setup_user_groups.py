"""
Management command to set up user groups and permissions.

Creates two user groups:
1. Admins - Full permissions + can create regular users
2. Regular Users - All permissions except user creation

Usage:
    python manage.py setup_user_groups
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up user groups and permissions for 3-level permission system'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up user groups and permissions...'))

        # Get all permissions for models in the citizens app
        from citizens.models import Citizen, Request, Communication, MilitaryPersonnel

        # Get or create Admin group
        admin_group, created = Group.objects.get_or_create(name='Admins')
        if created:
            self.stdout.write(self.style.SUCCESS('[OK] Created "Admins" group'))
        else:
            self.stdout.write('  "Admins" group already exists')

        # Get or create Regular User group
        regular_user_group, created = Group.objects.get_or_create(name='Regular Users')
        if created:
            self.stdout.write(self.style.SUCCESS('[OK] Created "Regular Users" group'))
        else:
            self.stdout.write('  "Regular Users" group already exists')

        # Clear existing permissions for clean setup
        admin_group.permissions.clear()
        regular_user_group.permissions.clear()

        # Get all permissions for our app models
        citizen_ct = ContentType.objects.get_for_model(Citizen)
        request_ct = ContentType.objects.get_for_model(Request)
        communication_ct = ContentType.objects.get_for_model(Communication)
        military_ct = ContentType.objects.get_for_model(MilitaryPersonnel)
        user_ct = ContentType.objects.get_for_model(User)

        # Get all permissions for citizens app models
        app_permissions = Permission.objects.filter(
            content_type__in=[citizen_ct, request_ct, communication_ct, military_ct]
        )

        # Admin group gets:
        # - All permissions on citizens app models
        # - Can add/change/view users (but NOT delete users)
        admin_permissions = list(app_permissions)
        user_permissions = Permission.objects.filter(
            content_type=user_ct,
            codename__in=['add_user', 'change_user', 'view_user']
        )
        admin_permissions.extend(user_permissions)
        admin_group.permissions.set(admin_permissions)

        self.stdout.write(self.style.SUCCESS(
            f'[OK] Assigned {len(admin_permissions)} permissions to "Admins" group'
        ))

        # Regular User group gets:
        # - All permissions on citizens app models
        # - Can only VIEW users (no add/change/delete)
        regular_permissions = list(app_permissions)
        view_user_perm = Permission.objects.filter(
            content_type=user_ct,
            codename='view_user'
        )
        regular_permissions.extend(view_user_perm)
        regular_user_group.permissions.set(regular_permissions)

        self.stdout.write(self.style.SUCCESS(
            f'[OK] Assigned {len(regular_permissions)} permissions to "Regular Users" group'
        ))

        # Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('Permission System Setup Complete!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('\nUser Levels:')
        self.stdout.write('  1. Superusers - Can create Admin users')
        self.stdout.write('  2. Admins - Full permissions + can create Regular Users')
        self.stdout.write('  3. Regular Users - All permissions except user creation')
        self.stdout.write('\nTo assign users to groups:')
        self.stdout.write('  - Use Django admin: Users > [Select user] > Groups')
        self.stdout.write('  - Or use: python manage.py shell')
        self.stdout.write('    >>> from django.contrib.auth.models import User, Group')
        self.stdout.write('    >>> user = User.objects.get(username="username")')
        self.stdout.write('    >>> user.groups.add(Group.objects.get(name="Admins"))')
        self.stdout.write('')
