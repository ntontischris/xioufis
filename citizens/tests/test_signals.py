"""
Tests for signal handlers in citizens app.

Tests cover:
- Request auto-completion date
- MilitaryPersonnel auto-creates Citizen
- Bidirectional sync between Citizen and MilitaryPersonnel
"""
import pytest
from datetime import date, timedelta

from citizens.models import Citizen, Request, MilitaryPersonnel


@pytest.mark.django_db
class TestRequestSignals:
    """Tests for Request signal handlers."""

    def test_auto_set_completion_date_on_completed(self, citizen):
        """When status changes to ΟΛΟΚΛΗΡΩΜΕΝΟ, completion date is auto-set."""
        request = Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
            κατασταση='ΕΚΚΡΕΜΕΙ',
            αιτημα_κειμενο='Test request'
        )

        # Change status to completed
        request.κατασταση = 'ΟΛΟΚΛΗΡΩΜΕΝΟ'
        request.save()

        request.refresh_from_db()
        assert request.ημερομηνια_ολοκληρωσης == date.today()

    def test_no_override_existing_completion_date(self, citizen):
        """Existing completion date should not be overridden."""
        yesterday = date.today() - timedelta(days=1)
        request = Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
            κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ',
            ημερομηνια_ολοκληρωσης=yesterday,
            αιτημα_κειμενο='Test request'
        )

        request.save()  # Re-save
        request.refresh_from_db()
        assert request.ημερομηνια_ολοκληρωσης == yesterday


@pytest.mark.django_db
class TestMilitaryPersonnelSignals:
    """Tests for MilitaryPersonnel signal handlers."""

    def test_auto_creates_citizen_when_no_citizen(self):
        """MilitaryPersonnel without citizen creates one automatically."""
        military = MilitaryPersonnel.objects.create(
            τυπος='ΣΤΡΑΤΙΩΤΗΣ',
            επωνυμο='Νέος',
            ονομα='Στρατιώτης',
            κινητο='6999999999',
            εσσο_ετος='2025',
            εσσο_γραμμα='Β'
        )

        assert military.πολιτης is not None
        assert military.πολιτης.επιθετο == 'Νέος'
        assert military.πολιτης.ονομα == 'Στρατιώτης'
        assert military.πολιτης.κινητο == '6999999999'
        assert military.πολιτης.ιδιοτητα == 'Στρατιωτικό Προσωπικό'

    def test_does_not_create_citizen_when_exists(self, citizen):
        """MilitaryPersonnel with existing citizen does not create new one."""
        citizen_id = citizen.pk
        military = MilitaryPersonnel.objects.create(
            πολιτης=citizen,
            τυπος='ΣΤΡΑΤΙΩΤΗΣ',
            επωνυμο=citizen.επιθετο,
            ονομα=citizen.ονομα,
            κινητο=citizen.κινητο,
            εσσο_ετος='2025',
            εσσο_γραμμα='Α'
        )

        assert military.πολιτης.pk == citizen_id
        # Should not have created a new citizen
        assert Citizen.objects.filter(pk=citizen_id).exists()


@pytest.mark.django_db
class TestBidirectionalSync:
    """Tests for bidirectional sync between Citizen and MilitaryPersonnel."""

    def test_citizen_changes_sync_to_military(self, military_citizen):
        """Changes to Citizen should sync to linked MilitaryPersonnel."""
        citizen = military_citizen
        military = citizen.military_personnel

        # Change citizen data
        citizen.επιθετο = 'Νέο Επώνυμο'
        citizen.ονομα = 'Νέο Όνομα'
        citizen.save()

        military.refresh_from_db()
        assert military.επωνυμο == 'Νέο Επώνυμο'
        assert military.ονομα == 'Νέο Όνομα'

    def test_military_changes_sync_to_citizen(self, military_citizen):
        """Changes to MilitaryPersonnel should sync to linked Citizen."""
        citizen = military_citizen
        military = citizen.military_personnel

        # Change military data
        military.επωνυμο = 'Αλλαγμένο'
        military.κινητο = '6988888888'
        military.save()

        citizen.refresh_from_db()
        assert citizen.επιθετο == 'Αλλαγμένο'
        assert citizen.κινητο == '6988888888'

    def test_sync_sets_ιδιοτητα_on_citizen(self, citizen):
        """Creating MilitaryPersonnel should set citizen's ιδιοτητα."""
        assert citizen.ιδιοτητα != 'Στρατιωτικό Προσωπικό'

        MilitaryPersonnel.objects.create(
            πολιτης=citizen,
            τυπος='ΜΟΝΙΜΟΣ',
            επωνυμο=citizen.επιθετο,
            ονομα=citizen.ονομα,
            κινητο=citizen.κινητο,
            βαθμος='Ανθυπολοχαγός'
        )

        citizen.refresh_from_db()
        assert citizen.ιδιοτητα == 'Στρατιωτικό Προσωπικό'

    def test_no_infinite_loop_on_sync(self, military_citizen):
        """Sync should not cause infinite loop when both sides save."""
        citizen = military_citizen
        military = citizen.military_personnel

        # This should not cause infinite recursion
        citizen.επιθετο = 'Τεστ Σύγχρονισμού'
        citizen.save()

        military.refresh_from_db()
        assert military.επωνυμο == 'Τεστ Σύγχρονισμού'

        # And the reverse
        military.ονομα = 'Αντίστροφο Τεστ'
        military.save()

        citizen.refresh_from_db()
        assert citizen.ονομα == 'Αντίστροφο Τεστ'
