# 🏛️ **POLITICAL CRM SYSTEM - COMPLETE SPECIFICATION**
## Full-Stack Django Application with Supabase Backend

---

## 📋 **PROJECT OVERVIEW**

**Purpose**: Internal CRM system for political office to manage citizen contacts, requests, and military affairs  
**Users**: 5-10 staff members (admin + collaborators)  
**Scale**: 500-5000 citizen records  
**Critical Requirements**: Stability, security, ease of use, Greek language support  
**Database**: Supabase (PostgreSQL)

---

## 🛠️ **TECH STACK**

### Core Framework
```
Django 5.0.x (LTS)
Python 3.11+
Supabase (PostgreSQL) - Managed Database
```

### Essential Packages
```python
# requirements.txt

# Core Framework
Django>=5.0.0
psycopg2-binary>=2.9.9          # PostgreSQL driver for Supabase
python-decouple>=3.8            # Environment variables
django-environ>=0.11.2          # Alternative for env management

# Admin & UI
django-jazzmin>=3.0.0           # Modern admin theme
django-admin-sortable2>=2.1.10  # Drag-drop ordering

# Authentication & Security
django-two-factor-auth>=1.15.0  # 2FA with email
django-axes>=6.1.1              # Brute-force protection
django-auditlog>=2.3.0          # Activity & IP logging
django-session-timeout>=0.1.0   # Auto logout

# Data Management
django-import-export>=3.3.0     # Excel/CSV import/export
django-filter>=23.5             # Advanced filtering
django-crispy-forms>=2.1        # Beautiful forms
crispy-bootstrap5>=2024.2       # Bootstrap 5 integration

# Task Scheduling (Simple - No Redis!)
django-cron>=0.6.0              # Scheduled tasks (reminders)

# Reporting & Analytics
reportlab>=4.0.7                # PDF generation
openpyxl>=3.1.2                 # Excel operations
pandas>=2.1.4                   # Data analysis (optional)

# Development & Testing
pytest-django>=4.7.0            # Testing framework
factory-boy>=3.3.0              # Test data factories
django-debug-toolbar>=4.2.0     # Debug utilities (development only)
black>=23.12.1                  # Code formatter
flake8>=6.1.0                   # Code linter

# Production
gunicorn>=21.2.0                # WSGI server
whitenoise>=6.6.0               # Static files serving
sentry-sdk>=1.39.2              # Error tracking (optional)

# Image handling
Pillow>=10.0.0                  # For image uploads
```

---

## 🗄️ **DATABASE CONFIGURATION - SUPABASE**

### Supabase Setup

**Step 1: Create Supabase Project**
```
1. Go to https://supabase.com
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - Name: "political-crm"
   - Database Password: [strong password]
   - Region: [closest to you]
5. Wait 2-3 minutes for provisioning
```

**Step 2: Get Connection Details**
```
1. Go to Project Settings (⚙️)
2. Click "Database" in sidebar
3. Find "Connection Info" section
4. Note down:
   - Host: db.xxxxxxxxxxxx.supabase.co
   - Database name: postgres
   - Port: 5432
   - User: postgres
   - Password: [your password from setup]
```

### Django Database Configuration

```python
# settings.py

import environ
import os
from pathlib import Path

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Environment variables
env = environ.Env(
    DEBUG=(bool, False)
)

# Read .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# CRITICAL: Database Configuration for Supabase
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('SUPABASE_DB_NAME', default='postgres'),
        'USER': env('SUPABASE_DB_USER', default='postgres'),
        'PASSWORD': env('SUPABASE_DB_PASSWORD'),  # REQUIRED!
        'HOST': env('SUPABASE_DB_HOST'),          # REQUIRED! (db.xxx.supabase.co)
        'PORT': env('SUPABASE_DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'require',  # Supabase requires SSL connection
        },
        'CONN_MAX_AGE': 600,  # Connection pooling (10 minutes)
    }
}
```

### Environment Variables (.env file)

```bash
# .env - Create this file in project root!

# ============================================
# SUPABASE DATABASE CONNECTION
# ============================================
# Get these from: Supabase Dashboard > Settings > Database
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-supabase-password-here
SUPABASE_DB_HOST=db.xxxxxxxxxxxx.supabase.co
SUPABASE_DB_PORT=5432

# ============================================
# DJANGO SETTINGS
# ============================================
SECRET_KEY=django-insecure-generate-a-long-random-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# ============================================
# EMAIL CONFIGURATION (for 2FA & Reminders)
# ============================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=CRM Γραφείου <your-email@gmail.com>

# ============================================
# LANGUAGE & TIMEZONE
# ============================================
LANGUAGE_CODE=el-gr
TIME_ZONE=Europe/Athens
```

---

## 📅 **TASK SCHEDULING - DJANGO CRON (Simple & Reliable)**

### Why Django Cron instead of Celery?

**Pros:**
- ✅ No Redis dependency
- ✅ Much simpler setup
- ✅ Sufficient for daily reminders
- ✅ Easy to understand & maintain
- ✅ Lower cost (no extra services)

**Cons:**
- ⚠️ Less robust than Celery
- ⚠️ No retry logic by default
- ⚠️ Requires app to be running

### Configuration

```python
# settings.py

INSTALLED_APPS = [
    # Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'jazzmin',  # Must be before admin
    'django_cron',  # Scheduled tasks
    'two_factor',  # 2FA
    'axes',  # Brute-force protection
    'auditlog',  # Logging
    'import_export',  # Excel import/export
    'crispy_forms',  # Forms
    'crispy_bootstrap5',  # Bootstrap 5
    
    # Local apps
    'citizens',  # Our CRM app
]

# Django Cron Configuration
CRON_CLASSES = [
    'citizens.cron.CheckRemindersCronJob',  # Daily reminder check
]

# Optional: Email notifications for cron failures
DJANGO_CRON_LOCK_BACKEND = 'django_cron.backends.lock.file.FileLock'
DJANGO_CRON_LOCK_TIME = 3600  # 1 hour
```

### Cron Job Implementation

```python
# citizens/cron.py

from django_cron import CronJobBase, Schedule
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from datetime import date, timedelta
import logging

from .models import Request

logger = logging.getLogger(__name__)


class CheckRemindersCronJob(CronJobBase):
    """
    Daily cron job για έλεγχο αιτημάτων > 25 ημέρες.
    
    Τρέχει αυτόματα κάθε 24 ώρες και στέλνει email reminders
    στους υπεύθυνους συνεργάτες.
    
    Usage:
        # Manual run (για testing):
        python manage.py runcrons
        
        # Production (system cron):
        0 9 * * * cd /path/to/project && python manage.py runcrons
    """
    
    RUN_EVERY_MINS = 1440  # 24 hours (1440 minutes)
    
    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'citizens.check_reminders'  # Unique code
    
    def do(self):
        """Main cron job logic"""
        logger.info("Starting reminder check cron job...")
        
        # Calculate threshold date (25 days ago)
        threshold_date = date.today() - timedelta(days=25)
        
        # Find requests needing reminders
        requests_needing_reminder = Request.objects.filter(
            κατασταση=Request.ΚατάστασηChoices.ΕΚΚΡΕΜΕΙ,
            ημερομηνια_αποστολης__lte=threshold_date,
            reminder_sent=False
        ).select_related(
            'πολιτης',
            'πολιτης__αρμοδιος_συνεργατης'
        )
        
        sent_count = 0
        failed_count = 0
        
        for request in requests_needing_reminder:
            try:
                # Check if responsible user exists
                if not request.πολιτης.αρμοδιος_συνεργατης:
                    logger.warning(
                        f"Request {request.id} has no responsible user. Skipping."
                    )
                    continue
                
                # Send reminder email
                self.send_reminder_email(request)
                
                # Mark as sent
                request.reminder_sent = True
                request.reminder_sent_at = timezone.now()
                request.save(update_fields=['reminder_sent', 'reminder_sent_at'])
                
                sent_count += 1
                logger.info(f"✓ Reminder sent for request {request.id}")
                
            except Exception as e:
                failed_count += 1
                logger.error(
                    f"✗ Failed to send reminder for request {request.id}: {str(e)}"
                )
        
        # Log summary
        summary = f"Reminders: {sent_count} sent, {failed_count} failed"
        logger.info(summary)
        
        return summary
    
    def send_reminder_email(self, request):
        """
        Send reminder email to responsible user
        
        Args:
            request: Request instance needing reminder
        """
        days = (date.today() - request.ημερομηνια_αποστολης).days
        
        subject = f'⚠️ Υπενθύμιση: Αίτημα εκκρεμεί {days} ημέρες'
        
        message = f"""
Αγαπητέ/ή {request.πολιτης.αρμοδιος_συνεργατης.get_full_name()},

Το παρακάτω αίτημα εκκρεμεί για {days} ημέρες:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΣΤΟΙΧΕΙΑ ΑΙΤΗΜΑΤΟΣ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Πολίτης: {request.πολιτης.full_name}
Κατηγορία: {request.get_κατηγορια_αιτηματος_display()}
Ημερομηνία Αποστολής: {request.ημερομηνια_αποστολης.strftime('%d/%m/%Y')}
Κατάσταση: {request.get_κατασταση_display()}

Αίτημα:
{request.αιτημα_κειμενο[:300]}{'...' if len(request.αιτημα_κειμενο) > 300 else ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Παρακαλώ ελέγξτε το αίτημα και ενημερώστε την κατάσταση.

Για να δείτε το αίτημα, συνδεθείτε στο CRM:
{settings.SITE_URL}/admin/citizens/request/{request.id}/change/

---
Αυτό είναι αυτοματοποιημένο μήνυμα από το CRM Γραφείου.
Παρακαλώ μην απαντήσετε σε αυτό το email.
        """
        
        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[request.πολιτης.αρμοδιος_συνεργατης.email],
            fail_silently=False,
        )
```

### How to Run Cron Jobs

**Development (Manual Testing):**
```bash
# Test reminders manually
python manage.py runcrons

# Run specific cron
python manage.py runcrons citizens.check_reminders
```

**Production (Automated):**

**Option 1: System Cron (Linux/Mac)**
```bash
# Edit crontab
crontab -e

# Add this line (runs every day at 9 AM)
0 9 * * * cd /path/to/your/project && /path/to/venv/bin/python manage.py runcrons
```

**Option 2: Supervisor (Recommended for Production)**
```ini
# /etc/supervisor/conf.d/django_cron.conf
[program:django_cron]
command=/path/to/venv/bin/python /path/to/project/manage.py runcrons
directory=/path/to/project
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/django_cron.err.log
stdout_logfile=/var/log/django_cron.out.log
```

**Option 3: Render/Railway Cron (Cloud)**
```yaml
# render.yaml
services:
  - type: cron
    name: reminder-check
    env: python
    schedule: "0 9 * * *"  # Every day at 9 AM
    buildCommand: "pip install -r requirements.txt"
    startCommand: "python manage.py runcrons"
```

---

## 🗂️ **DATABASE MODELS (Complete Implementation)**

### Model 1: Citizen (Πολίτης)

```python
# citizens/models.py

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from datetime import date


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
    
    phone_regex = RegexValidator(
        regex=r'^(\+30)?[0-9]{10}$',
        message='Εισάγετε έγκυρο ελληνικό τηλέφωνο (10 ψηφία)'
    )
    
    κινητο = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Κινητό Τηλέφωνο",
        validators=[phone_regex],
        help_text="Μορφή: 6912345678 ή +306912345678"
    )
    
    σταθερο = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Σταθερό Τηλέφωνο",
        validators=[phone_regex],
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
    
    τκ_regex = RegexValidator(
        regex=r'^[0-9]{5}$',
        message='Εισάγετε έγκυρο 5ψήφιο ΤΚ'
    )
    
    τκ = models.CharField(
        max_length=10,
        blank=True,
        verbose_name="ΤΚ",
        validators=[τκ_regex]
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
```

### Model 2: Communication

```python
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
```

### Model 3: Request

```python
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
        if self.κατασταση == self.ΚατάστασηChoices.ΟΛΟΚΛΗΡΩΜΕΝΟ:
            if not self.ημερομηνια_ολοκληρωσης:
                raise ValidationError({
                    'ημερομηνια_ολοκληρωσης': 
                    'Απαιτείται ημερομηνία ολοκλήρωσης για ολοκληρωμένα αιτήματα'
                })
    
    @property
    def needs_reminder(self):
        """Check if reminder needed (>25 days pending)"""
        if (self.κατασταση == self.ΚατάστασηChoices.ΕΚΚΡΕΜΕΙ and 
            self.ημερομηνια_αποστολης):
            from datetime import timedelta
            days_pending = (date.today() - self.ημερομηνια_αποστολης).days
            return days_pending > 25 and not self.reminder_sent
        return False
    
    @property
    def days_pending(self):
        """Calculate days since submission"""
        if self.ημερομηνια_αποστολης:
            if self.κατασταση == self.ΚατάστασηChoices.ΟΛΟΚΛΗΡΩΜΕΝΟ:
                return (self.ημερομηνια_ολοκληρωσης - 
                       self.ημερομηνια_αποστολης).days
            return (date.today() - self.ημερομηνια_αποστολης).days
        return 0
    
    def save(self, *args, **kwargs):
        """Auto-set ημερομηνια_ολοκληρωσης when status changes"""
        if (self.κατασταση == self.ΚατάστασηChoices.ΟΛΟΚΛΗΡΩΜΕΝΟ and 
            not self.ημερομηνια_ολοκληρωσης):
            self.ημερομηνια_ολοκληρωσης = date.today()
        super().save(*args, **kwargs)
```

### Model 4: MilitaryRequest

```python
class MilitaryRequest(models.Model):
    """
    Στρατιωτικά αιτήματα με conditional fields.
    Συνδέεται 1:1 με Request (κατηγορία ΣΤΡΑΤΙΩΤΙΚΟ).
    
    Conditional Logic:
    - Αν τυπος = ΣΤΡΑΤΙΩΤΗΣ → show στρατιώτης fields
    - Αν τυπος = ΜΟΝΙΜΟΣ → show μόνιμος fields
    """
    
    αιτημα = models.OneToOneField(
        Request,
        on_delete=models.CASCADE,
        related_name='military_details',
        verbose_name="Αίτημα"
    )
    
    class ΤυποςChoices(models.TextChoices):
        ΣΤΡΑΤΙΩΤΗΣ = 'ΣΤΡΑΤΙΩΤΗΣ', 'Στρατιώτης'
        ΜΟΝΙΜΟΣ = 'ΜΟΝΙΜΟΣ', 'Μόνιμος'
    
    τυπος = models.CharField(
        max_length=20,
        choices=ΤυποςChoices.choices,
        verbose_name="Τύπος",
        help_text="Στρατιώτης ή Μόνιμος"
    )
    
    # ΚΟΙΝΑ ΠΕΔΙΑ
    ονομα = models.CharField(max_length=100, verbose_name="Όνομα")
    επωνυμο = models.CharField(max_length=100, verbose_name="Επώνυμο")
    πατρωνυμο = models.CharField(max_length=100, blank=True, verbose_name="Πατρώνυμο")
    
    ημερομηνια_αποστολης = models.DateField(
        null=True,
        blank=True,
        verbose_name="Ημερομηνία Αποστολής"
    )
    
    παρατηρησεις = models.TextField(blank=True, verbose_name="Παρατηρήσεις")
    
    # ΠΕΔΙΑ ΣΤΡΑΤΙΩΤΗ
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
    
    επιθυμια = models.CharField(max_length=200, blank=True, verbose_name="Επιθυμία")
    κεντρο = models.CharField(max_length=200, blank=True, verbose_name="Κέντρο")
    ημερομηνια_παρουσιασης = models.DateField(null=True, blank=True, verbose_name="Ημερομηνία Παρουσίασης")
    τοποθετηση = models.CharField(max_length=200, blank=True, verbose_name="Τοποθέτηση")
    ημερομηνια_τοποθετησης = models.DateField(null=True, blank=True, verbose_name="Ημερομηνία Τοποθέτησης")
    μεταθεση_αποσπαση = models.CharField(max_length=200, blank=True, verbose_name="Μετάθεση/Απόσπαση")
    ημερομηνια_μεταθεσης = models.DateField(null=True, blank=True, verbose_name="Ημερομηνία Μετάθεσης")
    
    # ΠΕΔΙΑ ΜΟΝΙΜΟΥ
    βαθμος = models.CharField(max_length=100, blank=True, verbose_name="Βαθμός")
    μοναδα_υπηρεσιας = models.CharField(max_length=200, blank=True, verbose_name="Μονάδα Υπηρεσίας")
    επιθυμια_μονιμου = models.CharField(max_length=200, blank=True, verbose_name="Επιθυμία")
    σχολια = models.TextField(blank=True, verbose_name="Σχόλια")
    αμ = models.CharField(max_length=50, blank=True, verbose_name="ΑΜ")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Δημιουργήθηκε στις")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ενημερώθηκε στις")
    
    class Meta:
        verbose_name = "Στρατιωτικό Αίτημα"
        verbose_name_plural = "Στρατιωτικά Αιτήματα"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.επωνυμο} {self.ονομα} - {self.get_τυπος_display()}"
    
    @property
    def εσσο(self):
        """Computed ΕΣΣΟ (έτος + γράμμα)"""
        if self.εσσο_ετος and self.εσσο_γραμμα:
            return f"{self.εσσο_ετος}{self.εσσο_γραμμα}"
        return ""
```

---

## 🎨 **DJANGO ADMIN CONFIGURATION**

```python
# citizens/admin.py

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Q
from django.urls import reverse
from import_export.admin import ImportExportModelAdmin

from .models import Citizen, Communication, Request, MilitaryRequest


# ============================================
# INLINE ADMINS
# ============================================

class CommunicationInline(admin.TabularInline):
    model = Communication
    extra = 1
    fields = ['ημερομηνια_επικοινωνιας', 'τυπος', 'σημειωσεις']
    readonly_fields = ['created_by', 'created_at']
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class RequestInline(admin.TabularInline):
    model = Request
    extra = 0
    fields = ['κατηγορια_αιτηματος', 'κατασταση', 'ημερομηνια_αποστολης']
    readonly_fields = ['created_at']
    show_change_link = True


# ============================================
# CITIZEN ADMIN
# ============================================

@admin.register(Citizen)
class CitizenAdmin(ImportExportModelAdmin):
    list_display = [
        'επιθετο',
        'ονομα',
        'κινητο',
        'δημος',
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
        'is_active'
    ]
    
    search_fields = [
        'επιθετο',
        'ονομα',
        'κινητο',
        'σταθερο',
        'email',
        'συσταση_απο'
    ]
    
    readonly_fields = ['ημερομηνια_προσθηκης', 'updated_at', 'last_contact_date']
    
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
            'fields': ('ημερομηνια_προσθηκης', 'updated_at', 'last_contact_date', 'is_active'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [CommunicationInline, RequestInline]
    
    def active_requests_badge(self, obj):
        count = obj.active_requests_count
        if count > 0:
            color = 'warning' if count < 3 else 'danger'
            return format_html(
                '<span style="background-color: {}; color: white; padding: 3px 10px; '
                'border-radius: 10px; font-weight: bold;">{}</span>',
                '#ffc107' if color == 'warning' else '#dc3545',
                count
            )
        return format_html(
            '<span style="color: green;">✓</span>'
        )
    active_requests_badge.short_description = 'Ενεργά Αιτήματα'


# ============================================
# REQUEST ADMIN
# ============================================

@admin.register(Request)
class RequestAdmin(ImportExportModelAdmin):
    list_display = [
        'πολιτης',
        'κατηγορια_αιτηματος',
        'status_badge',
        'ημερομηνια_αποστολης',
        'days_pending_display',
        'reminder_badge'
    ]
    
    list_filter = [
        'κατηγορια_αιτηματος',
        'κατασταση',
        'created_at',
        'reminder_sent'
    ]
    
    search_fields = [
        'πολιτης__επιθετο',
        'πολιτης__ονομα',
        'αιτημα_κειμενο'
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
    
    def status_badge(self, obj):
        colors = {
            'ΟΛΟΚΛΗΡΩΜΕΝΟ': '#28a745',
            'ΕΚΚΡΕΜΕΙ': '#ffc107',
            'ΜΗ_ΟΛΟΚΛΗΡΩΜΕΝΟ': '#6c757d'
        }
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
        if obj.reminder_sent:
            return format_html('✓ <span style="color: green;">Στάλθηκε</span>')
        elif obj.needs_reminder:
            return format_html('⚠️ <span style="color: red;">Απαιτείται</span>')
        return '-'
    reminder_badge.short_description = 'Υπενθύμιση'
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ============================================
# MILITARY REQUEST ADMIN
# ============================================

@admin.register(MilitaryRequest)
class MilitaryRequestAdmin(admin.ModelAdmin):
    list_display = ['επωνυμο', 'ονομα', 'τυπος', 'εσσο_display', 'created_at']
    list_filter = ['τυπος', 'εσσο_ετος', 'εσσο_γραμμα']
    search_fields = ['επωνυμο', 'ονομα', 'ασμ', 'αμ']
    
    fieldsets = (
        ('Βασικά', {
            'fields': ('αιτημα', 'τυπος')
        }),
        ('Στοιχεία', {
            'fields': ('ονομα', 'επωνυμο', 'πατρωνυμο')
        }),
        ('Στρατιώτης', {
            'fields': (
                'εσσο_ετος', 'εσσο_γραμμα', 'ασμ', 'επιθυμια',
                'κεντρο', 'ημερομηνια_παρουσιασης',
                'τοποθετηση', 'ημερομηνια_τοποθετησης',
                'μεταθεση_αποσπαση', 'ημερομηνια_μεταθεσης'
            ),
            'classes': ('collapse',)
        }),
        ('Μόνιμος', {
            'fields': (
                'βαθμος', 'μοναδα_υπηρεσιας',
                'επιθυμια_μονιμου', 'σχολια', 'αμ'
            ),
            'classes': ('collapse',)
        }),
        ('Άλλα', {
            'fields': ('ημερομηνια_αποστολης', 'παρατηρησεις'),
            'classes': ('collapse',)
        }),
    )
    
    def εσσο_display(self, obj):
        if obj.εσσο:
            return format_html(
                '<span style="background-color: #007bff; color: white; padding: 3px 8px; '
                'border-radius: 8px; font-weight: bold;">{}</span>',
                obj.εσσο
            )
        return '-'
    εσσο_display.short_description = 'ΕΣΣΟ'
```

---

## 🔐 **JAZZMIN CONFIGURATION**

```python
# settings.py

JAZZMIN_SETTINGS = {
    # Site
    "site_title": "Πολιτικό CRM",
    "site_header": "Διαχείριση Πολιτών",
    "site_brand": "CRM Γραφείου",
    "site_logo": None,  # Path to logo in static/
    "welcome_sign": "Καλώς ήρθατε στο Σύστημα Διαχείρισης Πολιτών",
    "copyright": "Γραφείο Βουλευτή 2025",
    
    # Search
    "search_model": "citizens.Citizen",
    
    # UI Customizer
    "show_ui_builder": True,
    
    # Topmenu
    "topmenu_links": [
        {"name": "Αρχική", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Στατιστικά", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"model": "citizens.Citizen"},
        {"model": "citizens.Request"},
    ],
    
    # Icons (Font Awesome)
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "citizens.Citizen": "fas fa-address-book",
        "citizens.Request": "fas fa-file-alt",
        "citizens.MilitaryRequest": "fas fa-medal",
        "citizens.Communication": "fas fa-comments",
    },
    
    # User menu
    "usermenu_links": [
        {"name": "Υποστήριξη", "url": "https://support.example.com", "new_window": True},
        {"model": "auth.user"},
    ],
    
    # Side Menu ordering
    "order_with_respect_to": [
        "citizens",
        "citizens.citizen",
        "citizens.request",
        "citizens.militaryrequest",
        "citizens.communication",
        "auth",
    ],
    
    # Change form templates
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "citizens.citizen": "horizontal_tabs",
        "citizens.request": "horizontal_tabs",
    },
}

# UI Tweaks
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-primary",
    "accent": "accent-primary",
    "navbar": "navbar-white navbar-light",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": False,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",  # or "darkly", "simplex", etc.
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
}
```

---

## 🚀 **DEPLOYMENT INSTRUCTIONS**

### Step 1: Project Setup

```bash
# Create project directory
mkdir political_crm
cd political_crm

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Django
pip install django

# Create Django project
django-admin startproject political_crm .

# Create app
python manage.py startapp citizens
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Configure Supabase

1. Create `.env` file in project root
2. Add Supabase credentials (from Supabase Dashboard)
3. Configure `settings.py` with database settings (from above)

### Step 4: Run Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations to Supabase
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Step 5: Run Development Server

```bash
python manage.py runserver
```

Visit: http://127.0.0.1:8000/admin

---

## ✅ **SUCCESS CHECKLIST**

```
Phase 1: Setup
□ Django project created
□ Supabase connected
□ Dependencies installed
□ Migrations applied
□ Superuser created

Phase 2: Models
□ Citizen model works
□ Communication model works
□ Request model works
□ MilitaryRequest model works
□ All validations working

Phase 3: Admin
□ Jazzmin theme active
□ All models in admin
□ Search & filters working
□ Inlines working
□ Export to Excel working

Phase 4: Features
□ 2FA authentication
□ IP logging (auditlog)
□ Reminder cron job
□ Email sending works

Phase 5: Testing
□ Create test citizens
□ Create test requests
□ Test reminders manually
□ Test all features

Phase 6: Production
□ Environment variables secure
□ DEBUG=False
□ Static files configured
□ Gunicorn installed
□ Ready for deployment
```

---

## 🎯 **IMPLEMENTATION STRATEGY**

**Build in this order:**

1. ✅ **Setup** (Day 1)
   - Project structure
   - Supabase connection
   - Basic settings

2. ✅ **Models** (Day 2-3)
   - One model at a time
   - Test each before moving on
   - Migrations after each

3. ✅ **Admin Basic** (Day 4)
   - Register models
   - Basic list_display
   - Search & filters

4. ✅ **Admin Advanced** (Day 5)
   - Fieldsets & inlines
   - Colored badges
   - Export functionality

5. ✅ **Reminders** (Day 6)
   - Cron job implementation
   - Email testing
   - Manual testing

6. ✅ **Security** (Day 7)
   - 2FA setup
   - Auditlog
   - Axes (brute force)

7. ✅ **Polish** (Day 8)
   - UI tweaks
   - Testing
   - Documentation

---

**Ready to start building! Copy this entire prompt to Claude Code and let's go! 🚀**