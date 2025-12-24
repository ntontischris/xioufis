# Political CRM System

Full-stack Django application for managing citizen contacts, requests, and military affairs with Greek language support.

## Features

- **Citizen Management**: Complete contact management with Greek language support
- **Request Tracking**: Track citizen requests with status updates and automated reminders
- **Military Personnel**: Specialized handling for military personnel (ΕΣΣΟ, ranks, etc.)
- **Communication Log**: Track all interactions with citizens
- **Automated Reminders**: Email reminders for pending requests > 25 days
- **Import/Export**: Excel/CSV import and export functionality
- **Modern Admin**: Premium admin interface with Django Unfold (glassmorphism design)
- **Custom Dashboard**: Individual citizen dashboards with tabs and animations

## Tech Stack

- **Backend**: Django 5.2.7 (Python 3.11+)
- **Database**: Railway PostgreSQL (or Supabase as alternative)
- **Admin Theme**: Django Unfold 0.67.0 with glassmorphism design
- **Charts**: Chart.js for dashboard visualizations
- **Deployment**: Railway with auto-deploy from GitHub

## Project Structure

```
xioufis/
├── political_crm/          # Django project settings
│   ├── settings.py         # Main configuration
│   └── urls.py             # URL routing
├── citizens/               # Main app
│   ├── admin/              # Modular admin package
│   │   ├── citizen.py      # Citizen admin
│   │   ├── request.py      # Request admin
│   │   ├── communication.py
│   │   ├── military.py
│   │   └── user.py
│   ├── tests/              # Test suite
│   │   ├── test_models.py
│   │   ├── test_signals.py
│   │   ├── test_admin.py
│   │   └── test_dashboard.py
│   ├── models.py           # 4 models: Citizen, Request, Communication, MilitaryPersonnel
│   ├── signals.py          # Bidirectional sync, auto-completion
│   ├── dashboard.py        # Dashboard statistics with error handling
│   └── views.py            # Custom citizen dashboard
└── templates/              # Admin templates
```

## Installation

### 1. Clone and setup virtual environment

```bash
git clone https://github.com/ntontischris/xioufis.git
cd xioufis
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup environment variables

```bash
# Create .env file with:
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://...  # Railway provides this
```

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Create superuser

```bash
python manage.py createsuperuser
```

### 6. Run development server

```bash
python manage.py runserver
```

Visit: http://127.0.0.1:8000/admin

## Database Models

| Model | Description |
|-------|-------------|
| **Citizen** | Main contact database with Greek fields, soft delete, phone validation |
| **Request** | Citizen requests with status tracking, reminders, date validation |
| **Communication** | Interaction history with audit trail |
| **MilitaryPersonnel** | Military data with bidirectional sync to Citizen |

## Key Features

### Bidirectional Data Sync
Changes to Citizen automatically sync to linked MilitaryPersonnel and vice versa.

### Query Optimization
All admin views use `select_related` and `annotate` to prevent N+1 queries.

### Error Handling
All views and dashboard functions include try/catch with logging for production reliability.

## Railway Deployment

The project is configured for Railway deployment:

```bash
# Deployment files
Procfile              # Web server + release command
build.sh              # Migrations + static files
railway.toml          # Railway config with --fake-initial
```

### Environment Variables Required

- `SECRET_KEY` - Django secret key
- `DATABASE_URL` - Auto-provided by Railway PostgreSQL
- `ALLOWED_HOSTS` - Your Railway domain
- `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` - For reminders

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=citizens --cov-report=html

# Run specific test module
pytest citizens/tests/test_signals.py -v
```

## Reminders System

```bash
# Test manually
python manage.py check_reminders --dry-run

# Send reminders
python manage.py check_reminders

# Production: Add to crontab (daily at 9 AM)
0 9 * * * cd /path/to/project && python manage.py check_reminders
```

## Security Notes

For production, enable in settings.py:
- Two-Factor Authentication (django-otp)
- Brute-force protection (django-axes)
- Audit logging (django-auditlog)

Currently disabled for easier development/testing.

## Documentation

- `CLAUDE.md` - Development guide for Claude Code
- `DEPLOYMENT.md` - Deployment instructions
- `RAILWAY_DEPLOYMENT.md` - Railway-specific guide
- `RAILWAY_DATABASE_BACKUP_GUIDE.md` - Backup procedures

## License

Private - Internal use only

## Support

For issues, create a GitHub issue or contact the development team.
