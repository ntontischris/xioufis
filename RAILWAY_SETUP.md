# Railway Deployment Guide

## 🚀 Deployment Steps

### 1. Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository: `ntontischris/xioufis`
4. Railway will auto-detect Django and deploy

### 2. Add PostgreSQL Database

1. In Railway dashboard: **New** → **Database** → **PostgreSQL**
2. Railway automatically sets `DATABASE_URL` environment variable
3. Your app will auto-detect and use it (no manual configuration needed)

### 3. Set Required Environment Variables

Go to your Railway project → **Variables** and add:

```bash
# REQUIRED - Generate with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY=your-secret-key-here

# Production settings
DEBUG=False
ALLOWED_HOSTS=.railway.app,.up.railway.app
CSRF_TRUSTED_ORIGINS=https://your-app.railway.app

# Optional: Email configuration (for reminders)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Optional: Security (recommended for production)
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
```

### 4. Deploy

Railway will automatically:
1. Run `bash build.sh` (migrations + collectstatic)
2. Start Gunicorn server on port 3000
3. Your app will be live at: `https://your-app.railway.app`

### 5. Create Superuser

After first deployment, create admin user:

```bash
# In Railway dashboard → Shell
python manage.py createsuperuser
```

Then login at: `https://your-app.railway.app/admin/`

---

## 🔧 Troubleshooting

### Problem: django_session table errors

**Symptom:** Login fails with database errors about `django_session` table

**Solution:** Run the manual fix script ONCE (don't add to Procfile):

```bash
# In Railway dashboard → Shell
python manual_fix_django_session.py
```

**Why this happens:**
- Django creates `django_session` table automatically via migrations
- Sometimes manual database interventions can corrupt it
- The fix script drops and recreates the table with correct schema

**⚠️ WARNING:** This script will:
- Drop the existing `django_session` table
- ALL users will be logged out
- Only run when experiencing session errors
- Never add this to Procfile (it will run on every restart!)

### Problem: Static files not loading

**Check:**
```bash
python manage.py collectstatic --noinput
```

Railway runs this automatically in `build.sh`

### Problem: Migrations not applied

**Check migration status:**
```bash
python manage.py showmigrations
```

**Apply migrations:**
```bash
python manage.py migrate
```

Railway runs this automatically in `build.sh`

---

## 📊 Expected Performance

- **Database:** Railway PostgreSQL (512MB RAM, 1GB storage on free tier)
- **Capacity:** 10,000+ citizens with excellent performance
- **Response time:** < 200ms for admin pages
- **Concurrent users:** 50+ simultaneous users

---

## 💰 Cost

- **Free Tier:** $5 worth of credits
- **Hobby Plan:** $5/month (recommended for production)
  - Includes PostgreSQL database
  - SSL certificate
  - Automatic deployments
  - 512MB RAM, 1GB storage

---

## 🔒 Security Checklist

Before going live:

- [ ] Set strong `SECRET_KEY` (50+ characters)
- [ ] Set `DEBUG=False`
- [ ] Enable SSL redirect (`SECURE_SSL_REDIRECT=True`)
- [ ] Set secure cookies (`SESSION_COOKIE_SECURE=True`)
- [ ] Configure ALLOWED_HOSTS and CSRF_TRUSTED_ORIGINS
- [ ] Enable HSTS (`SECURE_HSTS_SECONDS=31536000`)
- [ ] Create strong superuser password
- [ ] Regular database backups (see RAILWAY_DATABASE_BACKUP_GUIDE.md)

---

## 📝 Maintenance

### Database Backups

See detailed guide: `RAILWAY_DATABASE_BACKUP_GUIDE.md`

**Quick backup:**
```bash
# In Railway dashboard → Shell
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission > backup.json
```

### View Logs

Railway dashboard → **Deployments** → Select deployment → **View Logs**

### Scheduled Tasks (Reminders)

Railway doesn't support cron jobs on free tier. For production:
- Use Railway Cron add-on ($1/month)
- Or use external service (GitHub Actions, cron-job.org)

Command to run daily:
```bash
python manage.py check_reminders
```

---

## 🆘 Support

- Railway Docs: https://docs.railway.app
- Django Deployment: https://docs.djangoproject.com/en/5.0/howto/deployment/
- Project Issues: https://github.com/ntontischris/xioufis/issues
