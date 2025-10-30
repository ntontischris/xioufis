"""
Tests for Citizens app

Run with:
    pytest
    pytest -v
    pytest --cov=citizens
"""

import pytest
from datetime import date, timedelta
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from citizens.models import Citizen, Communication, Request, MilitaryRequest


@pytest.mark.django_db
class TestCitizenModel:
    """Tests for Citizen model"""

    def test_create_citizen_valid(self):
        """Test creating a citizen with valid data"""
        citizen = Citizen.objects.create(
            επιθετο="Παπάς",
            ονομα="Γιάννης",
            κινητο="6912345678"
        )
        assert citizen.id is not None
        assert str(citizen) == "Παπάς Γιάννης"

    def test_citizen_requires_contact_method(self):
        """Test that at least one contact method is required"""
        citizen = Citizen(
            επιθετο="Τεστ",
            ονομα="Χρήστης"
        )
        with pytest.raises(ValidationError):
            citizen.full_clean()

    def test_citizen_phone_validation(self):
        """Test phone number validation"""
        # Valid phone
        citizen = Citizen(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )
        citizen.full_clean()  # Should not raise

        # Invalid phone (too short)
        citizen.κινητο = "691234"
        with pytest.raises(ValidationError):
            citizen.full_clean()

    def test_citizen_full_name_property(self):
        """Test full_name property"""
        citizen = Citizen.objects.create(
            επιθετο="Παπαδόπουλος",
            ονομα="Ιωάννης",
            πατρωνυμο="Δημητρίου",
            email="test@example.com"
        )
        assert citizen.full_name == "Παπαδόπουλος Ιωάννης (Δημητρίου)"

        citizen.πατρωνυμο = ""
        citizen.save()
        assert citizen.full_name == "Παπαδόπουλος Ιωάννης"

    def test_citizen_soft_delete(self):
        """Test soft delete functionality"""
        citizen = Citizen.objects.create(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )

        # Deactivate
        citizen.is_active = False
        citizen.save()

        assert citizen.archived_at is not None

    def test_citizen_active_requests_count(self):
        """Test active_requests_count property"""
        citizen = Citizen.objects.create(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )

        # Create requests
        Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
            κατασταση='ΕΚΚΡΕΜΕΙ',
            αιτημα_κειμενο='Test request 1'
        )
        Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΙΑΤΡΙΚΟ',
            κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ',
            αιτημα_κειμενο='Test request 2'
        )

        assert citizen.active_requests_count == 1  # Only non-completed


@pytest.mark.django_db
class TestRequestModel:
    """Tests for Request model"""

    def test_create_request_valid(self):
        """Test creating a request"""
        citizen = Citizen.objects.create(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )

        request = Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΣΤΡΑΤΙΩΤΙΚΟ',
            κατασταση='ΕΚΚΡΕΜΕΙ',
            αιτημα_κειμενο='Αίτημα για τοποθέτηση'
        )

        assert request.id is not None
        assert request.κατασταση == 'ΕΚΚΡΕΜΕΙ'

    def test_request_needs_reminder(self):
        """Test needs_reminder property"""
        citizen = Citizen.objects.create(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )

        # Request older than 25 days
        old_date = date.today() - timedelta(days=30)
        request = Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
            κατασταση='ΕΚΚΡΕΜΕΙ',
            ημερομηνια_αποστολης=old_date,
            αιτημα_κειμενο='Old request'
        )

        assert request.needs_reminder is True
        assert request.days_pending > 25

    def test_request_completion_date_validation(self):
        """Test that completion date must be after submission date"""
        citizen = Citizen.objects.create(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )

        request = Request(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
            κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ',
            ημερομηνια_αποστολης=date.today(),
            ημερομηνια_ολοκληρωσης=date.today() - timedelta(days=1),
            αιτημα_κειμενο='Test'
        )

        with pytest.raises(ValidationError):
            request.full_clean()

    def test_request_requires_completion_date_when_completed(self):
        """Test that ΟΛΟΚΛΗΡΩΜΕΝΟ requires completion date"""
        citizen = Citizen.objects.create(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )

        request = Request(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
            κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ',
            ημερομηνια_ολοκληρωσης=None,
            αιτημα_κειμενο='Test'
        )

        with pytest.raises(ValidationError):
            request.full_clean()


@pytest.mark.django_db
class TestMilitaryRequestModel:
    """Tests for MilitaryRequest model"""

    def test_create_military_request(self):
        """Test creating military request"""
        citizen = Citizen.objects.create(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )

        request = Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΣΤΡΑΤΙΩΤΙΚΟ',
            αιτημα_κειμενο='Military request'
        )

        military = MilitaryRequest.objects.create(
            αιτημα=request,
            τυπος='ΣΤΡΑΤΙΩΤΗΣ',
            ονομα='Ιωάννης',
            επωνυμο='Παπαδόπουλος',
            εσσο_ετος='2025',
            εσσο_γραμμα='Α'
        )

        assert military.εσσο == '2025Α'

    def test_military_request_εσσο_property(self):
        """Test ΕΣΣΟ computed property"""
        citizen = Citizen.objects.create(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )

        request = Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΣΤΡΑΤΙΩΤΙΚΟ',
            αιτημα_κειμενο='Test'
        )

        military = MilitaryRequest.objects.create(
            αιτημα=request,
            τυπος='ΣΤΡΑΤΙΩΤΗΣ',
            ονομα='Test',
            επωνυμο='User'
        )

        # No ΕΣΣΟ data
        assert military.εσσο == ""

        # Add ΕΣΣΟ data
        military.εσσο_ετος = '2025'
        military.εσσο_γραμμα = 'Β'
        military.save()

        assert military.εσσο == "2025Β"


@pytest.mark.django_db
class TestCommunicationModel:
    """Tests for Communication model"""

    def test_create_communication(self):
        """Test creating communication record"""
        citizen = Citizen.objects.create(
            επιθετο="Τεστ",
            ονομα="Χρήστης",
            κινητο="6912345678"
        )

        user = User.objects.create_user('testuser', 'test@example.com', 'password')

        comm = Communication.objects.create(
            πολιτης=citizen,
            ημερομηνια_επικοινωνιας=date.today(),
            τυπος='ΤΗΛΕΦΩΝΟ',
            σημειωσεις='Test communication',
            created_by=user
        )

        assert comm.id is not None
        assert comm.created_by == user
