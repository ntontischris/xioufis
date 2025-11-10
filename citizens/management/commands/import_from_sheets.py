"""
Management command για mass import πολιτών από CSV (Google Sheets)

Διαβάζει CSV αρχείο και δημιουργεί Citizen records με validation

Usage:
    python manage.py import_from_sheets citizens_data.csv
    python manage.py import_from_sheets data.csv --dry-run
    railway run python manage.py import_from_sheets citizens.csv
"""

import csv
from django.core.management.base import BaseCommand
from django.core.exceptions import ValidationError
from django.db import transaction
from citizens.models import Citizen
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Import citizens από CSV file (Google Sheets export)'

    def add_arguments(self, parser):
        parser.add_argument(
            'csv_file',
            type=str,
            help='Path to CSV file με δεδομένα πολιτών'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Test import χωρίς να αποθηκεύσει στη database'
        )
        parser.add_argument(
            '--skip-duplicates',
            action='store_true',
            help='Skip records που υπάρχουν ήδη (αντί για error)'
        )
        parser.add_argument(
            '--default-collaborator',
            type=str,
            help='Username του default αρμόδιου συνεργάτη'
        )

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        dry_run = options['dry_run']
        skip_duplicates = options['skip_duplicates']
        default_collaborator_username = options.get('default_collaborator')

        # Λήψη default collaborator αν δόθηκε
        default_collaborator = None
        if default_collaborator_username:
            try:
                default_collaborator = User.objects.get(
                    username=default_collaborator_username
                )
                self.stdout.write(f'✓ Default αρμόδιος: {default_collaborator.get_full_name()}')
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(
                    f'✗ User "{default_collaborator_username}" δεν βρέθηκε'
                ))
                return

        # Counters
        success_count = 0
        error_count = 0
        skip_count = 0
        errors = []

        if dry_run:
            self.stdout.write(self.style.WARNING(
                '⚠ DRY RUN MODE - Δεν θα αποθηκευτούν δεδομένα\n'
            ))

        self.stdout.write(f'📂 Reading file: {csv_file}\n')

        try:
            with open(csv_file, 'r', encoding='utf-8-sig') as f:
                # Detect delimiter (comma or semicolon)
                sample = f.read(1024)
                f.seek(0)

                delimiter = ','
                if ';' in sample and sample.count(';') > sample.count(','):
                    delimiter = ';'

                reader = csv.DictReader(f, delimiter=delimiter)

                # Έλεγχος headers
                required_headers = ['επιθετο', 'ονομα']
                contact_headers = ['κινητο', 'σταθερο', 'email']

                if not all(h in reader.fieldnames for h in required_headers):
                    self.stdout.write(self.style.ERROR(
                        f'✗ Λείπουν απαιτούμενες στήλες: {required_headers}'
                    ))
                    self.stdout.write(f'Διαθέσιμες στήλες: {reader.fieldnames}')
                    return

                # Process rows
                for row_num, row in enumerate(reader, start=2):
                    try:
                        # Έλεγχος αν υπάρχει ήδη
                        επιθετο = row['επιθετο'].strip()
                        ονομα = row['ονομα'].strip()
                        κινητο = row.get('κινητο', '').strip()

                        if skip_duplicates and κινητο:
                            existing = Citizen.objects.filter(
                                επιθετο=επιθετο,
                                ονομα=ονομα,
                                κινητο=κινητο,
                                is_active=True
                            ).exists()

                            if existing:
                                skip_count += 1
                                self.stdout.write(self.style.WARNING(
                                    f'⊘ Row {row_num}: Skipped (duplicate) - {επιθετο} {ονομα}'
                                ))
                                continue

                        # Δημιουργία citizen
                        citizen_data = {
                            'επιθετο': επιθετο,
                            'ονομα': ονομα,
                            'πατρωνυμο': row.get('πατρωνυμο', '').strip(),
                            'κινητο': κινητο,
                            'σταθερο': row.get('σταθερο', '').strip(),
                            'email': row.get('email', '').strip(),
                            'διευθυνση': row.get('διευθυνση', '').strip(),
                            'τκ': row.get('τκ', '').strip(),
                            'δημος': row.get('δημος', '').strip(),
                            'εκλογικη_περιφερεια': row.get('εκλογικη_περιφερεια', '').strip(),
                            'κατηγορια_επαφης': row.get('κατηγορια_επαφης', 'GDPR').strip() or 'GDPR',
                            'ιδιοτητα': row.get('ιδιοτητα', '').strip(),
                            'συσταση_απο': row.get('συσταση_απο', '').strip(),
                            'παρατηρησεις': row.get('παρατηρησεις', '').strip(),
                        }

                        # Προσθήκη default collaborator
                        if default_collaborator:
                            citizen_data['αρμοδιος_συνεργατης'] = default_collaborator

                        citizen = Citizen(**citizen_data)

                        # Validation
                        citizen.full_clean()

                        # Save (αν δεν είναι dry run)
                        if not dry_run:
                            citizen.save()

                        success_count += 1

                        # Progress indicator
                        if success_count % 50 == 0:
                            self.stdout.write(f'  ⏳ Imported {success_count} citizens...')

                    except ValidationError as e:
                        error_count += 1
                        error_msg = f'Row {row_num} ({επιθετο} {ονομα}): {e}'
                        errors.append(error_msg)
                        self.stdout.write(self.style.WARNING(
                            f'✗ {error_msg}'
                        ))

                    except Exception as e:
                        error_count += 1
                        error_msg = f'Row {row_num}: {str(e)}'
                        errors.append(error_msg)
                        self.stdout.write(self.style.WARNING(
                            f'✗ {error_msg}'
                        ))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(
                f'✗ File not found: {csv_file}'
            ))
            return

        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'✗ Unexpected error: {e}'
            ))
            return

        # Summary
        self.stdout.write('\n' + '='*60)

        if dry_run:
            self.stdout.write(self.style.WARNING(
                '⚠ DRY RUN - Κανένα record δεν αποθηκεύτηκε'
            ))

        self.stdout.write(self.style.SUCCESS(
            f'✓ Success: {success_count} citizens'
        ))

        if skip_count > 0:
            self.stdout.write(self.style.WARNING(
                f'⊘ Skipped: {skip_count} duplicates'
            ))

        if error_count > 0:
            self.stdout.write(self.style.ERROR(
                f'✗ Errors: {error_count} records'
            ))

            if errors:
                self.stdout.write('\nΠρώτα 10 errors:')
                for error in errors[:10]:
                    self.stdout.write(f'  • {error}')

                if len(errors) > 10:
                    self.stdout.write(f'  ... και {len(errors) - 10} ακόμα errors')

        total_processed = success_count + error_count + skip_count
        self.stdout.write(f'\nTotal processed: {total_processed} rows')
        self.stdout.write('='*60)

        # Συμβουλές
        if error_count > 0:
            self.stdout.write('\n💡 Tips για διόρθωση errors:')
            self.stdout.write('  • Έλεγξε το format των κινητών (10 ψηφία, π.χ. 6912345678)')
            self.stdout.write('  • Έλεγξε ότι υπάρχει τουλάχιστον ένα από: κινητο, σταθερο, email')
            self.stdout.write('  • Έλεγξε το format του ΤΚ (5 ψηφία)')
            self.stdout.write('  • Έλεγξε τα values για δήμος και εκλογική περιφέρεια')
            self.stdout.write('\n  Use --dry-run για preview χωρίς να αποθηκεύσεις')
            self.stdout.write('  Use --skip-duplicates για να skip existing records')


# Παράδειγμα CSV format:
"""
επιθετο,ονομα,πατρωνυμο,κινητο,σταθερο,email,διευθυνση,τκ,δημος,εκλογικη_περιφερεια,κατηγορια_επαφης,ιδιοτητα,συσταση_απο,παρατηρησεις
Παπαδόπουλος,Γιάννης,Δημητρίου,6912345678,2310123456,giannis@example.com,Τσιμισκή 10,54622,ΘΕΣΣΑΛΟΝΙΚΗΣ,Α_ΘΕΣΣΑΛΟΝΙΚΗΣ,GDPR,Φοιτητής,Κώστας Β.,
Καραγιάννης,Μαρία,Αντωνίου,6987654321,,maria@example.com,,,ΠΑΥΛΟΥ_ΜΕΛΑ,Β_ΘΕΣΣΑΛΟΝΙΚΗΣ,ΑΙΤΗΜΑ,Συνταξιούχος,,Προτεραιότητα
"""
