"""
Signal handlers for Citizens app
"""
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Request, MilitaryPersonnel, Citizen
from datetime import date


@receiver(pre_save, sender=Request)
def auto_set_completion_date(sender, instance, **kwargs):
    """
    Automatically set ημερομηνια_ολοκληρωσης when status changes to ΟΛΟΚΛΗΡΩΜΕΝΟ
    """
    if (instance.κατασταση == Request.ΚατάστασηChoices.ΟΛΟΚΛΗΡΩΜΕΝΟ and
        not instance.ημερομηνια_ολοκληρωσης):
        instance.ημερομηνια_ολοκληρωσης = date.today()


@receiver(pre_save, sender=MilitaryPersonnel)
def auto_create_or_sync_citizen_for_military(sender, instance, **kwargs):
    """
    Automatically create or sync Citizen when MilitaryPersonnel is saved.

    Business Logic:
    - Scenario 1: Created from standalone MilitaryPersonnel admin
      → Create new Citizen from MilitaryPersonnel data
    - Scenario 2: Created from Citizen inline
      → Sync MilitaryPersonnel data from existing Citizen (done in save_formset)
    - Always ensure Citizen link exists
    """
    if not instance.πολιτης_id:
        # Scenario 1: No citizen exists - create one (standalone admin)
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

        # Link to military personnel
        instance.πολιτης = citizen
    else:
        # Scenario 2: Citizen exists (from inline)
        # Sync is already handled in CitizenAdmin.save_formset()
        # But we can optionally sync back to Citizen if needed
        pass
