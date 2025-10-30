# 🚂 Railway Deployment Guide - Πολιτικό CRM

Complete step-by-step guide για deployment του Django Political CRM στο Railway.

## 🎯 Γιατί Railway;

✅ **Built-in PostgreSQL Database** - Χωρίς Supabase!
✅ **$5/μήνα** για όλα (app + database + SSL)
✅ **Auto-deploy** από GitHub
✅ **Automatic SSL** certificates
✅ **Easy rollbacks** & monitoring
✅ **Zero configuration** database setup

---

## 📋 Prerequisites

1. **GitHub Account** - Για auto-deploy
2. **Railway Account** - Δημιούργησε στο [railway.app](https://railway.app)
3. **Git Repository** - Push το project στο GitHub

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Βεβαιώσου ότι έχεις όλα τα deployment files (ήδη δημιουργημένα):

```bash
# Έλεγξε ότι υπάρχουν:
ls -la Procfile railway.toml runtime.txt build.sh .railwayignore
```

**Files που πρέπει να υπάρχουν:**
- ✅ `Procfile` - Process definitions
- ✅ `railway.toml` - Railway configuration
- ✅ `runtime.txt` - Python version
- ✅ `build.sh` - Build script
- ✅ `.railwayignore` - Exclude files
- ✅ `requirements.txt` - Dependencies
- ✅ `.env.railway.example` - Environment variables template

### Step 2: Push to GitHub

```bash
# Initialize git (αν δεν το έχεις κάνει ήδη)
git init

# Add all files
git add .

# Commit
git commit -m "feat: Add Railway deployment configuration"

# Add remote (αντικατέστησε με το δικό σου repo)
git remote add origin https://github.com/yourusername/political-crm.git

# Push to GitHub
git push -u origin main
```

### Step 3: Create Railway Project

#### Option A: Via Railway Dashboard (Recommended)

1. **Login to Railway**: https://railway.app
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Connect GitHub Account** (αν δεν είναι ήδη connected)
5. **Select your repository**: `political-crm`
6. **Railway will auto-detect Django** και θα ξεκινήσει το deployment

#### Option B: Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Select "Empty Project"
# Railway will create a new project

# Link to GitHub
railway link
```

### Step 4: Add PostgreSQL Database

**Στο Railway Dashboard:**

1. Click στο project σου
2. Click **"New"** > **"Database"** > **"Add PostgreSQL"**
3. Railway θα δημιουργήσει αυτόματα:
   - PostgreSQL database
   - `DATABASE_URL` environment variable
   - Automatic connection στο app σου

**Αυτό είναι!** Το Django θα detect αυτόματα το `DATABASE_URL` από το settings.py!

### Step 5: Configure Environment Variables

**Στο Railway Dashboard > Variables:**

Πρόσθεσε τις παρακάτω μεταβλητές:

#### Required Variables:

```bash
# Django Secret Key (GENERATE NEW!)
SECRET_KEY=your-production-secret-key-here

# Debug Mode
DEBUG=False

# Allowed Hosts (optional - Railway domains auto-added)
ALLOWED_HOSTS=yourdomain.com

# Language & Timezone
LANGUAGE_CODE=el-gr
TIME_ZONE=Europe/Athens
```

#### Generate Secret Key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy το output και βάλ' το ως `SECRET_KEY`.

#### Optional - Email Configuration:

Για reminders & 2FA:

```bash
# Gmail
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=CRM Πολιτικό <your-email@gmail.com>
```

**Gmail App Password**: https://myaccount.google.com/apppasswords

### Step 6: Deploy!

Railway θα κάνει **αυτόματα deploy** μόλις:
- Push changes στο GitHub
- Αλλάξεις environment variables

**Monitor το deployment:**
- Railway Dashboard > "Deployments" tab
- Βλέπεις real-time logs

### Step 7: Run Migrations & Create Superuser

Μόλις το deploy ολοκληρωθεί:

#### Via Railway Dashboard:

1. Click στο service σου
2. Πήγαινε στο tab **"Settings"**
3. Scroll down στο **"Service"**
4. Βρες το **"Public Networking"** και enable το

#### Via Railway CLI:

```bash
# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser
# Username: admin
# Email: your-email@example.com
# Password: (create strong password)

# Collect static files (optional - build.sh το κάνει αυτόματα)
railway run python manage.py collectstatic --noinput
```

### Step 8: Access Your App

Railway θα σου δώσει URL:
```
https://your-app-name.up.railway.app
```

**Visit:**
```
https://your-app-name.up.railway.app/admin/
```

**Login** με τον superuser που δημιούργησες! 🎉

---

## 🔧 Railway CLI Commands

```bash
# View logs
railway logs

# Run Django commands
railway run python manage.py <command>

# Open app in browser
railway open

# Check service status
railway status

# Environment variables
railway variables

# Link local project to Railway
railway link
```

---

## 🌐 Custom Domain (Optional)

### Add Your Own Domain:

1. **Railway Dashboard** > Your Service > **"Settings"**
2. Scroll to **"Domains"**
3. Click **"Custom Domain"**
4. Enter your domain: `yourdomain.com`
5. Railway θα δώσει CNAME record:
   ```
   CNAME: your-app.up.railway.app
   ```

### Update DNS:

Στο domain provider σου (GoDaddy, Namecheap, κλπ):

```
Type: CNAME
Name: @  (or www)
Value: your-app.up.railway.app
TTL: 3600
```

### Update Django Settings:

Πρόσθεσε στο Railway Variables:
```bash
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,localhost,127.0.0.1
SITE_URL=https://yourdomain.com
```

Railway θα handle **αυτόματα το SSL certificate**! 🔒

---

## 📊 Database Management

### Access PostgreSQL Database:

#### Via Railway Dashboard:
1. Click **"PostgreSQL"** service
2. Click **"Data"** tab
3. View/edit data directly

#### Via psql (CLI):

```bash
# Get database URL
railway variables | grep DATABASE_URL

# Connect with psql
railway run psql $DATABASE_URL
```

### Database Backups:

**Railway provides automatic backups!**

Manual backup:
```bash
# Export database
railway run pg_dump > backup_$(date +%Y%m%d).sql

# Restore database
railway run psql $DATABASE_URL < backup.sql
```

---

## 🔄 Auto-Deploy Setup

**Railway auto-deploys** κάθε φορά που push στο GitHub!

### Configure Auto-Deploy:

1. **Railway Dashboard** > Service > **"Settings"**
2. Scroll to **"Source Repo"**
3. Enable **"Automatic Deployments"**
4. Select branch: `main` (or `master`)

**Workflow:**
```bash
# Make changes locally
git add .
git commit -m "feat: Add new feature"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Runs build.sh (migrations + collectstatic)
# 3. Deploys new version
# 4. Zero downtime!
```

---

## 📈 Monitoring & Logs

### View Logs:

**Dashboard:**
- Railway Dashboard > Service > **"Logs"** tab
- Real-time logs
- Filter by level (info, warning, error)

**CLI:**
```bash
# Stream logs
railway logs --follow

# Last 100 lines
railway logs --tail 100
```

### Metrics:

Railway Dashboard > Service > **"Metrics"** tab

Monitor:
- CPU usage
- Memory usage
- Request rate
- Response times

---

## 🛠️ Troubleshooting

### Issue 1: Deploy Failed

**Check Logs:**
```bash
railway logs
```

**Common fixes:**
- Ensure `requirements.txt` is up to date
- Check `runtime.txt` has correct Python version
- Verify `Procfile` syntax

### Issue 2: Database Connection Error

**Solution:**
```bash
# Verify DATABASE_URL exists
railway variables | grep DATABASE_URL

# If missing, add PostgreSQL database:
# Dashboard > New > Database > PostgreSQL
```

### Issue 3: Static Files Not Loading

**Solution:**
```bash
# Run collectstatic manually
railway run python manage.py collectstatic --noinput

# Check STATIC_ROOT in settings.py
# Should be: STATIC_ROOT = BASE_DIR / 'staticfiles'
```

### Issue 4: 500 Internal Server Error

**Check:**
1. **DEBUG=False** is set in Railway variables
2. **SECRET_KEY** is properly configured
3. **ALLOWED_HOSTS** includes your Railway domain
4. Run migrations: `railway run python manage.py migrate`

**View detailed errors:**
```bash
# Enable debug temporarily
railway variables set DEBUG=True

# View logs
railway logs

# IMPORTANT: Set DEBUG=False after debugging!
railway variables set DEBUG=False
```

### Issue 5: Migration Errors

**Solution:**
```bash
# Reset migrations (CAREFUL - data loss!)
railway run python manage.py migrate --fake-initial

# Or create fresh migrations
railway run python manage.py makemigrations
railway run python manage.py migrate
```

---

## 🔒 Security Checklist

Before going live:

- [ ] **DEBUG=False** in production
- [ ] **SECRET_KEY** is unique & secure (not default)
- [ ] **ALLOWED_HOSTS** properly configured
- [ ] **SECURE_SSL_REDIRECT=True**
- [ ] **SESSION_COOKIE_SECURE=True**
- [ ] **CSRF_COOKIE_SECURE=True**
- [ ] Email configuration tested
- [ ] Strong admin password
- [ ] 2FA enabled for admin users (optional)
- [ ] Database backups verified

---

## 💰 Pricing

### Railway Pricing:

**Hobby Plan** (Recommended for small projects):
- **$5/month** flat rate
- Includes:
  - PostgreSQL database
  - 500GB bandwidth
  - 8GB RAM
  - 8 vCPU
  - SSL certificates
  - Automatic backups

**Team Plan** ($20/month):
- Everything in Hobby
- Team collaboration
- Priority support

**Free Trial:**
- $5 free credit για testing
- No credit card needed initially

### Cost Comparison:

| Service | Monthly Cost |
|---------|-------------|
| **Railway** (App + DB) | **$5** |
| Vercel + Supabase | $25-45 |
| Heroku | $7-25 |
| DigitalOcean | $10-20 |

**Railway = Φθηνότερο & Ευκολότερο!** 🎉

---

## 📚 Additional Resources

**Railway Docs:**
- https://docs.railway.app/
- https://docs.railway.app/deploy/deployments
- https://docs.railway.app/databases/postgresql

**Django Deployment:**
- https://docs.djangoproject.com/en/5.0/howto/deployment/
- https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

**Monitoring:**
- https://sentry.io/for/django/ (Error tracking)
- https://www.datadoghq.com/ (APM monitoring)

---

## 🎓 Common Workflows

### Daily Development:

```bash
# Local development
python manage.py runserver

# Make changes
git add .
git commit -m "feat: Description"

# Auto-deploy to Railway
git push origin main
```

### Updating Dependencies:

```bash
# Add new package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt

# Push changes
git add requirements.txt
git commit -m "deps: Add package-name"
git push origin main

# Railway auto-deploys with new dependencies!
```

### Database Changes:

```bash
# Create migrations locally
python manage.py makemigrations

# Test locally
python manage.py migrate

# Push to GitHub
git add citizens/migrations/
git commit -m "db: Add new field to Citizen model"
git push origin main

# Railway runs migrations automatically via build.sh!
```

### Rollback:

```bash
# Via Dashboard:
# Railway > Deployments > Select previous deployment > "Redeploy"

# Via CLI:
railway rollback
```

---

## 🎉 Congratulations!

Το Political CRM είναι τώρα **live στο internet** με:

- ✅ Premium design (glassmorphism, gradients, animations)
- ✅ PostgreSQL database (Railway)
- ✅ SSL encryption
- ✅ Auto-deploy από GitHub
- ✅ Professional hosting

**URL:** `https://your-app.up.railway.app/admin/`

**Κόστος:** Μόνο **$5/μήνα**! 💰

---

## 📞 Support

**Πρόβλημα;**

1. Check Railway logs: `railway logs`
2. Check Django logs: Railway Dashboard > Logs tab
3. Railway Discord: https://discord.gg/railway
4. Railway Docs: https://docs.railway.app/

**Tips:**
- Κράτα backups της database
- Monitor το usage (CPU, Memory)
- Test changes locally πριν το production deploy
- Use staging environment για μεγάλες αλλαγές

---

**Created:** Οκτώβριος 2025
**Django:** 5.2.7
**Django Unfold:** 0.67.0
**Railway:** Latest
**Status:** ✅ Production Ready
