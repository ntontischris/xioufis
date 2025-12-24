"""
Shared test fixtures for citizens app.

Provides reusable fixtures for:
- Users (admin, regular users)
- Citizens with various configurations
- Military personnel
- Requests and communications
"""
import pytest
from datetime import date, timedelta
from django.contrib.auth.models import User, Group


@pytest.fixture
def admin_user(db):
    """Create admin superuser for tests."""
    user = User.objects.create_superuser(
        username='admin',
        email='admin@test.com',
        password='password123'
    )
    return user


@pytest.fixture
def staff_user(db):
    """Create staff user (Admin group) for tests."""
    user = User.objects.create_user(
        username='staffuser',
        email='staff@test.com',
        password='password123',
        is_staff=True
    )
    # Create Admins group if doesn't exist
    group, _ = Group.objects.get_or_create(name='Admins')
    user.groups.add(group)
    return user


@pytest.fixture
def regular_user(db):
    """Create regular user for tests."""
    user = User.objects.create_user(
        username='regularuser',
        email='regular@test.com',
        password='password123',
        is_staff=True
    )
    # Create Regular Users group if doesn't exist
    group, _ = Group.objects.get_or_create(name='Regular Users')
    user.groups.add(group)
    return user


@pytest.fixture
def citizen(db):
    """Create basic citizen for tests."""
    from citizens.models import Citizen
    return Citizen.objects.create(
        επιθετο="Τεστ",
        ονομα="Χρήστης",
        κινητο="6912345678"
    )


@pytest.fixture
def citizen_with_email(db):
    """Create citizen with email for tests."""
    from citizens.models import Citizen
    return Citizen.objects.create(
        επιθετο="Παπαδόπουλος",
        ονομα="Γιώργος",
        πατρωνυμο="Δημητρίου",
        email="g.papadopoulos@example.com",
        δημος="ΘΕΣΣΑΛΟΝΙΚΗΣ"
    )


@pytest.fixture
def citizen_full(db, staff_user):
    """Create citizen with all fields populated."""
    from citizens.models import Citizen
    return Citizen.objects.create(
        επιθετο="Πλήρης",
        ονομα="Πολίτης",
        πατρωνυμο="Πατέρας",
        κινητο="6945678901",
        σταθερο="2310123456",
        email="full@example.com",
        διευθυνση="Τσιμισκή 15",
        τκ="54623",
        δημος="ΘΕΣΣΑΛΟΝΙΚΗΣ",
        περιοχη="Κέντρο",
        εκλογικη_περιφερεια="Β_ΘΕΣΣΑΛΟΝΙΚΗΣ",
        κατηγορια_επαφης="ΑΙΤΗΜΑ",
        ιδιοτητα="Επιχειρηματίας",
        αρμοδιος_συνεργατης=staff_user,
        παρατηρησεις="Σημαντικός πολίτης"
    )


@pytest.fixture
def military_citizen(db, citizen):
    """Create citizen with linked military personnel."""
    from citizens.models import MilitaryPersonnel
    MilitaryPersonnel.objects.create(
        πολιτης=citizen,
        τυπος='ΣΤΡΑΤΙΩΤΗΣ',
        επωνυμο=citizen.επιθετο,
        ονομα=citizen.ονομα,
        κινητο=citizen.κινητο,
        εσσο_ετος='2025',
        εσσο_γραμμα='Α'
    )
    return citizen


@pytest.fixture
def permanent_military_citizen(db):
    """Create citizen with permanent military personnel (Μόνιμος)."""
    from citizens.models import Citizen, MilitaryPersonnel
    citizen = Citizen.objects.create(
        επιθετο="Μόνιμος",
        ονομα="Αξιωματικός",
        κινητο="6987654321"
    )
    MilitaryPersonnel.objects.create(
        πολιτης=citizen,
        τυπος='ΜΟΝΙΜΟΣ',
        επωνυμο=citizen.επιθετο,
        ονομα=citizen.ονομα,
        κινητο=citizen.κινητο,
        βαθμος='Λοχαγός',
        μοναδα_υπηρεσιας='3η Μηχανοκίνητη Μεραρχία'
    )
    return citizen


@pytest.fixture
def pending_request(db, citizen, staff_user):
    """Create pending request for citizen."""
    from citizens.models import Request
    return Request.objects.create(
        πολιτης=citizen,
        κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
        κατασταση='ΕΚΚΡΕΜΕΙ',
        ημερομηνια_αποστολης=date.today() - timedelta(days=10),
        αιτημα_κειμενο='Αίτημα για χορήγηση άδειας',
        created_by=staff_user
    )


@pytest.fixture
def old_pending_request(db, citizen, staff_user):
    """Create old pending request (>25 days) that needs reminder."""
    from citizens.models import Request
    return Request.objects.create(
        πολιτης=citizen,
        κατηγορια_αιτηματος='ΣΤΡΑΤΙΩΤΙΚΟ',
        κατασταση='ΕΚΚΡΕΜΕΙ',
        ημερομηνια_αποστολης=date.today() - timedelta(days=30),
        αιτημα_κειμενο='Παλιό αίτημα που χρειάζεται υπενθύμιση',
        created_by=staff_user
    )


@pytest.fixture
def completed_request(db, citizen, staff_user):
    """Create completed request for citizen."""
    from citizens.models import Request
    return Request.objects.create(
        πολιτης=citizen,
        κατηγορια_αιτηματος='ΙΑΤΡΙΚΟ',
        κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ',
        ημερομηνια_αποστολης=date.today() - timedelta(days=15),
        ημερομηνια_ολοκληρωσης=date.today() - timedelta(days=5),
        αιτημα_κειμενο='Ολοκληρωμένο αίτημα',
        created_by=staff_user
    )


@pytest.fixture
def communication(db, citizen, staff_user):
    """Create communication record for citizen."""
    from citizens.models import Communication
    return Communication.objects.create(
        πολιτης=citizen,
        ημερομηνια_επικοινωνιας=date.today(),
        τυπος='ΤΗΛΕΦΩΝΟ',
        σημειωσεις='Τηλεφωνική επικοινωνία για ενημέρωση',
        created_by=staff_user
    )


@pytest.fixture
def user_groups(db):
    """Create user groups (Admins and Regular Users)."""
    admins_group, _ = Group.objects.get_or_create(name='Admins')
    regular_group, _ = Group.objects.get_or_create(name='Regular Users')
    return {'admins': admins_group, 'regular': regular_group}


@pytest.fixture
def client_logged_in(client, admin_user):
    """Return client logged in as admin."""
    client.force_login(admin_user)
    return client
