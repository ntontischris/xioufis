# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Political CRM System** - A Django 5.0 application for managing citizen contacts, requests, and military affairs with Greek language support. Uses Supabase (PostgreSQL) as the database backend and Django Unfold for a modern admin interface.

**Key Technologies:**
- Django 5.0 with Python 3.11+
- Supabase PostgreSQL (or Railway auto-provisioned PostgreSQL)
- Django Unfold admin theme (premium design)
- Two-Factor Authentication, Audit logging, Brute-force protection
- Import/Export (Excel/CSV) capabilities
- Automated reminder system for pending requests

## Development Commands

### Initial Setup
```bash
# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment (creates .env with generated SECRET_KEY)
python setup.py
# Then edit .env with your Supabase credentials
```

### Database Operations
```bash
# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Set/reset user password (utility script)
python set_password.py

# Create demo data for testing
python create_demo_data.py
```

### Running the Application
```bash
# Development server
python manage.py runserver

# Production with Gunicorn (3 workers, 120s timeout)
gunicorn political_crm.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
```

### Testing
```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=citizens --cov-report=html

# Run specific test
pytest citizens/tests.py::TestCitizenModel::test_phone_validation
```

### Reminder System
```bash
# Test reminders without sending emails
python manage.py check_reminders --dry-run

# Send reminders for requests pending > 25 days
python manage.py check_reminders

# Custom threshold (e.g., 30 days)
python manage.py check_reminders --days 30
```

### Static Files & Production
```bash
# Collect static files
python manage.py collectstatic --noinput

# Build script (migrations + static files)
bash build.sh
```

## Architecture Overview

### Project Structure
```
xioufis/
├── political_crm/          # Django project settings
│   ├── settings.py         # Main configuration with Unfold theme
│   ├── urls.py
│   └── wsgi.py
├── citizens/               # Main app (all CRM functionality)
│   ├── models.py          # 4 models: Citizen, Request, Communication, MilitaryRequest
│   ├── admin.py           # Unfold admin with optimized queries
│   ├── signals.py         # Auto-update completion dates
│   ├── dashboard.py       # Dashboard statistics callback
│   └── management/commands/
│       └── check_reminders.py  # Automated reminder system
```

### Database Models

**Citizen (Πολίτης)** - Main contact database
- Greek-named fields: `επιθετο`, `ονομα`, `πατρωνυμο`, `κινητο`, `σταθερο`, `email`, `διευθυνση`, `δημος`, `εκλογικη_περιφερεια`
- Phone validation regex: `r'^(\+30)?[2-9][0-9]{9}$'` (Greek phone numbers)
- Soft delete pattern: `is_active` flag instead of hard deletion
- Requires at least one contact method (mobile, landline, or email)
- Indexed fields: `επιθετο`, `ονομα`, `συσταση_απο`, `email`, `δημος`

**Request (Αίτημα)** - Citizen request tracking
- Status: `ΟΛΟΚΛΗΡΩΜΕΝΟ`, `ΕΚΚΡΕΜΕΙ`, `ΜΗ_ΟΛΟΚΛΗΡΩΜΕΝΟ`
- Categories: 9 types including military affairs, housing, employment, etc.
- Date validation: `ημερομηνια_ολοκληρωσης` must be after `ημερομηνια_αποστολης`
- Properties: `days_pending`, `needs_reminder` (auto-calculated)
- Reminder system: Sends email after 25 days for pending requests

**Communication (Επικοινωνία)** - Interaction history
- Types: `ΤΗΛΕΦΩΝΟ`, `EMAIL`, `ΠΡΟΣΩΠΙΚΗ`, `SMS`
- Tracks: date, type, notes, created_by user
- Audit trail for all citizen interactions

**MilitaryRequest (Στρατιωτικό Αίτημα)** - Military-specific data
- Types: `ΣΤΡΑΤΙΩΤΗΣ` (conscript) or `ΜΟΝΙΜΟΣ` (permanent)
- ΕΣΣΟ data: year + letter combination
- Conditional fields based on military type

### Database Configuration

The app supports multiple database backends:

1. **Railway (Production)** - Auto-detects `DATABASE_URL` environment variable
2. **Supabase (Production)** - Manual PostgreSQL configuration via env vars
3. **SQLite (Development)** - Default fallback when no `DATABASE_URL` present

All PostgreSQL connections use SSL (`sslmode=require`) and connection pooling (`conn_max_age=600`).

### Admin Optimization Patterns

The admin interface uses several performance optimizations to prevent N+1 queries:

1. **select_related()** - For ForeignKey fields (e.g., `πολίτης`, `αρμοδιος_συνεργατης`)
2. **annotate()** - For counts and aggregates (e.g., active requests count)
3. **Database indexes** - On all searchable/filterable fields
4. **Colored badges** - Visual status indicators without extra queries

Example from `citizens/admin.py:140`:
```python
def get_queryset(self, request):
    return super().get_queryset(request).select_related(
        'πολίτης',
        'πολίτης__αρμόδιος_συνεργάτης'
    ).annotate(
        days_open=Cast(ExtractDay(Now() - F('ημερομηνία_αποστολής')), IntegerField())
    )
```

### Security Features

- **Two-Factor Authentication** - Currently disabled in settings (commented out), can be enabled
- **Django Axes** - Brute-force protection (5 attempts = 1 hour lockout) - disabled for testing
- **Auditlog** - Tracks all model changes with user attribution - disabled for testing
- **Session timeout** - 1 hour (SESSION_COOKIE_AGE = 3600)
- **Strong password validation** - Minimum 10 characters

To enable security features in production, uncomment relevant sections in `political_crm/settings.py`.

### Reminder System Architecture

The reminder system uses Django management commands instead of django-cron for reliability:

1. Command: `citizens/management/commands/check_reminders.py`
2. Finds requests with status `ΕΚΚΡΕΜΕΙ` and `days_pending > 25`
3. Sends email to `αρμόδιος_συνεργάτης` if available
4. Marks request as `reminder_sent=True` to prevent duplicates
5. Production setup: Add to crontab `0 9 * * *` (runs daily at 9 AM)

Email configuration required in `.env`:
- EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD

### Environment Variables

Key variables in `.env`:
- **Database**: `DATABASE_URL` (Railway) OR manual Supabase vars (`SUPABASE_DB_HOST`, etc.)
- **Django**: `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- **Email**: `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
- **Locale**: `LANGUAGE_CODE=el-gr`, `TIME_ZONE=Europe/Athens`
- **Security**: `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE` (production only)

Use `.env.example` as a template. Run `python setup.py` to auto-generate SECRET_KEY.

## Important Implementation Details

### Greek Language Support
- All model field names use Greek characters (e.g., `επιθετο`, `ονομα`)
- Admin interface fully translated to Greek via `verbose_name`
- Locale settings: `LANGUAGE_CODE='el-gr'`, `TIME_ZONE='Europe/Athens'`
- Greek phone number validation pattern

### Phone Number Validation
Fixed regex pattern (citizens/models.py:73-75):
```python
phone_regex = RegexValidator(
    regex=r'^(\+30)?[2-9][0-9]{9}$',
    message='Εισάγετε έγκυρο ελληνικό τηλέφωνο (10 ψηφία)'
)
```
Accepts formats: `6912345678`, `2310123456`, `+306912345678`

### Signal Pattern for Auto-updates
`citizens/signals.py` automatically sets `ημερομηνια_ολοκληρωσης` when request status changes to `ΟΛΟΚΛΗΡΩΜΕΝΟ`:
```python
@receiver(pre_save, sender=Request)
def set_completion_date(sender, instance, **kwargs):
    if instance.κατάσταση == 'ΟΛΟΚΛΗΡΩΜΕΝΟ' and not instance.ημερομηνία_ολοκλήρωσης:
        instance.ημερομηνία_ολοκλήρωσης = timezone.now().date()
```

### Admin Dashboard Integration
`citizens/dashboard.py` provides dashboard statistics via callback:
```python
UNFOLD = {
    "DASHBOARD_CALLBACK": "citizens.dashboard.dashboard_callback",
}
```
Returns counts for total citizens, pending requests, recent communications, etc.

### Deployment Configuration

**Railway/Render/PaaS Platforms:**
- `Procfile` defines web server and release commands
- `build.sh` runs migrations and collects static files
- `runtime.txt` specifies Python version (3.11+)
- Whitenoise serves static files in production

**Static Files:**
- STATIC_ROOT: `BASE_DIR / 'staticfiles'`
- STATICFILES_STORAGE: Whitenoise compressed manifest
- Run `collectstatic` before deployment

## Testing Approach

Test suite uses `pytest-django` with fixtures and factory patterns:
- Model validation tests (phone numbers, dates, business rules)
- Properties and computed fields (`days_pending`, `full_name`, etc.)
- Soft delete functionality
- Signal behavior (auto-completion dates)

Coverage configured in `pytest.ini` to track `citizens` app coverage.

## Common Gotchas

1. **Admin disabled security features**: 2FA, Axes, and Auditlog are commented out in settings for easier testing. Enable for production.

2. **Database auto-detection**: App checks for `DATABASE_URL` env var first (Railway), falls back to SQLite. For Supabase, either set `DATABASE_URL` or uncomment manual configuration in settings.py.

3. **Greek character encoding**: Ensure terminal/editor supports UTF-8 when working with Greek field names.

4. **Static files in development**: `STATICFILES_DIRS` includes `BASE_DIR / 'static'`, but directory may not exist initially. Create if needed or remove from settings.

5. **Migration on Railway**: Runs automatically via `release: bash build.sh` in Procfile.

## Code Style Conventions

- Greek variable names for business domain fields (as per requirements)
- English for technical/framework terms (models, admin, settings)
- Comprehensive docstrings with business rules explained
- Type hints where beneficial but not required
- Black code formatter (configured in requirements.txt)
- Extensive comments in Greek for business logic

## Useful File References

- **Settings**: `political_crm/settings.py` - All configuration including Unfold theme
- **Models**: `citizens/models.py` - All 4 models with Greek fields and validation
- **Admin optimizations**: `citizens/admin.py:140` - get_queryset() with select_related
- **Reminders**: `citizens/management/commands/check_reminders.py` - Email reminder logic
- **Signals**: `citizens/signals.py` - Auto-completion date setter
- **Dashboard**: `citizens/dashboard.py` - Statistics callback for Unfold
- **Deployment docs**: `DEPLOYMENT.md`, `RAILWAY_DEPLOYMENT.md` - Platform-specific guides
- **Project summary**: `PROJECT_SUMMARY.md` - Complete feature overview

## Working with This Codebase

When modifying this project:
1. Always use Greek field names for citizen-facing data (following existing pattern)
2. Add database indexes to any new searchable/filterable fields
3. Use select_related/prefetch_related in admin get_queryset() to prevent N+1 queries
4. Update dashboard.py callback if adding new models that need statistics
5. Greek language docstrings for business logic, English for technical implementation
6. Test phone validation with Greek number formats
7. Remember to run makemigrations after model changes
8. Update reminder logic if adding new request statuses
