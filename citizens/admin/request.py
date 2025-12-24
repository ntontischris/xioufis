"""
Request model admin configuration.

Features:
- Status tracking with colored badges
- Reminder system integration
- Days pending display with color coding
- Link back to citizen dashboard
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponseRedirect

from unfold.admin import ModelAdmin
from unfold.contrib.import_export.forms import ImportForm, ExportForm
from import_export.admin import ImportExportModelAdmin

from ..models import Request
from .base import CitizenDashboardLinkMixin, BadgeGeneratorMixin, STATUS_COLORS


@admin.register(Request)
class RequestAdmin(CitizenDashboardLinkMixin, BadgeGeneratorMixin, ModelAdmin, ImportExportModelAdmin):
    """
    Request model admin with status tracking and reminders.

    Features:
    - Colored status badges with overdue indication
    - Days pending counter with color coding
    - Reminder status display
    - Auto-redirect to citizen dashboard
    """
    import_form_class = ImportForm
    export_form_class = ExportForm

    # For CitizenDashboardLinkMixin
    dashboard_tab = 'requests'

    list_display = [
        'citizen_dashboard_link',
        'κατηγορια_αιτηματος',
        'status_badge',
        'ημερομηνια_αποστολης',
        'days_pending_display',
        'reminder_badge'
    ]

    list_filter = [
        'κατηγορια_αιτηματος',
        'κατασταση',
        ('ημερομηνια_αποστολης', admin.DateFieldListFilter),
        ('ημερομηνια_ολοκληρωσης', admin.DateFieldListFilter),
        'reminder_sent',
        'created_by',
    ]

    search_fields = [
        'πολιτης__επιθετο',
        'πολιτης__ονομα',
        'πολιτης__κινητο',
        'αιτημα_κειμενο',
        'παρατηρησεις'
    ]

    readonly_fields = ['created_at', 'created_by', 'updated_at', 'reminder_sent_at']

    fieldsets = (
        ('Βασικά', {
            'fields': ('πολιτης', 'κατηγορια_αιτηματος', 'κατασταση')
        }),
        ('Ημερομηνίες', {
            'fields': ('ημερομηνια_αποστολης', 'ημερομηνια_ολοκληρωσης')
        }),
        ('Αίτημα', {
            'fields': ('αιτημα_κειμενο', 'παρατηρησεις')
        }),
        ('Υπενθυμίσεις', {
            'fields': ('reminder_sent', 'reminder_sent_at'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'created_by', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # ============================================
    # QUERY OPTIMIZATION
    # ============================================

    def get_queryset(self, request):
        """Optimize με select_related"""
        qs = super().get_queryset(request)
        qs = qs.select_related('πολιτης', 'πολιτης__αρμοδιος_συνεργατης', 'created_by')
        return qs

    # ============================================
    # DISPLAY METHODS
    # ============================================

    def status_badge(self, obj):
        """Display colored status badge"""
        # Change to red if needs reminder
        if obj.needs_reminder:
            color = STATUS_COLORS['OVERDUE']
        else:
            color = STATUS_COLORS.get(obj.κατασταση, '#6c757d')

        return self.create_badge(obj.get_κατασταση_display(), color)

    status_badge.short_description = 'Κατάσταση'

    def days_pending_display(self, obj):
        """Display days pending with color coding"""
        days = obj.days_pending
        if days == 0:
            return '-'

        color = 'red' if days > 25 else 'orange' if days > 15 else 'green'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{} ημέρες</span>',
            color,
            days
        )

    days_pending_display.short_description = 'Εκκρεμεί'

    def reminder_badge(self, obj):
        """Display reminder status"""
        if obj.reminder_sent:
            return format_html('✓ <span style="color: green;">Στάλθηκε</span>')
        elif obj.needs_reminder:
            return format_html('⚠️ <span style="color: red;">Απαιτείται</span>')
        return '-'

    reminder_badge.short_description = 'Υπενθύμιση'

    # ============================================
    # FORM HANDLING
    # ============================================

    def save_model(self, request, obj, form, change):
        """Auto-set created_by on new requests"""
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def response_add(self, request, obj, post_url_continue=None):
        """Redirect to citizen dashboard after adding new request"""
        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=requests")
        return super().response_add(request, obj, post_url_continue)

    def response_change(self, request, obj):
        """Redirect to citizen dashboard after editing request"""
        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=requests")
        return super().response_change(request, obj)
