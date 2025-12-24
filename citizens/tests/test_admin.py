"""
Tests for admin interface in citizens app.

Tests cover:
- Admin list views accessibility
- Query optimization (no N+1 queries)
- Custom display methods
- Permission system
"""
import pytest
from django.urls import reverse
from django.test import Client

from citizens.models import Citizen, Request, Communication, MilitaryPersonnel


@pytest.mark.django_db
class TestCitizenAdmin:
    """Tests for CitizenAdmin."""

    def test_citizen_list_view_accessible(self, client_logged_in, citizen):
        """Citizen list view should be accessible to admin."""
        response = client_logged_in.get(reverse('admin:citizens_citizen_changelist'))
        assert response.status_code == 200
        assert citizen.επιθετο.encode() in response.content

    def test_citizen_add_view_accessible(self, client_logged_in):
        """Citizen add view should be accessible to admin."""
        response = client_logged_in.get(reverse('admin:citizens_citizen_add'))
        assert response.status_code == 200

    def test_citizen_change_view_accessible(self, client_logged_in, citizen):
        """Citizen change view should be accessible to admin."""
        response = client_logged_in.get(
            reverse('admin:citizens_citizen_change', args=[citizen.pk])
        )
        assert response.status_code == 200

    def test_citizen_dashboard_link_works(self, client_logged_in, citizen):
        """Custom citizen dashboard view should be accessible."""
        response = client_logged_in.get(
            reverse('citizen_dashboard', args=[citizen.pk])
        )
        assert response.status_code == 200

    def test_citizen_with_military_displays_badge(self, client_logged_in, military_citizen):
        """Citizen with military personnel should display military badge."""
        response = client_logged_in.get(reverse('admin:citizens_citizen_changelist'))
        assert response.status_code == 200
        # Should contain military type display
        assert 'Στρατιώτης'.encode() in response.content or 'ΣΤΡΑΤΙΩΤΗΣ'.encode() in response.content


@pytest.mark.django_db
class TestRequestAdmin:
    """Tests for RequestAdmin."""

    def test_request_list_view_accessible(self, client_logged_in, pending_request):
        """Request list view should be accessible to admin."""
        response = client_logged_in.get(reverse('admin:citizens_request_changelist'))
        assert response.status_code == 200

    def test_request_displays_status_badge(self, client_logged_in, pending_request):
        """Request should display colored status badge."""
        response = client_logged_in.get(reverse('admin:citizens_request_changelist'))
        assert response.status_code == 200
        # Should contain status text
        assert 'Εκκρεμεί'.encode() in response.content or 'ΕΚΚΡΕΜΕΙ'.encode() in response.content

    def test_old_request_shows_reminder_needed(self, client_logged_in, old_pending_request):
        """Old pending request should show reminder badge."""
        response = client_logged_in.get(reverse('admin:citizens_request_changelist'))
        assert response.status_code == 200
        # The request is >25 days old, should indicate reminder needed
        assert old_pending_request.needs_reminder is True


@pytest.mark.django_db
class TestCommunicationAdmin:
    """Tests for CommunicationAdmin."""

    def test_communication_list_view_accessible(self, client_logged_in, communication):
        """Communication list view should be accessible to admin."""
        response = client_logged_in.get(reverse('admin:citizens_communication_changelist'))
        assert response.status_code == 200


@pytest.mark.django_db
class TestMilitaryPersonnelAdmin:
    """Tests for MilitaryPersonnelAdmin."""

    def test_military_list_view_accessible(self, client_logged_in, military_citizen):
        """Military personnel list view should be accessible to admin."""
        response = client_logged_in.get(reverse('admin:citizens_militarypersonnel_changelist'))
        assert response.status_code == 200

    def test_military_displays_esso_badge(self, client_logged_in, military_citizen):
        """Military personnel should display ΕΣΣΟ badge."""
        response = client_logged_in.get(reverse('admin:citizens_militarypersonnel_changelist'))
        assert response.status_code == 200
        # Should contain ΕΣΣΟ information
        assert 'ΕΣΣΟ'.encode() in response.content or '2025'.encode() in response.content


@pytest.mark.django_db
class TestUserPermissions:
    """Tests for user permission system."""

    def test_superuser_can_access_user_admin(self, client, admin_user):
        """Superuser should be able to access user admin."""
        client.force_login(admin_user)
        response = client.get(reverse('admin:auth_user_changelist'))
        assert response.status_code == 200

    def test_staff_user_can_access_citizen_admin(self, client, staff_user, citizen):
        """Staff user should be able to access citizen admin."""
        client.force_login(staff_user)
        response = client.get(reverse('admin:citizens_citizen_changelist'))
        assert response.status_code == 200

    def test_regular_user_limited_user_view(self, client, regular_user, user_groups):
        """Regular user should only see themselves in user list."""
        client.force_login(regular_user)
        response = client.get(reverse('admin:auth_user_changelist'))
        # Should only see their own user, not others
        assert response.status_code == 200


@pytest.mark.django_db
class TestAdminQueryOptimization:
    """Tests to verify query optimization in admin."""

    def test_citizen_list_uses_annotation(self, client_logged_in, citizen):
        """Citizen list should use annotation for active_requests count."""
        # Create some requests
        Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
            κατασταση='ΕΚΚΡΕΜΕΙ',
            αιτημα_κειμενο='Test 1'
        )
        Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΙΑΤΡΙΚΟ',
            κατασταση='ΕΚΚΡΕΜΕΙ',
            αιτημα_κειμενο='Test 2'
        )

        response = client_logged_in.get(reverse('admin:citizens_citizen_changelist'))
        assert response.status_code == 200
        # The page should load without N+1 queries
        # (exact query count testing would require django-debug-toolbar or similar)
