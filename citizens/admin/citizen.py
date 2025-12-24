"""
Citizen model admin configuration.

Features:
- Modern UI with Django Unfold
- Optimized queries with select_related/annotate
- Colored badges for military status and active requests
- Import/Export functionality
- Custom dashboard view link
"""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Q
from django.urls import reverse
from django.http import HttpResponseRedirect

from unfold.admin import ModelAdmin
from unfold.contrib.import_export.forms import ImportForm, ExportForm
from import_export.admin import ImportExportModelAdmin

from ..models import Citizen, MilitaryPersonnel
from .base import BadgeGeneratorMixin, MILITARY_TYPE_COLORS
from .inlines import CommunicationInline, RequestInline, MilitaryPersonnelInline


@admin.register(Citizen)
class CitizenAdmin(BadgeGeneratorMixin, ModelAdmin, ImportExportModelAdmin):
    """
    Citizen model admin with optimized queries and visual enhancements.

    Optimization:
    - Uses select_related for FK fields
    - Uses annotate for active_requests count (no N+1!)
    - Prefetch related for inlines

    UI Features:
    - Link to custom citizen dashboard
    - Colored badges for military status
    - Active requests counter with color coding
    """
    import_form_class = ImportForm
    export_form_class = ExportForm

    list_display = [
        'full_name_dashboard_link',
        'κινητο',
        'email',
        'δημος',
        'military_badge',
        'active_requests_badge',
        'αρμοδιος_συνεργατης',
        'ημερομηνια_προσθηκης'
    ]

    list_filter = [
        'δημος',
        'εκλογικη_περιφερεια',
        'κατηγορια_επαφης',
        'ιδιοτητα',
        'αρμοδιος_συνεργατης',
        'is_active',
        ('ημερομηνια_προσθηκης', admin.DateFieldListFilter),
    ]

    search_fields = [
        'επιθετο',
        'ονομα',
        'πατρωνυμο',
        'κινητο',
        'σταθερο',
        'email',
        'συσταση_απο',
        'διευθυνση'
    ]

    readonly_fields = ['ημερομηνια_προσθηκης', 'updated_at', 'archived_at']

    fieldsets = (
        ('Βασικά Στοιχεία', {
            'fields': ('επιθετο', 'ονομα', 'πατρωνυμο', 'συσταση_απο')
        }),
        ('Επικοινωνία', {
            'fields': ('κινητο', 'σταθερο', 'email')
        }),
        ('Διεύθυνση', {
            'fields': ('διευθυνση', 'τκ', 'δημος', 'περιοχη'),
            'classes': ('collapse',)
        }),
        ('Εκλογικά', {
            'fields': ('εκλογικη_περιφερεια',),
            'classes': ('collapse',)
        }),
        ('Κατηγοριοποίηση', {
            'fields': ('κατηγορια_επαφης', 'ιδιοτητα', 'αρμοδιος_συνεργατης')
        }),
        ('Παρατηρήσεις', {
            'fields': ('παρατηρησεις',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('ημερομηνια_προσθηκης', 'updated_at', 'is_active', 'archived_at'),
            'classes': ('collapse',)
        }),
    )

    inlines = [MilitaryPersonnelInline, CommunicationInline, RequestInline]

    # ============================================
    # QUERY OPTIMIZATION
    # ============================================

    def get_queryset(self, request):
        """
        Optimize queryset με select_related και annotation για active_requests_count.
        """
        qs = super().get_queryset(request)
        qs = qs.select_related('αρμοδιος_συνεργατης')
        qs = qs.annotate(
            active_requests=Count(
                'requests',
                filter=~Q(requests__κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ')
            )
        )
        return qs

    # ============================================
    # DISPLAY METHODS
    # ============================================

    def active_requests_badge(self, obj):
        """
        Display colored badge for active requests count.
        """
        count = obj.active_requests  # Uses annotated field (no extra query!)

        if count > 0:
            color = '#ffc107' if count < 3 else '#dc3545'  # Warning or Danger
            return format_html(
                '<span style="background-color: {}; color: white; padding: 3px 10px; '
                'border-radius: 10px; font-weight: bold;">{}</span>',
                color,
                count
            )
        return format_html('<span style="color: green;">✓</span>')

    active_requests_badge.short_description = 'Ενεργά Αιτήματα'
    active_requests_badge.admin_order_field = 'active_requests'

    def military_badge(self, obj):
        """
        Display badge if citizen is military personnel.
        """
        if obj.is_military_personnel:
            military = obj.military_info
            color = MILITARY_TYPE_COLORS.get(military.τυπος, '#6c757d')
            return format_html(
                '<span style="background-color: {}; color: white; padding: 3px 10px; '
                'border-radius: 10px; font-weight: bold; font-size: 11px;">{}</span>',
                color,
                military.get_τυπος_display()
            )
        return format_html('<span style="color: #999;">-</span>')

    military_badge.short_description = 'Στρατ. Προσωπικό'

    def full_name_dashboard_link(self, obj):
        """
        Display full name as link to citizen dashboard (Basic Info tab).
        """
        dashboard_url = f"{reverse('citizen_dashboard', args=[obj.pk])}?tab=basic"

        return format_html(
            '<a href="{}" style="color: #007bff; font-weight: 500; text-decoration: none;">'
            '👤 {}</a>',
            dashboard_url,
            obj.full_name
        )

    full_name_dashboard_link.short_description = 'Πολίτης'

    def quick_actions(self, obj):
        """
        Display quick access links for edit, requests, and communications.
        """
        requests_count = obj.active_requests  # From annotation
        comm_count = obj.communications.count() if hasattr(obj, 'communications') else 0

        edit_url = reverse('admin:citizens_citizen_change', args=[obj.pk])
        requests_url = f"{reverse('admin:citizens_request_changelist')}?πολιτης__id__exact={obj.pk}"
        comm_url = f"{reverse('admin:citizens_communication_changelist')}?πολιτης__id__exact={obj.pk}"

        return format_html(
            '<div style="display: flex; gap: 6px; flex-wrap: wrap;">'
            '<a href="{}" style="background: #6c757d; color: white; padding: 4px 10px; '
            'border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 500; '
            'white-space: nowrap;">✏️ Edit</a>'
            '<a href="{}" style="background: #28a745; color: white; padding: 4px 10px; '
            'border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 500; '
            'white-space: nowrap;">📝 Αιτήματα {}</a>'
            '<a href="{}" style="background: #17a2b8; color: white; padding: 4px 10px; '
            'border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 500; '
            'white-space: nowrap;">💬 Επικοινωνίες {}</a>'
            '</div>',
            edit_url,
            requests_url,
            f'({requests_count})' if requests_count > 0 else '',
            comm_url,
            f'({comm_count})' if comm_count > 0 else ''
        )

    quick_actions.short_description = 'Γρήγορες Ενέργειες'

    # ============================================
    # FORM HANDLING
    # ============================================

    def save_formset(self, request, form, formset, change):
        """
        Override to auto-sync MilitaryPersonnel basic info from parent Citizen.
        """
        if formset.model == MilitaryPersonnel:
            instances = formset.save(commit=False)
            citizen = form.instance

            for instance in instances:
                # Sync basic fields from Citizen to MilitaryPersonnel
                instance.επωνυμο = citizen.επιθετο
                instance.ονομα = citizen.ονομα
                instance.πατρωνυμο = citizen.πατρωνυμο or ''
                instance.κινητο = citizen.κινητο or ''
                instance.email = citizen.email or ''
                instance.πολιτης = citizen
                instance.save()

            for obj in formset.deleted_objects:
                obj.delete()

            formset.save_m2m()
        else:
            super().save_formset(request, form, formset, change)

    def response_change(self, request, obj):
        """
        Redirect to citizen dashboard (basic tab) after editing citizen.
        """
        dashboard_url = reverse('citizen_dashboard', args=[obj.pk])
        return HttpResponseRedirect(f"{dashboard_url}?tab=basic")
