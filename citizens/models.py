"""
Django models for Political CRM System

Models:
- Citizen: Main citizen contact information
- Communication: Communication history with citizens
- Request: Citizen requests tracking
- MilitaryPersonnel: Military personnel data linked to Citizen
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import date, timedelta


# ============================================
# SHARED VALIDATORS
# ============================================

# Greek phone number validator (shared between Citizen and MilitaryPersonnel)
GREEK_PHONE_VALIDATOR = RegexValidator(
    regex=r'^(\+30)?[2-9][0-9]{9}$',
    message='Εισάγετε έγκυρο ελληνικό τηλέφωνο (10 ψηφία, π.χ. 2310123456 ή 6912345678)'
)

# Greek postal code validator
GREEK_POSTAL_CODE_VALIDATOR = RegexValidator(
    regex=r'^[0-9]{5}$',
    message='Εισάγετε έγκυρο 5ψήφιο ΤΚ'
)


class Citizen(models.Model):
    """
    Καρτέλα πολίτη με πλήρη στοιχεία επικοινωνίας και κατηγοριοποίηση.

    Business Rules:
    - Τουλάχιστον ένα από (κινητό, σταθερό, email) είναι required
    - Το επίθετο + όνομα + κινητό πρέπει να είναι unique για active citizens
    - Soft delete (is_active=False αντί για διαγραφή)

    Usage:
        citizen = Citizen.objects.create(
            επιθετο="Παπάς",
            ονομα="Γιάννης",
            κινητο="6912345678"
        )
    """

    # ============================================
    # ΒΑΣΙΚΑ ΣΤΟΙΧΕΙΑ
    # ============================================

    επιθετο = models.CharField(
        max_length=100,
        verbose_name="Επίθετο",
        db_index=True,
        help_text="Το επώνυμο του πολίτη"
    )

    ονομα = models.CharField(
        max_length=100,
        verbose_name="Όνομα",
        db_index=True,
        help_text="Το όνομα του πολίτη"
    )

    πατρωνυμο = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Πατρώνυμο"
    )

    συσταση_απο = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Σύσταση Από",
        db_index=True,
        help_text="Ποιος σύστησε τον πολίτη"
    )

    # ============================================
    # ΕΠΙΚΟΙΝΩΝΙΑ
    # ============================================

    κινητο = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Κινητό Τηλέφωνο",
        validators=[GREEK_PHONE_VALIDATOR],
        help_text="Μορφή: 6912345678 ή +306912345678"
    )

    σταθερο = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Σταθερό Τηλέφωνο",
        validators=[GREEK_PHONE_VALIDATOR],
        help_text="Μορφή: 2310123456 ή +302310123456"
    )

    email = models.EmailField(
        blank=True,
        verbose_name="Email",
        db_index=True
    )

    # ============================================
    # ΔΙΕΥΘΥΝΣΗ
    # ============================================

    διευθυνση = models.CharField(
        max_length=300,
        blank=True,
        verbose_name="Διεύθυνση",
        help_text="Οδός και αριθμός"
    )

    τκ = models.CharField(
        max_length=10,
        blank=True,
        verbose_name="ΤΚ",
        validators=[GREEK_POSTAL_CODE_VALIDATOR]
    )

    class ΔημοιChoices(models.TextChoices):
        ΠΑΥΛΟΥ_ΜΕΛΑ = 'ΠΑΥΛΟΥ_ΜΕΛΑ', 'Παύλου Μελά'
        ΚΟΡΔΕΛΙΟΥ_ΕΥΟΣΜΟΥ = 'ΚΟΡΔΕΛΙΟΥ_ΕΥΟΣΜΟΥ', 'Κορδελίου-Ευόσμου'
        ΑΜΠΕΛΟΚΗΠΩΝ_ΜΕΝΕΜΕΝΗΣ = 'ΑΜΠΕΛΟΚΗΠΩΝ_ΜΕΝΕΜΕΝΗΣ', 'Αμπελοκήπων-Μενεμένης'
        ΝΕΑΠΟΛΗΣ_ΣΥΚΕΩΝ = 'ΝΕΑΠΟΛΗΣ_ΣΥΚΕΩΝ', 'Νεάπολης-Συκεών'
        ΘΕΣΣΑΛΟΝΙΚΗΣ = 'ΘΕΣΣΑΛΟΝΙΚΗΣ', 'Θεσσαλονίκης'
        ΚΑΛΑΜΑΡΙΑΣ = 'ΚΑΛΑΜΑΡΙΑΣ', 'Καλαμαριάς'
        ΑΛΛΟ = 'ΑΛΛΟ', 'Άλλο'

    δημος = models.CharField(
        max_length=50,
        choices=ΔημοιChoices.choices,
        blank=True,
        verbose_name="Δήμος",
        db_index=True
    )

    περιοχη = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Περιοχή"
    )

    # ============================================
    # ΕΚΛΟΓΙΚΑ
    # ============================================

    class ΕκλογικηΠεριφερειαChoices(models.TextChoices):
        Α_ΘΕΣΣΑΛΟΝΙΚΗΣ = 'Α_ΘΕΣΣΑΛΟΝΙΚΗΣ', "Α' Θεσσαλονίκης"
        Β_ΘΕΣΣΑΛΟΝΙΚΗΣ = 'Β_ΘΕΣΣΑΛΟΝΙΚΗΣ', "Β' Θεσσαλονίκης"
        ΑΛΛΟ = 'ΑΛΛΟ', 'Άλλο'

    εκλογικη_περιφερεια = models.CharField(
        max_length=50,
        choices=ΕκλογικηΠεριφερειαChoices.choices,
        blank=True,
        verbose_name="Εκλογική Περιφέρεια",
        db_index=True
    )

    # ============================================
    # ΚΑΤΗΓΟΡΙΟΠΟΙΗΣΗ
    # ============================================

    class ΚατηγορίαΕπαφήςChoices(models.TextChoices):
        GDPR = 'GDPR', 'GDPR'
        ΑΙΤΗΜΑ = 'ΑΙΤΗΜΑ', 'Αίτημα'
        GDPR_ΚΑΙ_ΑΙΤΗΜΑ = 'GDPR_ΚΑΙ_ΑΙΤΗΜΑ', 'GDPR και Αίτημα'

    κατηγορια_επαφης = models.CharField(
        max_length=50,
        choices=ΚατηγορίαΕπαφήςChoices.choices,
        default=ΚατηγορίαΕπαφήςChoices.GDPR,
        verbose_name="Κατηγορία Επαφής",
        db_index=True
    )

    ιδιοτητα = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Ιδιότητα",
        db_index=True,
        help_text="π.χ. Φοιτητής, Συνταξιούχος, Επιχειρηματίας"
    )

    # ============================================
    # METADATA & SOFT DELETE
    # ============================================

    ημερομηνια_προσθηκης = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Ημερομηνία Προσθήκης"
    )

    αρμοδιος_συνεργατης = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_citizens',
        verbose_name="Αρμόδιος Συνεργάτης",
        help_text="Ποιος χειρίζεται αυτόν τον πολίτη"
    )

    παρατηρησεις = models.TextField(
        blank=True,
        verbose_name="Παρατηρήσεις"
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name="Ενεργός",
        help_text="Αποεπιλέξτε για να αρχειοθετήσετε (soft delete)"
    )

    archived_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Αρχειοθετήθηκε στις"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Τελευταία Ενημέρωση"
    )

    class Meta:
        verbose_name = "Πολίτης"
        verbose_name_plural = "Πολίτες"
        ordering = ['-ημερομηνια_προσθηκης']
        indexes = [
            models.Index(fields=['επιθετο', 'ονομα']),
            models.Index(fields=['δημος', 'εκλογικη_περιφερεια']),
            models.Index(fields=['-ημερομηνια_προσθηκης']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['επιθετο', 'ονομα', 'κινητο'],
                condition=models.Q(is_active=True),
                name='unique_active_citizen'
            )
        ]

    def __str__(self):
        return f"{self.επιθετο} {self.ονομα}"

    def clean(self):
        """Validation: At least one contact method required"""
        if not any([self.κινητο, self.σταθερο, self.email]):
            raise ValidationError(
                'Τουλάχιστον ένα από (Κινητό, Σταθερό, Email) είναι υποχρεωτικό'
            )

    def save(self, *args, **kwargs):
        """Auto-set archived_at when is_active changes to False"""
        if not self.is_active and not self.archived_at:
            self.archived_at = timezone.now()
        elif self.is_active and self.archived_at:
            self.archived_at = None
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        """Returns full name with patronymic"""
        if self.πατρωνυμο:
            return f"{self.επιθετο} {self.ονομα} ({self.πατρωνυμο})"
        return f"{self.επιθετο} {self.ονομα}"

    @property
    def active_requests_count(self):
        """Count of non-completed requests"""
        return self.requests.exclude(
            κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ'
        ).count()

    @property
    def last_contact_date(self):
        """Date of last communication"""
        last_comm = self.communications.first()
        return last_comm.ημερομηνια_επικοινωνιας if last_comm else None

    @property
    def is_military_personnel(self):
        """Check if citizen is military personnel"""
        return hasattr(self, 'military_personnel') and self.military_personnel is not None

    @property
    def military_info(self):
        """Get military personnel info if exists"""
        if self.is_military_personnel:
            return self.military_personnel
        return None

    @property
    def military_type_display(self):
        """Display military type badge"""
        if self.is_military_personnel:
            return self.military_personnel.get_τυπος_display()
        return None


class Communication(models.Model):
    """
    Ιστορικό επικοινωνίας με πολίτη.
    Κάθε επαφή καταγράφεται για follow-up και accountability.
    """

    πολιτης = models.ForeignKey(
        Citizen,
        on_delete=models.CASCADE,
        related_name='communications',
        verbose_name="Πολίτης"
    )

    ημερομηνια_επικοινωνιας = models.DateField(
        verbose_name="Ημερομηνία Επικοινωνίας",
        db_index=True,
        help_text="Πότε έγινε η επικοινωνία"
    )

    class ΤυποςΕπικοινωνιαςChoices(models.TextChoices):
        ΤΗΛΕΦΩΝΟ = 'ΤΗΛΕΦΩΝΟ', 'Τηλεφώνημα'
        EMAIL = 'EMAIL', 'Email'
        ΠΡΟΣΩΠΙΚΗ = 'ΠΡΟΣΩΠΙΚΗ', 'Προσωπική Επίσκεψη'
        SMS = 'SMS', 'SMS'
        ΑΛΛΟ = 'ΑΛΛΟ', 'Άλλο'

    τυπος = models.CharField(
        max_length=20,
        choices=ΤυποςΕπικοινωνιαςChoices.choices,
        default=ΤυποςΕπικοινωνιαςChoices.ΤΗΛΕΦΩΝΟ,
        verbose_name="Τύπος Επικοινωνίας"
    )

    σημειωσεις = models.TextField(
        blank=True,
        verbose_name="Σημειώσεις",
        help_text="Τι συζητήθηκε / τι ειπώθηκε"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Καταχωρήθηκε από"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Καταχωρήθηκε στις"
    )

    class Meta:
        verbose_name = "Επικοινωνία"
        verbose_name_plural = "Επικοινωνίες"
        ordering = ['-ημερομηνια_επικοινωνιας', '-created_at']
        indexes = [
            models.Index(fields=['-ημερομηνια_επικοινωνιας']),
        ]

    def __str__(self):
        return f"{self.πολιτης} - {self.ημερομηνια_επικοινωνιας}"


class Request(models.Model):
    """
    Αίτημα πολίτη με tracking κατάστασης και reminders.

    Business Rules:
    - Όταν κατάσταση = ΟΛΟΚΛΗΡΩΜΕΝΟ, required ημερομηνια_ολοκληρωσης
    - Reminder email αν ΕΚΚΡΕΜΕΙ > 25 ημέρες
    - Audit trail για κάθε status change
    """

    πολιτης = models.ForeignKey(
        Citizen,
        on_delete=models.CASCADE,
        related_name='requests',
        verbose_name="Πολίτης"
    )

    class ΚατηγορίαΑιτήματοςChoices(models.TextChoices):
        ΣΤΡΑΤΙΩΤΙΚΟ = 'ΣΤΡΑΤΙΩΤΙΚΟ', 'Στρατιωτικό'
        ΙΑΤΡΙΚΟ = 'ΙΑΤΡΙΚΟ', 'Ιατρικό'
        ΑΣΤΥΝΟΜΙΚΟ = 'ΑΣΤΥΝΟΜΙΚΟ', 'Αστυνομικό'
        ΠΥΡΟΣΒΕΣΤΙΚΗ = 'ΠΥΡΟΣΒΕΣΤΙΚΗ', 'Πυροσβεστική'
        ΠΑΙΔΕΙΑΣ = 'ΠΑΙΔΕΙΑΣ', 'Παιδείας'
        ΔΙΟΙΚΗΤΙΚΟ = 'ΔΙΟΙΚΗΤΙΚΟ', 'Διοικητικό'
        ΕΥΡΕΣΗ_ΕΡΓΑΣΙΑΣ = 'ΕΥΡΕΣΗ_ΕΡΓΑΣΙΑΣ', 'Εύρεση Εργασίας'
        ΕΦΚΑ = 'ΕΦΚΑ', 'ΕΦΚΑ'
        ΑΛΛΟ = 'ΑΛΛΟ', 'Άλλο'

    κατηγορια_αιτηματος = models.CharField(
        max_length=30,
        choices=ΚατηγορίαΑιτήματοςChoices.choices,
        verbose_name="Κατηγορία Αιτήματος",
        db_index=True
    )

    class ΚατάστασηChoices(models.TextChoices):
        ΟΛΟΚΛΗΡΩΜΕΝΟ = 'ΟΛΟΚΛΗΡΩΜΕΝΟ', 'Ολοκληρωμένο'
        ΜΗ_ΟΛΟΚΛΗΡΩΜΕΝΟ = 'ΜΗ_ΟΛΟΚΛΗΡΩΜΕΝΟ', 'Μη Ολοκληρωμένο'
        ΕΚΚΡΕΜΕΙ = 'ΕΚΚΡΕΜΕΙ', 'Εκκρεμεί'

    κατασταση = models.CharField(
        max_length=30,
        choices=ΚατάστασηChoices.choices,
        default=ΚατάστασηChoices.ΕΚΚΡΕΜΕΙ,
        verbose_name="Κατάσταση",
        db_index=True
    )

    ημερομηνια_αποστολης = models.DateField(
        null=True,
        blank=True,
        verbose_name="Ημερομηνία Αποστολής",
        db_index=True,
        help_text="Πότε στάλθηκε το αίτημα"
    )

    ημερομηνια_ολοκληρωσης = models.DateField(
        null=True,
        blank=True,
        verbose_name="Ημερομηνία Ολοκλήρωσης",
        help_text="Πότε ολοκληρώθηκε το αίτημα"
    )

    αιτημα_κειμενο = models.TextField(
        verbose_name="Αίτημα",
        help_text="Αναλυτική περιγραφή του αιτήματος"
    )

    παρατηρησεις = models.TextField(
        blank=True,
        verbose_name="Παρατηρήσεις"
    )

    # Reminders
    reminder_sent = models.BooleanField(
        default=False,
        verbose_name="Υπενθύμιση Στάλθηκε"
    )

    reminder_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Στάλθηκε υπενθύμιση στις"
    )

    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Δημιουργήθηκε στις"
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_requests',
        verbose_name="Δημιουργήθηκε από"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Τελευταία Ενημέρωση"
    )

    class Meta:
        verbose_name = "Αίτημα"
        verbose_name_plural = "Αιτήματα"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['κατασταση', '-ημερομηνια_αποστολης']),
            models.Index(fields=['κατηγορια_αιτηματος', 'κατασταση']),
        ]

    def __str__(self):
        return f"{self.πολιτης} - {self.get_κατηγορια_αιτηματος_display()}"

    def clean(self):
        """Validation rules"""
        # FIXED: Add proper date validation
        if self.κατασταση == self.ΚατάστασηChoices.ΟΛΟΚΛΗΡΩΜΕΝΟ:
            if not self.ημερομηνια_ολοκληρωσης:
                raise ValidationError({
                    'ημερομηνια_ολοκληρωσης':
                    'Απαιτείται ημερομηνία ολοκλήρωσης για ολοκληρωμένα αιτήματα'
                })

        # FIXED: Ensure completion date is after submission date
        if (self.ημερομηνια_αποστολης and self.ημερομηνια_ολοκληρωσης and
            self.ημερομηνια_ολοκληρωσης < self.ημερομηνια_αποστολης):
            raise ValidationError({
                'ημερομηνια_ολοκληρωσης':
                'Η ημερομηνία ολοκλήρωσης δεν μπορεί να είναι πριν την ημερομηνία αποστολής'
            })

    @property
    def needs_reminder(self):
        """Check if reminder needed (>25 days pending)"""
        if (self.κατασταση == self.ΚατάστασηChoices.ΕΚΚΡΕΜΕΙ and
            self.ημερομηνια_αποστολης):
            days_pending = (date.today() - self.ημερομηνια_αποστολης).days
            return days_pending > 25 and not self.reminder_sent
        return False

    @property
    def days_pending(self):
        """Calculate days since submission"""
        if self.ημερομηνια_αποστολης:
            if self.κατασταση == self.ΚατάστασηChoices.ΟΛΟΚΛΗΡΩΜΕΝΟ:
                if self.ημερομηνια_ολοκληρωσης:
                    return (self.ημερομηνια_ολοκληρωσης -
                           self.ημερομηνια_αποστολης).days
            return (date.today() - self.ημερομηνια_αποστολης).days
        return 0


class MilitaryPersonnel(models.Model):
    """
    Στρατιωτικό Προσωπικό - Υποκατηγορία πολιτών.
    Αυτόματη δημιουργία Citizen με OneToOne σχέση.

    Business Rules:
    - Όταν δημιουργείται MilitaryPersonnel, δημιουργείται αυτόματα και Citizen
    - Conditional fields με βάση τύπο (ΣΤΡΑΤΙΩΤΗΣ ή ΜΟΝΙΜΟΣ)
    - Ανεξάρτητο από Request model

    Usage:
        military = MilitaryPersonnel.objects.create(
            τυπος='ΣΤΡΑΤΙΩΤΗΣ',
            εσσο_ετος='2025',
            εσσο_γραμμα='Α',
            ...
        )
        # Το citizen δημιουργείται αυτόματα στο signal
    """

    # Σύνδεση με Citizen (OneToOne)
    πολιτης = models.OneToOneField(
        Citizen,
        on_delete=models.CASCADE,
        related_name='military_personnel',
        verbose_name="Πολίτης",
        null=True,  # Θα γίνει auto-create στο save
        blank=True
    )

    class ΤυποςChoices(models.TextChoices):
        ΣΤΡΑΤΙΩΤΗΣ = 'ΣΤΡΑΤΙΩΤΗΣ', 'Στρατιώτης'
        ΜΟΝΙΜΟΣ = 'ΜΟΝΙΜΟΣ', 'Μόνιμος'

    τυπος = models.CharField(
        max_length=20,
        choices=ΤυποςChoices.choices,
        verbose_name="Τύπος",
        db_index=True,
        help_text="Στρατιώτης ή Μόνιμος"
    )

    # ΚΟΙΝΑ ΠΕΔΙΑ (για δημιουργία Citizen)
    επωνυμο = models.CharField(
        max_length=100,
        verbose_name="Επώνυμο",
        db_index=True
    )
    ονομα = models.CharField(
        max_length=100,
        verbose_name="Όνομα",
        db_index=True
    )
    πατρωνυμο = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Πατρώνυμο"
    )

    κινητο = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Κινητό Τηλέφωνο",
        validators=[GREEK_PHONE_VALIDATOR],
        help_text="Μορφή: 6912345678"
    )

    email = models.EmailField(
        blank=True,
        verbose_name="Email"
    )

    # ΠΕΔΙΑ ΣΤΡΑΤΙΩΤΗ (ΕΣΣΟ)
    εσσο_ετος = models.CharField(
        max_length=4,
        blank=True,
        verbose_name="ΕΣΣΟ Έτος",
        validators=[RegexValidator(regex=r'^[0-9]{4}$', message='4ψήφιο έτος')],
        help_text="π.χ. 2025"
    )

    class ΕΣΣΟΓραμμαChoices(models.TextChoices):
        Α = 'Α', 'Α'
        Β = 'Β', 'Β'
        Γ = 'Γ', 'Γ'
        Δ = 'Δ', 'Δ'
        Ε = 'Ε', 'Ε'
        ΣΤ = 'ΣΤ', 'ΣΤ'

    εσσο_γραμμα = models.CharField(
        max_length=2,
        choices=ΕΣΣΟΓραμμαChoices.choices,
        blank=True,
        verbose_name="ΕΣΣΟ Γράμμα"
    )

    ασμ = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="ΑΣΜ",
        help_text="Αριθμός Στρατολογικού Μητρώου"
    )

    επιθυμια = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Επιθυμία Στρατιώτη"
    )
    κεντρο = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Κέντρο"
    )
    ημερομηνια_παρουσιασης = models.DateField(
        null=True,
        blank=True,
        verbose_name="Ημερομηνία Παρουσίασης"
    )
    τοποθετηση = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Τοποθέτηση"
    )
    ημερομηνια_τοποθετησης = models.DateField(
        null=True,
        blank=True,
        verbose_name="Ημερομηνία Τοποθέτησης"
    )
    μεταθεση_αποσπαση = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Μετάθεση/Απόσπαση"
    )
    ημερομηνια_μεταθεσης = models.DateField(
        null=True,
        blank=True,
        verbose_name="Ημερομηνία Μετάθεσης"
    )

    # ΠΕΔΙΑ ΜΟΝΙΜΟΥ
    βαθμος = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Βαθμός",
        db_index=True
    )
    μοναδα_υπηρεσιας = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Μονάδα Υπηρεσίας"
    )
    επιθυμια_μονιμου = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Επιθυμία Μόνιμου"
    )
    αμ = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="ΑΜ (Αριθμός Μητρώου)"
    )

    # ΓΕΝΙΚΑ ΠΕΔΙΑ
    παρατηρησεις = models.TextField(
        blank=True,
        verbose_name="Παρατηρήσεις"
    )

    αρμοδιος_συνεργατης = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_military_personnel',
        verbose_name="Αρμόδιος Συνεργάτης"
    )

    # METADATA
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Δημιουργήθηκε στις"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Ενημερώθηκε στις"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_military_personnel',
        verbose_name="Δημιουργήθηκε από"
    )

    class Meta:
        verbose_name = "Στρατιωτικό Προσωπικό"
        verbose_name_plural = "Στρατιωτικό Προσωπικό"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['τυπος', 'επωνυμο']),
            models.Index(fields=['εσσο_ετος', 'εσσο_γραμμα']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.επωνυμο} {self.ονομα} - {self.get_τυπος_display()}"

    def clean(self):
        """Validation rules"""
        # Τουλάχιστον ένα στοιχείο επικοινωνίας απαιτείται
        if not any([self.κινητο, self.email]):
            raise ValidationError(
                'Τουλάχιστον ένα από (Κινητό, Email) είναι υποχρεωτικό'
            )

    @property
    def εσσο(self):
        """Computed ΕΣΣΟ (έτος + γράμμα) για στρατιώτες"""
        if self.τυπος == self.ΤυποςChoices.ΣΤΡΑΤΙΩΤΗΣ:
            if self.εσσο_ετος and self.εσσο_γραμμα:
                return f"{self.εσσο_ετος}{self.εσσο_γραμμα}"
        return ""

    @property
    def full_name(self):
        """Returns full name with patronymic"""
        if self.πατρωνυμο:
            return f"{self.επωνυμο} {self.ονομα} ({self.πατρωνυμο})"
        return f"{self.επωνυμο} {self.ονομα}"

    @property
    def rank_or_esso(self):
        """Returns rank for μόνιμος or ΕΣΣΟ for στρατιώτης"""
        if self.τυπος == self.ΤυποςChoices.ΜΟΝΙΜΟΣ:
            return self.βαθμος or "-"
        elif self.τυπος == self.ΤυποςChoices.ΣΤΡΑΤΙΩΤΗΣ:
            return self.εσσο or "-"
        return "-"
