"""
Custom User admin with 3-level permission system.

Permission Levels:
- Superusers: Can create Admin users
- Admins: Can create Regular users
- Regular Users: Cannot create users
"""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Q
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from unfold.admin import ModelAdmin

from ..forms import AdminUserCreationForm, RegularUserCreationForm
from .base import USER_LEVEL_COLORS


# Unregister the default User admin if it's registered
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    """
    Custom User Admin with 3-level permission system.

    Permission Hierarchy:
    - Superusers: Full access, can create Admin users
    - Admins: Can view/edit Regular users, can create Regular users
    - Regular Users: Can only view themselves
    """

    list_display = ['username', 'email', 'first_name', 'last_name', 'user_level_badge', 'is_active', 'last_login']
    list_filter = ['groups', 'is_active', 'is_staff', 'is_superuser', 'last_login']
    search_fields = ['username', 'first_name', 'last_name', 'email']

    # ============================================
    # DISPLAY METHODS
    # ============================================

    def user_level_badge(self, obj):
        """Display user level as colored badge"""
        if obj.is_superuser:
            return format_html(
                '<span style="background-color: {}; color: white; padding: 5px 12px; '
                'border-radius: 12px; font-weight: bold; display: inline-block;">Superuser</span>',
                USER_LEVEL_COLORS['superuser']
            )

        if obj.groups.filter(name='Admins').exists():
            return format_html(
                '<span style="background-color: {}; color: white; padding: 5px 12px; '
                'border-radius: 12px; font-weight: bold; display: inline-block;">Admin</span>',
                USER_LEVEL_COLORS['admin']
            )

        if obj.groups.filter(name='Regular Users').exists():
            return format_html(
                '<span style="background-color: {}; color: white; padding: 5px 12px; '
                'border-radius: 12px; font-weight: bold; display: inline-block;">Χρήστης</span>',
                USER_LEVEL_COLORS['regular']
            )

        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 12px; '
            'border-radius: 12px; font-weight: bold; display: inline-block;">Χωρίς Ομάδα</span>',
            USER_LEVEL_COLORS['no_group']
        )

    user_level_badge.short_description = 'Επίπεδο'

    # ============================================
    # QUERY FILTERING
    # ============================================

    def get_queryset(self, request):
        """
        Filter users based on permissions:
        - Superusers see all users
        - Admins see themselves and Regular users
        - Regular users see only themselves
        """
        qs = super().get_queryset(request)

        if request.user.is_superuser:
            return qs

        if request.user.groups.filter(name='Admins').exists():
            return qs.filter(
                Q(pk=request.user.pk) |
                Q(groups__name='Regular Users') |
                Q(groups__isnull=True, is_superuser=False, is_staff=True)
            ).distinct()

        return qs.filter(pk=request.user.pk)

    # ============================================
    # PERMISSION METHODS
    # ============================================

    def has_add_permission(self, request):
        """
        Control who can add users:
        - Superusers: Can create Admins
        - Admins: Can create Regular users
        - Regular users: Cannot create users
        """
        if request.user.is_superuser:
            return True

        if request.user.groups.filter(name='Admins').exists():
            return True

        return False

    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete users"""
        return request.user.is_superuser

    # ============================================
    # FORM HANDLING
    # ============================================

    def get_form(self, request, obj=None, **kwargs):
        """
        Use custom forms based on user level:
        - Superusers: Use AdminUserCreationForm
        - Admins: Use RegularUserCreationForm
        """
        if obj is None:  # Creating new user
            if request.user.is_superuser:
                kwargs['form'] = AdminUserCreationForm
            elif request.user.groups.filter(name='Admins').exists():
                kwargs['form'] = RegularUserCreationForm

        return super().get_form(request, obj, **kwargs)

    def get_fieldsets(self, request, obj=None):
        """Customize fieldsets based on user level"""
        if obj is None:  # Creating new user
            return (
                ('Βασικά Στοιχεία', {
                    'fields': ('username', 'password1', 'password2')
                }),
                ('Προσωπικές Πληροφορίες', {
                    'fields': ('first_name', 'last_name', 'email')
                }),
            )

        if request.user.is_superuser:
            return super().get_fieldsets(request, obj)

        # Limited fieldsets for non-superusers
        return (
            ('Βασικά Στοιχεία', {
                'fields': ('username', 'password')
            }),
            ('Προσωπικές Πληροφορίες', {
                'fields': ('first_name', 'last_name', 'email')
            }),
            ('Κατάσταση', {
                'fields': ('is_active',)
            }),
            ('Ομάδες', {
                'fields': ('groups',),
                'classes': ('collapse',),
                'description': 'Οι ομάδες ορίζονται αυτόματα - Μην τις αλλάξετε χειροκίνητα'
            }),
        )

    def save_model(self, request, obj, form, change):
        """Auto-assign groups when creating users"""
        super().save_model(request, obj, form, change)

        if not change:  # Creating new user
            if request.user.is_superuser:
                admin_group = Group.objects.get(name='Admins')
                obj.groups.add(admin_group)
                obj.is_staff = True
                obj.save()
            elif request.user.groups.filter(name='Admins').exists():
                regular_group = Group.objects.get(name='Regular Users')
                obj.groups.add(regular_group)
                obj.is_staff = True
                obj.save()
