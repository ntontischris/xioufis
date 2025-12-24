r"""
Management command για database backup

Δημιουργεί backup της Railway PostgreSQL database σε .sql αρχείο

Usage:
    python manage.py backup_database
    python manage.py backup_database --output-dir="C:\Backups"
    railway run python manage.py backup_database
"""

from django.core.management.base import BaseCommand
from django.conf import settings
import subprocess
import os
from datetime import datetime


class Command(BaseCommand):
    help = 'Δημιουργεί backup της Railway PostgreSQL database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output-dir',
            type=str,
            default='backups',
            help='Φάκελος για αποθήκευση των backup files (default: backups/)'
        )
        parser.add_argument(
            '--compress',
            action='store_true',
            help='Συμπίεση του backup με gzip'
        )

    def handle(self, *args, **options):
        output_dir = options['output_dir']
        compress = options['compress']

        # Δημιουργία backup directory αν δεν υπάρχει
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            self.stdout.write(f'✓ Δημιουργήθηκε φάκελος: {output_dir}')

        # Δημιουργία filename με timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'backup_{timestamp}.sql'

        if compress:
            filename += '.gz'

        filepath = os.path.join(output_dir, filename)

        # Λήψη DATABASE_URL
        db_url = os.environ.get('DATABASE_URL')

        if not db_url:
            # Fallback: Construct from DATABASES settings
            db_config = settings.DATABASES['default']

            if db_config['ENGINE'] == 'django.db.backends.sqlite3':
                self.stdout.write(self.style.WARNING(
                    '⚠ SQLite database detected - use file copy for backup instead'
                ))
                self.stdout.write(f'Database location: {db_config["NAME"]}')
                return

            # Construct PostgreSQL URL
            user = db_config.get('USER', 'postgres')
            password = db_config.get('PASSWORD', '')
            host = db_config.get('HOST', 'localhost')
            port = db_config.get('PORT', '5432')
            name = db_config.get('NAME', 'postgres')

            db_url = f"postgresql://{user}:{password}@{host}:{port}/{name}"

        # Εκτέλεση pg_dump
        self.stdout.write('🔄 Δημιουργία database backup...')
        self.stdout.write(f'Output: {filepath}')

        try:
            if compress:
                # Backup με gzip compression
                with open(filepath, 'wb') as f:
                    process = subprocess.Popen(
                        ['pg_dump', db_url],
                        stdout=subprocess.PIPE
                    )
                    subprocess.run(
                        ['gzip'],
                        stdin=process.stdout,
                        stdout=f,
                        check=True
                    )
                    process.wait()
            else:
                # Κανονικό backup
                with open(filepath, 'w', encoding='utf-8') as f:
                    subprocess.run(
                        ['pg_dump', db_url],
                        stdout=f,
                        check=True,
                        text=True
                    )

            # Επιτυχής ολοκλήρωση
            self.stdout.write(self.style.SUCCESS(
                f'\n✓ Backup ολοκληρώθηκε επιτυχώς!'
            ))

            # Εμφάνιση μεγέθους αρχείου
            size = os.path.getsize(filepath) / (1024 * 1024)  # MB

            if size < 1:
                size_kb = os.path.getsize(filepath) / 1024
                self.stdout.write(f'  Μέγεθος: {size_kb:.2f} KB')
            else:
                self.stdout.write(f'  Μέγεθος: {size:.2f} MB')

            self.stdout.write(f'  Αρχείο: {filepath}')

            # Στατιστικά (προαιρετικά)
            self.stdout.write('\n📊 Database Statistics:')
            self._show_stats()

        except subprocess.CalledProcessError as e:
            self.stdout.write(self.style.ERROR(
                f'\n✗ Backup failed: {e}'
            ))
            self.stdout.write(
                'Βεβαιωθείτε ότι το pg_dump είναι εγκατεστημένο και στο PATH'
            )

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(
                '\n✗ pg_dump δεν βρέθηκε!'
            ))
            self.stdout.write('\nΕγκατάσταση:')
            self.stdout.write('  Windows: https://www.postgresql.org/download/windows/')
            self.stdout.write('  Mac: brew install postgresql')
            self.stdout.write('  Linux: sudo apt install postgresql-client')

        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'\n✗ Unexpected error: {e}'
            ))

    def _show_stats(self):
        """Εμφάνιση στατιστικών της database"""
        from citizens.models import Citizen, Request, Communication, MilitaryPersonnel

        try:
            citizens_count = Citizen.objects.filter(is_active=True).count()
            requests_count = Request.objects.count()
            comms_count = Communication.objects.count()
            military_count = MilitaryPersonnel.objects.count()

            self.stdout.write(f'  Πολίτες: {citizens_count}')
            self.stdout.write(f'  Αιτήματα: {requests_count}')
            self.stdout.write(f'  Επικοινωνίες: {comms_count}')
            self.stdout.write(f'  Στρατιωτικό Προσωπικό: {military_count}')

        except Exception:
            # Αν αποτύχει, απλά skip το stats
            pass
