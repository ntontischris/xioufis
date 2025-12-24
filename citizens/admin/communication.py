"""
Communication model admin configuration.

Features:
- Communication history tracking
- Link back to citizen dashboard
- Auto-set created_by user
"""
from django.contrib import admin
from django.urls import reverse
from django.http import HttpResponseRedirect

from unfold.admin import ModelAdmin

from ..models import Communication
from .base import CitizenDashboardLinkMixin


@admin.register(Communication)
class CommunicationAdmin(CitizenDashboardLinkMixin, ModelAdmin):
    """
    Communication history admin.

    Features:
    - Displays communication type and date
    - Links to citizen dashboard (communications tab)
    - Auto-sets created_by on new records
    """

    # For CitizenDashboardLinkMixin
    dashboard_tab = 'communications'

    list_display = [
        'citizen_dashboard_link',
        'ημερομηνια_επικοινωνιας',
        'τυπος',
        'created_by',
        'created_at'
    ]

    list_filter = [
        'τυπος',
        ('ημερομηνια_επικοινωνιας', admin.DateFieldListFilter),
        'created_by'
    ]

    search_fields = [
        'πολιτης__επιθετο',
        'πολιτης__ονομα',
        'σημειωσεις'
    ]

    readonly_fields = ['created_by', 'created_at']

    fieldsets = (
        ('Βασικά', {
            'fields': ('πολιτης', 'ημερομηνια_επικοινωνιας', 'τυπος')
        }),
        ('Σημειώσεις', {
            'fields': ('σημειωσεις',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )

    # ============================================
    # QUERY OPTIMIZATION
    # ============================================

    def get_queryset(self, request):
        """Optimize με select_related"""
        qs = super().get_queryset(request)
        qs = qs.select_related('πολιτης', 'created_by')
        return qs

    # ============================================
    # FORM HANDLING
    # ============================================

    def save_model(self, request, obj, form, change):
        """Auto-set created_by on new communications"""
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def response_add(self, request, obj, post_url_continue=None):
        """Redirect to citizen dashboard after adding new communication"""
        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=communications")
        return super().response_add(request, obj, post_url_continue)

    def response_change(self, request, obj):
        """Redirect to citizen dashboard after editing communication"""
        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=communications")
        return super().response_change(request, obj)
