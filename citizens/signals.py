"""
Signal handlers for Citizens app

Implements automatic data synchronization between models:
- Request: Auto-set completion date when status changes to ΟΛΟΚΛΗΡΩΜΕΝΟ
- MilitaryPersonnel ↔ Citizen: Bidirectional sync of basic info

Error handling with logging for production reliability.
"""
import logging
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from datetime import date

logger = logging.getLogger(__name__)


# ============================================
# REQUEST SIGNALS
# ============================================

@receiver(pre_save, sender='citizens.Request')
def auto_set_completion_date(sender, instance, **kwargs):
    """
    Automatically set ημερομηνια_ολοκληρωσης when status changes to ΟΛΟΚΛΗΡΩΜΕΝΟ.

    Business Rule:
    - When a request is marked as completed, auto-set completion date to today
    - Only if completion date is not already set
    """
    try:
        from .models import Request

        if (instance.κατασταση == Request.ΚατάστασηChoices.ΟΛΟΚΛΗΡΩΜΕΝΟ and
            not instance.ημερομηνια_ολοκληρωσης):
            instance.ημερομηνια_ολοκληρωσης = date.today()
            logger.debug(f"Auto-set completion date for request {instance.pk}")
    except Exception as e:
        logger.error(f"Error in auto_set_completion_date signal: {e}")
        raise  # Re-raise to prevent data corruption


# ============================================
# MILITARY PERSONNEL SIGNALS
# ============================================

@receiver(pre_save, sender='citizens.MilitaryPersonnel')
def auto_create_citizen_for_military(sender, instance, **kwargs):
    """
    Automatically create Citizen when MilitaryPersonnel is saved without a linked Citizen.

    Business Logic:
    - Scenario 1: Created from standalone MilitaryPersonnel admin
      → Create new Citizen from MilitaryPersonnel data
    - Scenario 2: Created from Citizen inline
      → Citizen already exists, just link them (handled in CitizenAdmin.save_formset)

    Error Handling:
    - Logs errors but re-raises to prevent orphaned MilitaryPersonnel
    """
    try:
        from .models import Citizen

        if not instance.πολιτης_id:
            # Scenario 1: No citizen exists - create one (standalone admin)
            logger.info(f"Creating Citizen for new MilitaryPersonnel: {instance.επωνυμο} {instance.ονομα}")

            citizen = Citizen(
                επιθετο=instance.επωνυμο,
                ονομα=instance.ονομα,
                πατρωνυμο=instance.πατρωνυμο or '',
                κινητο=instance.κινητο or '',
                email=instance.email or '',
                ιδιοτητα='Στρατιωτικό Προσωπικό',
                αρμοδιος_συνεργατης=instance.αρμοδιος_συνεργατης,
                κατηγορια_επαφης=Citizen.ΚατηγορίαΕπαφήςChoices.GDPR,
            )

            # Save the citizen first
            citizen.save()
            logger.info(f"Created Citizen {citizen.pk} for MilitaryPersonnel")

            # Link to military personnel
            instance.πολιτης = citizen

    except Exception as e:
        logger.error(f"Error creating Citizen for MilitaryPersonnel: {e}")
        raise  # Re-raise to prevent data corruption


@receiver(post_save, sender='citizens.Citizen')
def sync_citizen_to_military_personnel(sender, instance, **kwargs):
    """
    Sync Citizen data to linked MilitaryPersonnel when Citizen is updated.

    Business Logic:
    - When Citizen basic info (name, phone, email) changes, update MilitaryPersonnel
    - Prevents data drift between Citizen and MilitaryPersonnel
    - Uses update_fields to prevent infinite loops

    Error Handling:
    - Logs warnings but doesn't re-raise (non-critical sync)
    """
    try:
        # Check if citizen has military_personnel linked
        if not hasattr(instance, 'military_personnel'):
            return

        military = instance.military_personnel
        if not military:
            return

        # Track which fields need updating
        update_fields = []

        # Sync επώνυμο ↔ επίθετο
        if military.επωνυμο != instance.επιθετο:
            military.επωνυμο = instance.επιθετο
            update_fields.append('επωνυμο')

        # Sync όνομα
        if military.ονομα != instance.ονομα:
            military.ονομα = instance.ονομα
            update_fields.append('ονομα')

        # Sync πατρώνυμο
        if military.πατρωνυμο != (instance.πατρωνυμο or ''):
            military.πατρωνυμο = instance.πατρωνυμο or ''
            update_fields.append('πατρωνυμο')

        # Sync κινητό
        if military.κινητο != (instance.κινητο or ''):
            military.κινητο = instance.κινητο or ''
            update_fields.append('κινητο')

        # Sync email
        if military.email != (instance.email or ''):
            military.email = instance.email or ''
            update_fields.append('email')

        # Only save if something changed
        if update_fields:
            military.save(update_fields=update_fields)
            logger.debug(f"Synced Citizen {instance.pk} to MilitaryPersonnel {military.pk}: {update_fields}")

    except Exception as e:
        # Log but don't re-raise - sync is non-critical
        logger.warning(f"Error syncing Citizen to MilitaryPersonnel: {e}")


@receiver(post_save, sender='citizens.MilitaryPersonnel')
def sync_military_personnel_to_citizen(sender, instance, created, **kwargs):
    """
    Sync MilitaryPersonnel data back to Citizen when MilitaryPersonnel is updated.

    Business Logic:
    - When MilitaryPersonnel is edited directly (not via Citizen inline),
      sync changes back to Citizen
    - Only syncs if the values actually differ (prevents infinite loops)
    - Sets ιδιοτητα to 'Στρατιωτικό Προσωπικό' if not already set

    Error Handling:
    - Logs warnings but doesn't re-raise (non-critical sync)
    """
    try:
        if not instance.πολιτης:
            return

        citizen = instance.πολιτης

        # Track which fields need updating
        update_fields = []

        # Sync επίθετο ↔ επώνυμο
        if citizen.επιθετο != instance.επωνυμο:
            citizen.επιθετο = instance.επωνυμο
            update_fields.append('επιθετο')

        # Sync όνομα
        if citizen.ονομα != instance.ονομα:
            citizen.ονομα = instance.ονομα
            update_fields.append('ονομα')

        # Sync πατρώνυμο
        if citizen.πατρωνυμο != (instance.πατρωνυμο or ''):
            citizen.πατρωνυμο = instance.πατρωνυμο or ''
            update_fields.append('πατρωνυμο')

        # Sync κινητό
        if citizen.κινητο != (instance.κινητο or ''):
            citizen.κινητο = instance.κινητο or ''
            update_fields.append('κινητο')

        # Sync email
        if citizen.email != (instance.email or ''):
            citizen.email = instance.email or ''
            update_fields.append('email')

        # Ensure ιδιοτητα is set for military personnel
        if citizen.ιδιοτητα != 'Στρατιωτικό Προσωπικό':
            citizen.ιδιοτητα = 'Στρατιωτικό Προσωπικό'
            update_fields.append('ιδιοτητα')

        # Only save if something changed
        if update_fields:
            citizen.save(update_fields=update_fields)
            logger.debug(f"Synced MilitaryPersonnel {instance.pk} to Citizen {citizen.pk}: {update_fields}")

    except Exception as e:
        # Log but don't re-raise - sync is non-critical
        logger.warning(f"Error syncing MilitaryPersonnel to Citizen: {e}")
