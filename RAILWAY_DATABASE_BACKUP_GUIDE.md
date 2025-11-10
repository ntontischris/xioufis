# 📊 Railway Database: Αποθήκευση, Backups & Import από Google Sheets

**Οδηγός** για τη διαχείριση δεδομένων στο Railway PostgreSQL και την εισαγωγή από Google Sheets.

---

## 🎯 Πώς Λειτουργεί η Αποθήκευση Δεδομένων στο Railway

### ✅ Permanent Storage (Μόνιμη Αποθήκευση)

Η Railway PostgreSQL database είναι **persistent** - δηλαδή:

- ✅ **Τα δεδομένα σου ΔΕΝ χάνονται** μετά από restart
- ✅ **Τα δεδομένα σου ΔΕΝ χάνονται** μετά από re-deploy
- ✅ **Τα δεδομένα αποθηκεύονται σε SSD storage** με redundancy
- ✅ **Railway κρατάει αυτόματα backups** κάθε μέρα
- ✅ **Δεν χρειάζεται να ανησυχείς** για data loss κάτω από κανονικές συνθήκες

### 🔒 Πώς Προστατεύονται τα Δεδομένα

```
┌─────────────────────────────────────┐
│   Railway PostgreSQL Database       │
│                                     │
│  ✓ SSD Storage με Replication      │
│  ✓ Automatic Daily Backups         │
│  ✓ Point-in-time Recovery          │
│  ✓ 99.9% Uptime SLA                │
│                                     │
│  Storage: 1GB - 10GB (expandable)  │
└─────────────────────────────────────┘
```

### ⚠️ Σενάρια Απώλειας Δεδομένων (Σπάνια)

Τα δεδομένα μπορεί να χαθούν **ΜΟΝΟ** στις εξής περιπτώσεις:

1. **Διαγραφή της database** - Εσύ διαγράφεις χειροκίνητα τη database από το dashboard
2. **Διαγραφή του project** - Διαγράφεις ολόκληρο το Railway project
3. **Corrupted migrations** - Λάθος migration commands που κάνουν DROP TABLE
4. **Railway platform failure** - Εξαιρετικά σπάνιο (< 0.001% πιθανότητα)

**Λύση:** Κάνε τακτικά **manual backups** (βλέπε παρακάτω)!

---

## 💾 1. Manual Database Backups (Συνιστώμενο)

### Option A: Backup μέσω Railway CLI (Recommended)

#### Εγκατάσταση Railway CLI:

```bash
# Windows (PowerShell)
npm install -g @railway/cli

# Ή με Chocolatey
choco install railway

# Verify
railway --version
```

#### Login στο Railway:

```bash
railway login
```

Browser θα ανοίξει - Login με το account σου.

#### Link το project:

```bash
# Navigate to project folder
cd C:\Users\Desktop\Desktop\xioufis

# Link project
railway link
# Επέλεξε το project "xioufis" ή "political-crm"
```

#### Δημιουργία Backup:

```bash
# Export entire database to SQL file
railway run pg_dump > backup_$(date +%Y%m%d_%H%M%S).sql

# Ή με συγκεκριμένο όνομα
railway run pg_dump > backup_2024_11_05.sql
```

**Αποτέλεσμα:** Ένα `.sql` αρχείο με **ΟΛΟΚΛΗΡΟ** τη database (structure + data)

#### Automated Backup Script (Windows):

Δημιούργησε αρχείο `backup_database.bat`:

```batch
@echo off
echo Starting Railway Database Backup...

:: Set backup directory
set BACKUP_DIR=C:\Users\Desktop\Desktop\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Generate filename with timestamp
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%b%%a)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a%%b)
set FILENAME=backup_%mydate%_%mytime%.sql

:: Run backup
cd C:\Users\Desktop\Desktop\xioufis
railway run pg_dump > "%BACKUP_DIR%\%FILENAME%"

echo Backup saved to: %BACKUP_DIR%\%FILENAME%
pause
```

**Run:** Double-click το `backup_database.bat`

#### Schedule Automatic Backups (Windows Task Scheduler):

1. Open **Task Scheduler**
2. Create **New Task**:
   - Name: `Railway DB Backup - Political CRM`
   - Trigger: Daily at 2:00 AM
   - Action: Run `backup_database.bat`
3. **Save**

Τώρα θα τρέχει αυτόματα κάθε μέρα!

---

### Option B: Backup μέσω Django Management Command

#### Δημιούργησε Custom Command:

Αρχείο: `citizens/management/commands/backup_database.py`

```python
"""
Management command για database backup
Usage: python manage.py backup_database
"""

from django.core.management.base import BaseCommand
from django.conf import settings
import subprocess
import os
from datetime import datetime

class Command(BaseCommand):
    help = 'Creates a backup of the Railway PostgreSQL database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            type=str,
            default='backups',
            help='Directory to save backup files'
        )

    def handle(self, *args, **options):
        output_dir = options['output_dir']

        # Create backup directory if it doesn't exist
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'backup_{timestamp}.sql'
        filepath = os.path.join(output_dir, filename)

        # Get DATABASE_URL from settings
        db_url = settings.DATABASES['default'].get('URL') or os.environ.get('DATABASE_URL')

        if not db_url:
            self.stdout.write(self.style.ERROR(
                'DATABASE_URL not found. Are you in production?'
            ))
            return

        # Run pg_dump
        self.stdout.write('Creating database backup...')

        try:
            with open(filepath, 'w') as f:
                subprocess.run(
                    ['pg_dump', db_url],
                    stdout=f,
                    check=True
                )

            self.stdout.write(self.style.SUCCESS(
                f'✓ Backup created successfully: {filepath}'
            ))

            # Show file size
            size = os.path.getsize(filepath) / (1024 * 1024)  # MB
            self.stdout.write(f'Backup size: {size:.2f} MB')

        except subprocess.CalledProcessError as e:
            self.stdout.write(self.style.ERROR(
                f'✗ Backup failed: {e}'
            ))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(
                '✗ pg_dump not found. Install PostgreSQL client tools.'
            ))
```

#### Usage:

```bash
# Create backup
python manage.py backup_database

# Custom output directory
python manage.py backup_database --output-dir="C:\Backups\CRM"

# Via Railway CLI (production)
railway run python manage.py backup_database
```

---

### Option C: Export μέσω Django Admin (Built-in)

Το app σου έχει ήδη **Import/Export functionality**!

#### Export Πολίτες:

1. Login στο **Admin**: `https://your-app.railway.app/admin/`
2. Πήγαινε στο **"Πολίτες"**
3. Click **"Export"** (πάνω δεξιά)
4. Επέλεξε format:
   - **Excel (.xlsx)** - Για editing
   - **CSV** - Για Google Sheets
   - **JSON** - Για full data
5. Click **"Submit"**

**Repeat** για:
- Αιτήματα (Requests)
- Επικοινωνίες (Communications)
- Στρατιωτικό Προσωπικό (Military Personnel)

✅ **Advantage:** Δεν χρειάζεται CLI
❌ **Disadvantage:** Πρέπει να exportάρεις κάθε model ξεχωριστά

---

## 📥 2. Restore Database από Backup

### Via Railway CLI:

```bash
# Restore από .sql file
railway run psql $DATABASE_URL < backup_2024_11_05.sql
```

### Via Django Admin (Import):

1. Login στο Admin
2. Πήγαινε στο model (π.χ. Πολίτες)
3. Click **"Import"**
4. Upload το Excel/CSV file
5. Map τις στήλες (αν χρειάζεται)
6. Click **"Confirm Import"**

⚠️ **ΠΡΟΣΟΧΗ:**
- Το import θα **προσθέσει** records, όχι replace
- Για full restore, κάνε πρώτα **flush database**

---

## 📊 3. Import Δεδομένων από Google Sheets

### Step 1: Export από Google Sheets

1. Άνοιξε το **Google Sheet** με τα δεδομένα σου
2. Click **File** > **Download** > **Microsoft Excel (.xlsx)**
   - Ή **Comma Separated Values (.csv)**
3. Save το αρχείο στον υπολογιστή σου

### Step 2: Προετοιμασία Αρχείου

**Απαιτούμενες στήλες για ΠΟΛΙΤΕΣ:**

| Στήλη | Απαιτείται | Παράδειγμα |
|-------|-----------|-----------|
| επιθετο | ✅ | Παπαδόπουλος |
| ονομα | ✅ | Γιάννης |
| πατρωνυμο | ❌ | Δημητρίου |
| κινητο | ✅* | 6912345678 |
| σταθερο | ❌ | 2310123456 |
| email | ✅* | test@example.com |
| διευθυνση | ❌ | Τσιμισκή 10 |
| τκ | ❌ | 54622 |
| δημος | ❌ | ΘΕΣΣΑΛΟΝΙΚΗΣ |
| εκλογικη_περιφερεια | ❌ | Α_ΘΕΣΣΑΛΟΝΙΚΗΣ |
| κατηγορια_επαφης | ❌ | GDPR |
| ιδιοτητα | ❌ | Φοιτητής |
| συσταση_απο | ❌ | Κώστας Β. |
| παρατηρησεις | ❌ | Σημειώσεις εδώ |

**✅* Τουλάχιστον ένα από (κινητο, σταθερο, email) είναι required**

**Format κινητού/σταθερού:**
- ✅ Σωστά: `6912345678`, `2310123456`, `+306912345678`
- ❌ Λάθος: `691-234-5678`, `691 234 5678`

**Format δήμου:**
```
ΠΑΥΛΟΥ_ΜΕΛΑ
ΚΟΡΔΕΛΙΟΥ_ΕΥΟΣΜΟΥ
ΑΜΠΕΛΟΚΗΠΩΝ_ΜΕΝΕΜΕΝΗΣ
ΝΕΑΠΟΛΗΣ_ΣΥΚΕΩΝ
ΘΕΣΣΑΛΟΝΙΚΗΣ
ΚΑΛΑΜΑΡΙΑΣ
ΑΛΛΟ
```

**Format εκλογικής περιφέρειας:**
```
Α_ΘΕΣΣΑΛΟΝΙΚΗΣ
Β_ΘΕΣΣΑΛΟΝΙΚΗΣ
ΑΛΛΟ
```

### Step 3: Import στο Django Admin

1. **Login**: `https://your-app.railway.app/admin/`
2. Πήγαινε στο **"Πολίτες"**
3. Click **"Import"** (πάνω δεξιά)
4. **Upload file**: Επέλεξε το .xlsx ή .csv
5. **Preview**: Θα δεις preview των δεδομένων
6. **Confirm**: Click "Confirm Import"

**Αποτέλεσμα:**
```
✓ 150 new records imported
✗ 3 records skipped (errors)
```

### Step 4: Έλεγχος Errors

Αν υπάρχουν errors:

1. Click **"Export"** για να δεις ποια records failed
2. Συνήθως λάθη:
   - ❌ Invalid phone format
   - ❌ Duplicate citizen (ίδιο επίθετο + όνομα + κινητό)
   - ❌ Missing required fields

3. **Fix** στο Excel
4. **Re-import** μόνο τα failed records

---

## 📝 4. Import Template (Έτοιμο Αρχείο)

### Download Template:

Δημιούργησε αρχείο `import_template_politai.xlsx` με headers:

```
επιθετο | ονομα | πατρωνυμο | κινητο | σταθερο | email | διευθυνση | τκ | δημος | εκλογικη_περιφερεια | κατηγορια_επαφης | ιδιοτητα | συσταση_απο | παρατηρησεις
```

**Παράδειγμα δεδομένων:**
```csv
Παπαδόπουλος,Γιάννης,Δημητρίου,6912345678,2310123456,giannis@example.com,Τσιμισκή 10,54622,ΘΕΣΣΑΛΟΝΙΚΗΣ,Α_ΘΕΣΣΑΛΟΝΙΚΗΣ,GDPR,Φοιτητής,Κώστας Β.,
Καραγιάννης,Μαρία,Αντωνίου,6987654321,,maria@example.com,,,ΠΑΥΛΟΥ_ΜΕΛΑ,Β_ΘΕΣΣΑΛΟΝΙΚΗΣ,ΑΙΤΗΜΑ,Συνταξιούχος,,Προτεραιότητα
```

Ή σε Excel format:

| επιθετο | ονομα | κινητο | email |
|---------|-------|--------|-------|
| Παπαδόπουλος | Γιάννης | 6912345678 | giannis@example.com |
| Καραγιάννης | Μαρία | 6987654321 | maria@example.com |

---

## 🔄 5. Script για Bulk Import από Google Sheets (Advanced)

Αν έχεις **πολλά** δεδομένα (>1000 rows), χρησιμοποίησε script:

### Αρχείο: `import_from_sheets.py`

```python
"""
Script για mass import από Google Sheets CSV
Usage: python import_from_sheets.py citizens_data.csv
"""

import csv
import sys
from django.core.management.base import BaseCommand
from citizens.models import Citizen
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Import citizens from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')

    def handle(self, *args, **options):
        csv_file = options['csv_file']

        success_count = 0
        error_count = 0
        errors = []

        with open(csv_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)

            for row_num, row in enumerate(reader, start=2):
                try:
                    # Create citizen
                    citizen = Citizen(
                        επιθετο=row['επιθετο'].strip(),
                        ονομα=row['ονομα'].strip(),
                        πατρωνυμο=row.get('πατρωνυμο', '').strip(),
                        κινητο=row.get('κινητο', '').strip(),
                        σταθερο=row.get('σταθερο', '').strip(),
                        email=row.get('email', '').strip(),
                        διευθυνση=row.get('διευθυνση', '').strip(),
                        τκ=row.get('τκ', '').strip(),
                        δημος=row.get('δημος', '').strip(),
                        εκλογικη_περιφερεια=row.get('εκλογικη_περιφερεια', '').strip(),
                        κατηγορια_επαφης=row.get('κατηγορια_επαφης', 'GDPR').strip(),
                        ιδιοτητα=row.get('ιδιοτητα', '').strip(),
                        συσταση_απο=row.get('συσταση_απο', '').strip(),
                        παρατηρησεις=row.get('παρατηρησεις', '').strip(),
                    )

                    # Validate
                    citizen.full_clean()

                    # Save
                    citizen.save()

                    success_count += 1

                    if success_count % 50 == 0:
                        self.stdout.write(f'Imported {success_count} citizens...')

                except Exception as e:
                    error_count += 1
                    errors.append(f'Row {row_num}: {str(e)}')
                    self.stdout.write(self.style.WARNING(
                        f'✗ Row {row_num} failed: {str(e)}'
                    ))

        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS(
            f'✓ Successfully imported: {success_count} citizens'
        ))

        if error_count > 0:
            self.stdout.write(self.style.ERROR(
                f'✗ Failed: {error_count} records'
            ))
            self.stdout.write('\nErrors:')
            for error in errors[:10]:  # Show first 10 errors
                self.stdout.write(f'  - {error}')

        self.stdout.write('='*50)
```

**Save as:** `citizens/management/commands/import_from_sheets.py`

### Usage:

```bash
# Local
python manage.py import_from_sheets citizens_data.csv

# Production (Railway)
railway run python manage.py import_from_sheets citizens_data.csv
```

---

## 📈 6. Best Practices για Data Management

### ✅ DO:

1. **Κάνε backup ΠΡΙΝ deploy** μεγάλων αλλαγών
2. **Κάνε backup ΠΡΙΝ migrations** που αλλάζουν δομή
3. **Test το import σε development** πρώτα (SQLite)
4. **Κράτα 3-5 versions** των backups (rolling backup)
5. **Store backups σε 2+ locations** (local + cloud)
6. **Automated backups** με Task Scheduler (Windows) ή cron (Linux)

### ❌ DON'T:

1. ❌ Μην κάνεις **DROP DATABASE** στο production
2. ❌ Μην τρέξεις **migrations** χωρίς backup
3. ❌ Μην κάνεις **bulk delete** χωρίς backup
4. ❌ Μην αποθηκεύεις backups **ΜΟΝΟ** στο Railway
5. ❌ Μην ξεχάσεις να κάνεις **test restore** (verify backups work!)

---

## 🗄️ 7. Backup Strategy (Recommended)

### Τριπλή Προστασία:

```
┌─────────────────────────────────────────────────┐
│  BACKUP STRATEGY                                │
├─────────────────────────────────────────────────┤
│                                                 │
│  1️⃣ RAILWAY AUTO-BACKUPS                        │
│     ✓ Daily automatic                          │
│     ✓ 7-day retention                          │
│     ✓ Built-in                                 │
│                                                 │
│  2️⃣ MANUAL WEEKLY BACKUPS (via CLI)            │
│     ✓ Every Sunday 2 AM                        │
│     ✓ Store locally + Google Drive             │
│     ✓ Keep last 4 weeks (1 month)             │
│                                                 │
│  3️⃣ MANUAL EXPORT BEFORE BIG CHANGES           │
│     ✓ Before major migrations                  │
│     ✓ Before bulk updates/deletes              │
│     ✓ Store indefinitely                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Implementation:

**Windows Task Scheduler:**

```
Task 1: Weekly Backup
- Trigger: Every Sunday at 2:00 AM
- Action: C:\path\to\backup_database.bat
- Store in: C:\Backups\CRM\Weekly\

Task 2: Monthly Archive
- Trigger: First day of month at 3:00 AM
- Action: Copy weekly backup to C:\Backups\CRM\Monthly\
```

---

## 🆘 8. Disaster Recovery Plan

Σε περίπτωση **απώλειας δεδομένων**:

### Step 1: Identify the Issue

```bash
# Check database status
railway run python manage.py dbshell
\dt  # List all tables
SELECT COUNT(*) FROM citizens_citizen;  # Count records
```

### Step 2: Restore from Backup

```bash
# Find latest backup
ls -lt backups/

# Restore
railway run psql $DATABASE_URL < backups/backup_latest.sql
```

### Step 3: Verify

```bash
# Run checks
railway run python manage.py check

# Run migrations
railway run python manage.py migrate

# Test admin access
# Visit: https://your-app.railway.app/admin/
```

### Step 4: Import Missing Data

Αν κάποια δεδομένα λείπουν:

1. Export από το **latest Excel backup**
2. Import μέσω **Django Admin** > "Import"
3. Verify counts: Citizens, Requests, Communications

---

## 📞 Support & Resources

**Railway Database Docs:**
- https://docs.railway.app/databases/postgresql
- https://docs.railway.app/guides/backups

**Django Import/Export:**
- https://django-import-export.readthedocs.io/

**PostgreSQL Backup Tools:**
- `pg_dump` - Export database
- `psql` - Import/restore database
- Install: https://www.postgresql.org/download/

**Questions?**
- Railway Discord: https://discord.gg/railway
- Django Forum: https://forum.djangoproject.com/

---

## ✅ Checklist πριν το Production Deploy

- [ ] Railway PostgreSQL database provisioned
- [ ] Automatic backups enabled (Railway built-in)
- [ ] Manual backup script created (`backup_database.bat`)
- [ ] Windows Task Scheduler configured (weekly backups)
- [ ] Backup storage location setup (local + cloud)
- [ ] Import template Excel file created
- [ ] Test import με sample data (10-20 records)
- [ ] Test restore από backup
- [ ] Disaster recovery plan documented
- [ ] Team trained on backup/restore procedures

---

**Created:** Νοέμβριος 2024
**Status:** ✅ Production Ready
**Maintenance:** Ελέγχου backups κάθε μήνα
