"""
Management command για έλεγχο και αποστολή υπενθυμίσεων.

Usage:
    python manage.py check_reminders

    # With cron (daily at 9 AM):
    0 9 * * * cd /path/to/project && /path/to/venv/bin/python manage.py check_reminders
"""

from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import date, timedelta
import logging

from citizens.models import Request

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Έλεγχος αιτημάτων > 25 ημέρες και αποστολή υπενθυμίσεων'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Εμφάνιση αιτημάτων που χρειάζονται υπενθύμιση χωρίς αποστολή emails',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=25,
            help='Ημέρες threshold για υπενθυμίσεις (default: 25)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        days_threshold = options['days']

        self.stdout.write(self.style.NOTICE(
            f'Έναρξη ελέγχου υπενθυμίσεων (threshold: {days_threshold} ημέρες)...'
        ))

        # Calculate threshold date
        threshold_date = date.today() - timedelta(days=days_threshold)

        # Find requests needing reminders
        requests_needing_reminder = Request.objects.filter(
            κατασταση=Request.ΚατάστασηChoices.ΕΚΚΡΕΜΕΙ,
            ημερομηνια_αποστολης__lte=threshold_date,
            reminder_sent=False
        ).select_related(
            'πολιτης',
            'πολιτης__αρμοδιος_συνεργατης',
            'created_by'
        )

        total_found = requests_needing_reminder.count()
        self.stdout.write(self.style.WARNING(
            f'Βρέθηκαν {total_found} αιτήματα που χρειάζονται υπενθύμιση'
        ))

        if total_found == 0:
            self.stdout.write(self.style.SUCCESS('✓ Δεν υπάρχουν αιτήματα για υπενθύμιση'))
            return

        sent_count = 0
        failed_count = 0
        skipped_count = 0

        for request in requests_needing_reminder:
            days_pending = (date.today() - request.ημερομηνια_αποστολης).days

            # Skip if no responsible user
            if not request.πολιτης.αρμοδιος_συνεργατης:
                skipped_count += 1
                self.stdout.write(self.style.WARNING(
                    f'⚠️  Request #{request.id} - Δεν έχει αρμόδιο συνεργάτη'
                ))
                logger.warning(
                    f'Request {request.id} ({request.πολιτης}) has no responsible user. Skipping.'
                )
                continue

            # Skip if no email
            if not request.πολιτης.αρμοδιος_συνεργατης.email:
                skipped_count += 1
                self.stdout.write(self.style.WARNING(
                    f'⚠️  Request #{request.id} - Ο αρμόδιος δεν έχει email'
                ))
                logger.warning(
                    f'Request {request.id}: Responsible user has no email'
                )
                continue

            if dry_run:
                self.stdout.write(
                    f'[DRY RUN] Θα στελνόταν email για Request #{request.id} '
                    f'({request.πολιτης}) - {days_pending} ημέρες'
                )
                sent_count += 1
                continue

            try:
                # Send reminder email
                self.send_reminder_email(request, days_pending)

                # Mark as sent
                request.reminder_sent = True
                request.reminder_sent_at = timezone.now()
                request.save(update_fields=['reminder_sent', 'reminder_sent_at'])

                sent_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f'✓ Email στάλθηκε για Request #{request.id} - {request.πολιτης} ({days_pending} ημέρες)'
                ))
                logger.info(f'Reminder sent for request {request.id}')

            except Exception as e:
                failed_count += 1
                self.stdout.write(self.style.ERROR(
                    f'✗ Σφάλμα στο Request #{request.id}: {str(e)}'
                ))
                logger.error(
                    f'Failed to send reminder for request {request.id}: {str(e)}',
                    exc_info=True
                )

        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(
            f'ΟΛΟΚΛΗΡΩΘΗΚΕ - Αποστολή Υπενθυμίσεων'
        ))
        self.stdout.write(f'  • Emails που στάλθηκαν: {sent_count}')
        self.stdout.write(f'  • Αποτυχίες: {failed_count}')
        self.stdout.write(f'  • Παραλήφθηκαν: {skipped_count}')
        self.stdout.write('='*60 + '\n')

        if dry_run:
            self.stdout.write(self.style.NOTICE(
                'Αυτό ήταν DRY RUN - Κανένα email δεν στάλθηκε πραγματικά'
            ))

        logger.info(
            f'Reminder check completed: {sent_count} sent, '
            f'{failed_count} failed, {skipped_count} skipped'
        )

    def send_reminder_email(self, request, days_pending):
        """
        Send reminder email to responsible user

        Args:
            request: Request instance needing reminder
            days_pending: Number of days the request has been pending
        """
        responsible_user = request.πολιτης.αρμοδιος_συνεργατης
        citizen = request.πολιτης

        subject = f'⚠️ Υπενθύμιση: Αίτημα εκκρεμεί {days_pending} ημέρες'

        message = f"""
Αγαπητέ/ή {responsible_user.get_full_name() or responsible_user.username},

Το παρακάτω αίτημα εκκρεμεί για {days_pending} ημέρες:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΣΤΟΙΧΕΙΑ ΑΙΤΗΜΑΤΟΣ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Πολίτης: {citizen.full_name}
Τηλέφωνο: {citizen.κινητο or citizen.σταθερο or '-'}
Email: {citizen.email or '-'}

Κατηγορία: {request.get_κατηγορια_αιτηματος_display()}
Ημερομηνία Αποστολής: {request.ημερομηνια_αποστολης.strftime('%d/%m/%Y')}
Κατάσταση: {request.get_κατασταση_display()}

Αίτημα:
{request.αιτημα_κειμενο[:500]}{'...' if len(request.αιτημα_κειμενο) > 500 else ''}

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
            message=message.strip(),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[responsible_user.email],
            fail_silently=False,
        )
