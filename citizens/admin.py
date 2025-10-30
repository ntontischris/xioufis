"""
Django Admin configuration for Citizens app

Features:
- Modern UI with Django Unfold
- Optimized queries with select_related/prefetch_related
- Colored status badges
- Import/Export functionality
- Inline editing
- Advanced filters and search
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Q, Prefetch
from django.urls import reverse
from unfold.admin import ModelAdmin
from unfold.contrib.import_export.forms import ImportForm, ExportForm
from import_export.admin import ImportExportModelAdmin
# from auditlog.admin import LogEntryAdmin  # Disabled for testing

from .models import Citizen, Communication, Request, MilitaryPersonnel


# ============================================
# INLINE ADMINS
# ============================================

class CommunicationInline(admin.TabularInline):
    """Inline για επικοινωνίες στο Citizen admin"""
    model = Communication
    extra = 1
    fields = ['ημερομηνια_επικοινωνιας', 'τυπος', 'σημειωσεις']
    readonly_fields = ['created_by', 'created_at']

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class RequestInline(admin.TabularInline):
    """Inline για αιτήματα στο Citizen admin"""
    model = Request
    extra = 0
    fields = ['κατηγορια_αιτηματος', 'κατασταση', 'ημερομηνια_αποστολης']
    readonly_fields = ['created_at']
    show_change_link = True


class MilitaryPersonnelInline(admin.StackedInline):
    """
    Inline για στρατιωτικό προσωπικό στο Citizen admin

    Τα βασικά στοιχεία (επώνυμο, όνομα, κινητό, email) συγχρονίζονται
    αυτόματα από τον Citizen - δεν χρειάζεται να τα συμπληρώσει ο χρήστης.
    """
    model = MilitaryPersonnel
    extra = 0
    can_delete = False
    verbose_name = "Στοιχεία Στρατιωτικού Προσωπικού"
    verbose_name_plural = "Στοιχεία Στρατιωτικού Προσωπικού"

    fieldsets = (
        ('Τύπος Στρατιωτικού', {
            'fields': ('τυπος',),
            'description': 'Τα βασικά στοιχεία (όνομα, επώνυμο, τηλέφωνο) θα συγχρονιστούν αυτόματα από τον Πολίτη'
        }),
        ('Στοιχεία Στρατιώτη (ΕΣΣΟ)', {
            'fields': ('εσσο_ετος', 'εσσο_γραμμα', 'ασμ', 'επιθυμια', 'κεντρο',
                      'ημερομηνια_παρουσιασης', 'τοποθετηση', 'ημερομηνια_τοποθετησης',
                      'μεταθεση_αποσπαση', 'ημερομηνια_μεταθεσης'),
            'classes': ('military-fieldset-soldier',)
        }),
        ('Στοιχεία Μόνιμου', {
            'fields': ('βαθμος', 'μοναδα_υπηρεσιας', 'επιθυμια_μονιμου', 'αμ'),
            'classes': ('military-fieldset-permanent',)
        }),
        ('Διαχείριση', {
            'fields': ('παρατηρησεις',),
            'classes': ('collapse',)
        }),
    )

    class Media:
        """Load custom JavaScript and CSS for dynamic fieldsets"""
        js = ('citizens/js/military_personnel_admin.js',)
        css = {
            'all': ('citizens/css/military_personnel_admin.css',)
        }


# ============================================
# CITIZEN ADMIN
# ============================================

@admin.register(Citizen)
class CitizenAdmin(ModelAdmin, ImportExportModelAdmin):
    """
    Citizen model admin with optimized queries and visual enhancements (Unfold UI)
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

    # OPTIMIZATION: Reduce N+1 queries
    def get_queryset(self, request):
        """
        Optimize queryset με select_related και annotation για active_requests_count
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

    def active_requests_badge(self, obj):
        """
        Display colored badge for active requests count
        """
        count = obj.active_requests  # Uses annotated field (no extra query!)

        if count > 0:
            color = 'warning' if count < 3 else 'danger'
            return format_html(
                '<span style="background-color: {}; color: white; padding: 3px 10px; '
                'border-radius: 10px; font-weight: bold;">{}</span>',
                '#ffc107' if color == 'warning' else '#dc3545',
                count
            )
        return format_html('<span style="color: green;">✓</span>')

    active_requests_badge.short_description = 'Ενεργά Αιτήματα'
    active_requests_badge.admin_order_field = 'active_requests'  # Make it sortable

    def military_badge(self, obj):
        """
        Display badge if citizen is military personnel
        """
        if obj.is_military_personnel:
            military = obj.military_info
            colors = {
                'ΣΤΡΑΤΙΩΤΗΣ': '#17a2b8',  # Cyan
                'ΜΟΝΙΜΟΣ': '#28a745',      # Green
            }
            return format_html(
                '<span style="background-color: {}; color: white; padding: 3px 10px; '
                'border-radius: 10px; font-weight: bold; font-size: 11px;">{}</span>',
                colors.get(military.τυπος, '#6c757d'),
                military.get_τυπος_display()
            )
        return format_html('<span style="color: #999;">-</span>')

    military_badge.short_description = 'Στρατ. Προσωπικό'

    def full_name_dashboard_link(self, obj):
        """
        Display full name as link to citizen dashboard (Basic Info tab)
        """
        from django.urls import reverse

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
        Display quick access links for edit, requests, and communications
        """
        from django.urls import reverse

        # Get counts (using annotated field for requests)
        requests_count = obj.active_requests  # From annotation

        # Count communications (already prefetched if queryset is optimized)
        # For list view, we'll use a simple count to avoid extra queries
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

    def save_formset(self, request, form, formset, change):
        """
        Override to auto-sync MilitaryPersonnel basic info from parent Citizen
        """
        # Only process MilitaryPersonnel formsets
        if formset.model == MilitaryPersonnel:
            instances = formset.save(commit=False)

            # Get the parent citizen
            citizen = form.instance

            for instance in instances:
                # Sync basic fields from Citizen to MilitaryPersonnel
                instance.επωνυμο = citizen.επιθετο
                instance.ονομα = citizen.ονομα
                instance.πατρωνυμο = citizen.πατρωνυμο or ''
                instance.κινητο = citizen.κινητο or ''
                instance.email = citizen.email or ''

                # Set the citizen relationship (should already be set, but ensure it)
                instance.πολιτης = citizen

                instance.save()

            # Handle deletions
            for obj in formset.deleted_objects:
                obj.delete()

            # Save m2m relationships
            formset.save_m2m()
        else:
            # For other formsets, use default behavior
            super().save_formset(request, form, formset, change)

    def response_change(self, request, obj):
        """
        Redirect to citizen dashboard (basic tab) after editing citizen
        """
        from django.http import HttpResponseRedirect
        from django.urls import reverse

        dashboard_url = reverse('citizen_dashboard', args=[obj.pk])
        return HttpResponseRedirect(f"{dashboard_url}?tab=basic")


# ============================================
# REQUEST ADMIN
# ============================================

@admin.register(Request)
class RequestAdmin(ModelAdmin, ImportExportModelAdmin):
    """
    Request model admin with status tracking and reminders (Unfold UI)
    """
    import_form_class = ImportForm
    export_form_class = ExportForm

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

    # OPTIMIZATION: Reduce N+1 queries
    def get_queryset(self, request):
        """Optimize με select_related"""
        qs = super().get_queryset(request)
        qs = qs.select_related('πολιτης', 'πολιτης__αρμοδιος_συνεργατης', 'created_by')
        return qs

    def citizen_dashboard_link(self, obj):
        """
        Display citizen name as link to dashboard with requests tab open
        """
        from django.urls import reverse

        if not obj.πολιτης:
            return '-'

        dashboard_url = f"{reverse('citizen_dashboard', args=[obj.πολιτης.pk])}?tab=requests"

        return format_html(
            '<a href="{}" style="color: #007bff; font-weight: 500; text-decoration: none;">'
            '👤 {}</a>',
            dashboard_url,
            obj.πολιτης.full_name
        )

    citizen_dashboard_link.short_description = 'Πολίτης'
    citizen_dashboard_link.admin_order_field = 'πολιτης__επιθετο'  # Make it sortable

    def status_badge(self, obj):
        """Display colored status badge"""
        colors = {
            'ΟΛΟΚΛΗΡΩΜΕΝΟ': '#28a745',
            'ΕΚΚΡΕΜΕΙ': '#ffc107',
            'ΜΗ_ΟΛΟΚΛΗΡΩΜΕΝΟ': '#6c757d'
        }

        # Change to red if needs reminder
        if obj.needs_reminder:
            color = '#dc3545'
        else:
            color = colors.get(obj.κατασταση, '#6c757d')

        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 12px; '
            'border-radius: 12px; font-weight: bold; display: inline-block;">{}</span>',
            color,
            obj.get_κατασταση_display()
        )

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

    def save_model(self, request, obj, form, change):
        """Auto-set created_by on new requests"""
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def response_add(self, request, obj, post_url_continue=None):
        """
        Redirect to citizen dashboard (requests tab) after adding new request
        """
        from django.http import HttpResponseRedirect
        from django.urls import reverse

        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=requests")

        return super().response_add(request, obj, post_url_continue)

    def response_change(self, request, obj):
        """
        Redirect to citizen dashboard (requests tab) after editing request
        """
        from django.http import HttpResponseRedirect
        from django.urls import reverse

        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=requests")

        return super().response_change(request, obj)


# ============================================
# COMMUNICATION ADMIN
# ============================================

@admin.register(Communication)
class CommunicationAdmin(ModelAdmin):
    """
    Communication history admin (Unfold UI)
    """

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

    # OPTIMIZATION
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        qs = qs.select_related('πολιτης', 'created_by')
        return qs

    def citizen_dashboard_link(self, obj):
        """
        Display citizen name as link to dashboard with communications tab open
        """
        from django.urls import reverse

        if not obj.πολιτης:
            return '-'

        dashboard_url = f"{reverse('citizen_dashboard', args=[obj.πολιτης.pk])}?tab=communications"

        return format_html(
            '<a href="{}" style="color: #007bff; font-weight: 500; text-decoration: none;">'
            '👤 {}</a>',
            dashboard_url,
            obj.πολιτης.full_name
        )

    citizen_dashboard_link.short_description = 'Πολίτης'
    citizen_dashboard_link.admin_order_field = 'πολιτης__επιθετο'  # Make it sortable

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def response_add(self, request, obj, post_url_continue=None):
        """
        Redirect to citizen dashboard (communications tab) after adding new communication
        """
        from django.http import HttpResponseRedirect
        from django.urls import reverse

        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=communications")

        return super().response_add(request, obj, post_url_continue)

    def response_change(self, request, obj):
        """
        Redirect to citizen dashboard (communications tab) after editing communication
        """
        from django.http import HttpResponseRedirect
        from django.urls import reverse

        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=communications")

        return super().response_change(request, obj)


# ============================================
# MILITARY PERSONNEL ADMIN
# ============================================

@admin.register(MilitaryPersonnel)
class MilitaryPersonnelAdmin(ModelAdmin, ImportExportModelAdmin):
    """
    Στρατιωτικό Προσωπικό admin με αυτόματη δημιουργία Citizen (Unfold UI)

    Features:
    - Auto-creates Citizen when saving MilitaryPersonnel
    - Conditional fieldsets based on τυπος (Στρατιώτης vs Μόνιμος)
    - Optimized queries with select_related
    """
    import_form_class = ImportForm
    export_form_class = ExportForm

    list_display = [
        'citizen_dashboard_link',
        'ονομα',
        'τυπος_badge',
        'rank_or_esso_display',
        'κινητο',
        'αρμοδιος_συνεργατης',
        'created_at'
    ]

    list_filter = [
        'τυπος',
        'εσσο_ετος',
        'εσσο_γραμμα',
        'βαθμος',
        'αρμοδιος_συνεργατης',
        ('created_at', admin.DateFieldListFilter)
    ]

    search_fields = [
        'επωνυμο',
        'ονομα',
        'πατρωνυμο',
        'κινητο',
        'email',
        'ασμ',
        'αμ',
        'βαθμος'
    ]

    readonly_fields = ['πολιτης', 'created_at', 'updated_at', 'created_by']

    fieldsets = (
        ('Τύπος Στρατιωτικού Προσωπικού', {
            'fields': ('τυπος',),
            'description': 'Επιλέξτε αν πρόκειται για Στρατιώτη ή Μόνιμο'
        }),
        ('Βασικά Στοιχεία', {
            'fields': ('επωνυμο', 'ονομα', 'πατρωνυμο'),
            'description': 'Θα δημιουργηθεί αυτόματα Πολίτης με αυτά τα στοιχεία'
        }),
        ('Επικοινωνία', {
            'fields': ('κινητο', 'email')
        }),
        ('Στοιχεία Στρατιώτη (ΕΣΣΟ)', {
            'fields': (
                'εσσο_ετος', 'εσσο_γραμμα', 'ασμ',
                'επιθυμια', 'κεντρο', 'ημερομηνια_παρουσιασης',
                'τοποθετηση', 'ημερομηνια_τοποθετησης',
                'μεταθεση_αποσπαση', 'ημερομηνια_μεταθεσης'
            ),
            'classes': ('military-fieldset-soldier',),
            'description': 'Πεδία για Στρατιώτες - Εμφανίζονται αυτόματα όταν επιλέγεται Στρατιώτης'
        }),
        ('Στοιχεία Μόνιμου', {
            'fields': (
                'βαθμος', 'μοναδα_υπηρεσιας',
                'επιθυμια_μονιμου', 'αμ'
            ),
            'classes': ('military-fieldset-permanent',),
            'description': 'Πεδία για Μόνιμους - Εμφανίζονται αυτόματα όταν επιλέγεται Μόνιμος'
        }),
        ('Διαχείριση', {
            'fields': ('αρμοδιος_συνεργατης', 'παρατηρησεις')
        }),
        ('Σύνδεση με Πολίτη', {
            'fields': ('πολιτης',),
            'classes': ('collapse',),
            'description': 'Δημιουργείται αυτόματα - Μην το επεξεργαστείτε χειροκίνητα'
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )

    # OPTIMIZATION: Reduce N+1 queries
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        qs = qs.select_related('πολιτης', 'αρμοδιος_συνεργατης', 'created_by')
        return qs

    def citizen_dashboard_link(self, obj):
        """
        Display citizen full name as link to dashboard (Military tab)
        """
        from django.urls import reverse

        if not obj.πολιτης:
            return '-'

        dashboard_url = f"{reverse('citizen_dashboard', args=[obj.πολιτης.pk])}?tab=military"

        return format_html(
            '<a href="{}" style="color: #007bff; font-weight: 500; text-decoration: none;">'
            '👤 {}</a>',
            dashboard_url,
            obj.πολιτης.full_name
        )

    citizen_dashboard_link.short_description = 'Πολίτης'

    def τυπος_badge(self, obj):
        """Display type as colored badge"""
        colors = {
            'ΣΤΡΑΤΙΩΤΗΣ': '#17a2b8',  # Cyan
            'ΜΟΝΙΜΟΣ': '#28a745',      # Green
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 12px; '
            'border-radius: 12px; font-weight: bold; display: inline-block;">{}</span>',
            colors.get(obj.τυπος, '#6c757d'),
            obj.get_τυπος_display()
        )

    τυπος_badge.short_description = 'Τύπος'

    def rank_or_esso_display(self, obj):
        """Display ΕΣΣΟ for στρατιώτης or rank for μόνιμος"""
        if obj.τυπος == obj.ΤυποςChoices.ΣΤΡΑΤΙΩΤΗΣ and obj.εσσο:
            return format_html(
                '<span style="background-color: #007bff; color: white; padding: 3px 8px; '
                'border-radius: 8px; font-weight: bold;">ΕΣΣΟ: {}</span>',
                obj.εσσο
            )
        elif obj.τυπος == obj.ΤυποςChoices.ΜΟΝΙΜΟΣ and obj.βαθμος:
            return format_html(
                '<span style="background-color: #ffc107; color: black; padding: 3px 8px; '
                'border-radius: 8px; font-weight: bold;">Βαθμός: {}</span>',
                obj.βαθμος
            )
        return '-'

    rank_or_esso_display.short_description = 'ΕΣΣΟ / Βαθμός'

    def save_model(self, request, obj, form, change):
        """Auto-set created_by on new military personnel"""
        if not obj.pk:
            obj.created_by = request.user
        # Signal will auto-create Citizen if πολιτης is None
        super().save_model(request, obj, form, change)

    def response_add(self, request, obj, post_url_continue=None):
        """
        Redirect to citizen dashboard (military tab) after adding new military personnel
        """
        from django.http import HttpResponseRedirect
        from django.urls import reverse

        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=military")

        return super().response_add(request, obj, post_url_continue)

    def response_change(self, request, obj):
        """
        Redirect to citizen dashboard (military tab) after editing military personnel
        """
        from django.http import HttpResponseRedirect
        from django.urls import reverse

        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=military")

        return super().response_change(request, obj)

    class Media:
        """Load custom JavaScript and CSS for dynamic fieldsets"""
        js = ('citizens/js/military_personnel_admin.js',)
        css = {
            'all': ('citizens/css/military_personnel_admin.css',)
        }


# Register Audit Log models
# This will show activity logs in admin
