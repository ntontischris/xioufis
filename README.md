# Political CRM System 🏛️

Full-stack Django application with Supabase backend for managing citizen contacts, requests, and military affairs.

## Features

- **Citizen Management**: Complete contact management with Greek language support
- **Request Tracking**: Track citizen requests with status updates and reminders
- **Military Affairs**: Specialized forms for military personnel (ΕΣΣΟ, ΑΣΜ, etc.)
- **Communication Log**: Track all interactions with citizens
- **Automated Reminders**: Email reminders for pending requests > 25 days
- **Security**: 2FA authentication, brute-force protection, audit logging
- **Import/Export**: Excel/CSV import and export functionality
- **Modern Admin**: Beautiful admin interface with Jazzmin theme

## Tech Stack

- **Backend**: Django 5.0 (Python 3.11+)
- **Database**: Supabase (PostgreSQL)
- **Admin Theme**: Jazzmin
- **Authentication**: Django Two-Factor Auth
- **Security**: Django Axes, Auditlog, Rate Limiting

## Installation

### 1. Clone the repository

```bash
cd xioufis
```

### 2. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup environment variables

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create superuser

```bash
python manage.py createsuperuser
```

### 7. Run development server

```bash
python manage.py runserver
```

Visit: http://127.0.0.1:8000/admin

## Supabase Setup

1. Go to https://supabase.com and create a new project
2. Get your database credentials from: Settings > Database
3. Add credentials to `.env` file

## Reminders System

To enable automated email reminders:

```bash
# Test manually
python manage.py check_reminders

# Production: Add to crontab (runs daily at 9 AM)
0 9 * * * cd /path/to/project && /path/to/venv/bin/python manage.py check_reminders
```

## Testing

```bash
pytest
```

## Deployment

See `prd.md` for complete deployment instructions.

## License

Private - Internal use only

## Support

For issues and questions, contact the development team.
