# 🚀 Deployment Guide - Political CRM

Complete guide for deploying the Django CRM to production.

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created and credentials ready
- [ ] Email SMTP credentials (Gmail App Password or SendGrid)
- [ ] Production domain/server ready (optional)
- [ ] Backup strategy planned

## 🏁 Quick Start (Development)

### 1. Install Python & Dependencies

```bash
# Ensure Python 3.11+ is installed
python --version

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
# IMPORTANT: Add your Supabase credentials!
```

Required `.env` variables:
- `SUPABASE_DB_HOST` - From Supabase Dashboard > Settings > Database
- `SUPABASE_DB_PASSWORD` - Your database password
- `SECRET_KEY` - Generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`

### 3. Initialize Database

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations to Supabase
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 5. Run Development Server

```bash
python manage.py runserver
```

Visit: http://127.0.0.1:8000/admin

## 🌐 Production Deployment

### Option 1: Railway (Recommended - Easiest)

**Cost**: $5/month (includes database)

1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Initialize project
   railway init
   ```

2. **Add PostgreSQL Database**
   - Go to Railway dashboard
   - Click "New" > "Database" > "Add PostgreSQL"
   - Railway will auto-set DATABASE_URL

3. **Configure Environment Variables**
   ```bash
   # Set all variables from .env
   railway variables set SECRET_KEY=your-secret-key
   railway variables set DEBUG=False
   railway variables set ALLOWED_HOSTS=*.railway.app
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Run Migrations**
   ```bash
   railway run python manage.py migrate
   railway run python manage.py createsuperuser
   ```

### Option 2: Render

**Cost**: $7/month (free tier available with limitations)

1. **Create `render.yaml`**
   ```yaml
   services:
     - type: web
       name: political-crm
       env: python
       buildCommand: "pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate"
       startCommand: "gunicorn political_crm.wsgi:application"
       envVars:
         - key: SECRET_KEY
           generateValue: true
         - key: DEBUG
           value: "False"
         - key: PYTHON_VERSION
           value: "3.11.0"
   ```

2. **Push to GitHub** and connect to Render

3. **Add Supabase credentials** in Render dashboard

### Option 3: DigitalOcean App Platform

1. **Push to GitHub**

2. **Create App on DigitalOcean**
   - Select Django
   - Connect repository
   - Set build command: `pip install -r requirements.txt`
   - Set run command: `gunicorn political_crm.wsgi:application`

3. **Add Environment Variables**

4. **Deploy**

### Option 4: Traditional VPS (Ubuntu)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python & dependencies
sudo apt install python3.11 python3.11-venv postgresql nginx -y

# Create project directory
mkdir -p /var/www/political-crm
cd /var/www/political-crm

# Clone repository
git clone <your-repo-url> .

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt gunicorn

# Configure environment
nano .env
# (Add all environment variables)

# Run migrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# Test gunicorn
gunicorn political_crm.wsgi:application --bind 0.0.0.0:8000
```

**Configure Nginx**:
```nginx
# /etc/nginx/sites-available/political-crm

server {
    listen 80;
    server_name your-domain.com;

    location /static/ {
        alias /var/www/political-crm/staticfiles/;
    }

    location /media/ {
        alias /var/www/political-crm/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Create Systemd Service**:
```ini
# /etc/systemd/system/political-crm.service

[Unit]
Description=Political CRM Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/political-crm
Environment="PATH=/var/www/political-crm/venv/bin"
ExecStart=/var/www/political-crm/venv/bin/gunicorn \
          --workers 3 \
          --bind 127.0.0.1:8000 \
          political_crm.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable political-crm
sudo systemctl start political-crm
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 📧 Email Configuration

### Option 1: Gmail (Development)

1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   ```

**Note**: Gmail has daily limits (500 emails/day)

### Option 2: SendGrid (Production Recommended)

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create API key
3. Update `.env`:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_HOST_USER=apikey
   EMAIL_HOST_PASSWORD=your-sendgrid-api-key
   ```

## ⏰ Setup Automated Reminders

### Option 1: System Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 9 AM)
0 9 * * * cd /path/to/project && /path/to/venv/bin/python manage.py check_reminders >> /var/log/crm-reminders.log 2>&1
```

### Option 2: Railway/Render Cron

**Railway**:
```bash
# Add cron service in railway.toml
[[services]]
name = "reminder-cron"
cron = "0 9 * * *"
command = "python manage.py check_reminders"
```

**Render** (render.yaml):
```yaml
- type: cron
  name: reminder-check
  schedule: "0 9 * * *"
  command: "python manage.py check_reminders"
```

### Option 3: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 9:00 AM
4. Action: Start a program
   - Program: `C:\path\to\venv\Scripts\python.exe`
   - Arguments: `manage.py check_reminders`
   - Start in: `C:\path\to\project`

## 🔒 Production Security Checklist

### 1. Update `.env` for Production

```bash
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
SECRET_KEY=<generate-new-secret-key>

# Enable security headers
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
```

### 2. Configure SSL Certificate

**With Nginx + Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Setup Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 4. Enable 2FA for Admin Users

1. Login to admin
2. Go to Account Settings
3. Enable Two-Factor Authentication
4. Scan QR code with authenticator app

## 📊 Monitoring & Maintenance

### 1. Setup Sentry (Error Tracking)

```bash
# Add to requirements.txt
sentry-sdk[django]

# Update settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    environment="production"
)
```

### 2. Database Backups

**Supabase** provides automatic daily backups (7-day retention on free tier)

**Manual backup**:
```bash
pg_dump -U postgres -h db.xxx.supabase.co -d postgres > backup_$(date +%Y%m%d).sql
```

### 3. Monitor Logs

```bash
# Application logs
tail -f logs/django.log

# Gunicorn logs
sudo journalctl -u political-crm -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

## 🧪 Testing

```bash
# Run tests
pytest

# Test reminder system (dry run)
python manage.py check_reminders --dry-run

# Test email sending
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])
```

## 📈 Performance Optimization

1. **Enable Database Indexes** (already in models)
2. **Configure Connection Pooling** (already in settings)
3. **Enable Django Cache** (optional - for high traffic)

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'cache_table',
    }
}
```

## 🆘 Troubleshooting

### Issue: Can't connect to Supabase

**Solution**: Check SSL requirement and connection string
```python
# In settings.py, ensure:
'OPTIONS': {
    'sslmode': 'require',
},
```

### Issue: Static files not loading

**Solution**: Run collectstatic and check Nginx config
```bash
python manage.py collectstatic --noinput
sudo nginx -t
sudo systemctl restart nginx
```

### Issue: Reminders not sending

**Solution**: Check email configuration
```bash
python manage.py check_reminders --dry-run
# Check logs/django.log for errors
```

## 📞 Support

For issues, check:
1. `logs/django.log` for application errors
2. Supabase dashboard for database issues
3. Email provider dashboard for email delivery issues

## 🎯 Next Steps After Deployment

1. ✅ Create initial admin user
2. ✅ Import existing data (if any) via Excel
3. ✅ Configure user groups and permissions
4. ✅ Test reminder system
5. ✅ Train staff on system usage
6. ✅ Setup regular backups
7. ✅ Monitor system for first week

---

**Production Checklist Summary**:
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Superuser created
- [ ] Static files collected
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Reminders cron job setup
- [ ] Email sending tested
- [ ] 2FA enabled for admins
- [ ] Backups automated
- [ ] Monitoring setup (Sentry)
