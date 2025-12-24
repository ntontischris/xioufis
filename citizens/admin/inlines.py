"""
Inline admin classes for citizens app.

Provides inline editing capabilities:
- CommunicationInline: Tabular inline for communication history
- RequestInline: Tabular inline for citizen requests
- MilitaryPersonnelInline: Stacked inline for military data
"""
from django.contrib import admin

from ..models import Communication, Request, MilitaryPersonnel


class CommunicationInline(admin.TabularInline):
    """
    Inline για επικοινωνίες στο Citizen admin.

    Features:
    - Quick add communication entries
    - Auto-set created_by to current user
    - Compact tabular layout
    """
    model = Communication
    extra = 1
    fields = ['ημερομηνια_επικοινωνιας', 'τυπος', 'σημειωσεις']
    readonly_fields = ['created_by', 'created_at']

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class RequestInline(admin.TabularInline):
    """
    Inline για αιτήματα στο Citizen admin.

    Features:
    - View and quick-edit requests
    - Link to full request detail view
    - Read-only created_at timestamp
    """
    model = Request
    extra = 0
    fields = ['κατηγορια_αιτηματος', 'κατασταση', 'ημερομηνια_αποστολης']
    readonly_fields = ['created_at']
    show_change_link = True


class MilitaryPersonnelInline(admin.StackedInline):
    """
    Inline για στρατιωτικό προσωπικό στο Citizen admin.

    Features:
    - Βασικά στοιχεία συγχρονίζονται αυτόματα από τον Citizen
    - Conditional fieldsets (Στρατιώτης vs Μόνιμος) via JavaScript
    - Custom CSS for fieldset visibility

    Note:
        Basic info (επώνυμο, όνομα, κινητό, email) is auto-synced
        from parent Citizen - users don't need to fill these.
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
