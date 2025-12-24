"""
MilitaryPersonnel model admin configuration.

Features:
- Auto-creates linked Citizen (via signal)
- Conditional fieldsets (Στρατιώτης vs Μόνιμος)
- Import/Export functionality
- Type and rank/ΕΣΣΟ badges
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponseRedirect

from unfold.admin import ModelAdmin
from unfold.contrib.import_export.forms import ImportForm, ExportForm
from import_export.admin import ImportExportModelAdmin

from ..models import MilitaryPersonnel
from .base import CitizenDashboardLinkMixin, BadgeGeneratorMixin, MILITARY_TYPE_COLORS


@admin.register(MilitaryPersonnel)
class MilitaryPersonnelAdmin(CitizenDashboardLinkMixin, BadgeGeneratorMixin, ModelAdmin, ImportExportModelAdmin):
    """
    Στρατιωτικό Προσωπικό admin με αυτόματη δημιουργία Citizen.

    Features:
    - Auto-creates Citizen when saving MilitaryPersonnel (via signal)
    - Conditional fieldsets based on τυπος (Στρατιώτης vs Μόνιμος)
    - Colored badges for type and rank/ΕΣΣΟ
    - Import/Export functionality
    """
    import_form_class = ImportForm
    export_form_class = ExportForm

    # For CitizenDashboardLinkMixin
    dashboard_tab = 'military'

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

    # ============================================
    # QUERY OPTIMIZATION
    # ============================================

    def get_queryset(self, request):
        """Optimize με select_related"""
        qs = super().get_queryset(request)
        qs = qs.select_related('πολιτης', 'αρμοδιος_συνεργατης', 'created_by')
        return qs

    # ============================================
    # DISPLAY METHODS
    # ============================================

    def τυπος_badge(self, obj):
        """Display type as colored badge"""
        color = MILITARY_TYPE_COLORS.get(obj.τυπος, '#6c757d')
        return self.create_badge(obj.get_τυπος_display(), color)

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

    # ============================================
    # FORM HANDLING
    # ============================================

    def save_model(self, request, obj, form, change):
        """Auto-set created_by on new military personnel"""
        if not obj.pk:
            obj.created_by = request.user
        # Signal will auto-create Citizen if πολιτης is None
        super().save_model(request, obj, form, change)

    def response_add(self, request, obj, post_url_continue=None):
        """Redirect to citizen dashboard after adding new military personnel"""
        if obj.πολιτης:
            dashboard_url = reverse('citizen_dashboard', args=[obj.πολιτης.pk])
            return HttpResponseRedirect(f"{dashboard_url}?tab=military")
        return super().response_add(request, obj, post_url_continue)

    def response_change(self, request, obj):
        """Redirect to citizen dashboard after editing military personnel"""
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
