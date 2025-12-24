"""
Tests for dashboard statistics in citizens app.

Tests cover:
- Dashboard stats calculation
- Empty database handling
- Request category breakdown
- Monthly trends
"""
import pytest
from datetime import date, timedelta

from citizens.models import Citizen, Request, Communication


@pytest.mark.django_db
class TestDashboardStats:
    """Tests for dashboard statistics functions."""

    def test_get_dashboard_stats_empty_db(self, db):
        """Dashboard stats should work with empty database."""
        from citizens.dashboard import get_dashboard_stats

        stats = get_dashboard_stats(None)

        assert stats['total_citizens'] == 0
        assert stats['active_requests'] == 0
        assert stats['overdue_requests'] == 0
        # Completion rate should be 0 (not divide by zero error)
        assert stats['completion_rate'] == 0

    def test_get_dashboard_stats_with_citizens(self, citizen, citizen_with_email):
        """Dashboard stats should count citizens correctly."""
        from citizens.dashboard import get_dashboard_stats

        stats = get_dashboard_stats(None)

        assert stats['total_citizens'] == 2

    def test_get_dashboard_stats_counts_active_requests(
        self, citizen, pending_request, completed_request
    ):
        """Dashboard stats should count only active (non-completed) requests."""
        from citizens.dashboard import get_dashboard_stats

        stats = get_dashboard_stats(None)

        # Only pending request should count as active
        assert stats['active_requests'] == 1

    def test_get_dashboard_stats_counts_overdue_requests(
        self, citizen, old_pending_request, pending_request
    ):
        """Dashboard stats should count overdue requests (>25 days pending)."""
        from citizens.dashboard import get_dashboard_stats

        stats = get_dashboard_stats(None)

        # Only old_pending_request is overdue
        assert stats['overdue_requests'] == 1

    def test_completion_rate_calculation(self, citizen, completed_request, pending_request):
        """Completion rate should be calculated correctly."""
        from citizens.dashboard import get_dashboard_stats

        stats = get_dashboard_stats(None)

        # 1 completed, 1 pending = 50% completion rate
        assert stats['completion_rate'] == 50


@pytest.mark.django_db
class TestRequestCategoryBreakdown:
    """Tests for request category breakdown."""

    def test_category_breakdown_empty(self, db):
        """Category breakdown should work with no requests."""
        from citizens.dashboard import get_request_category_breakdown

        breakdown = get_request_category_breakdown(None)

        assert isinstance(breakdown, dict)
        assert 'labels' in breakdown
        assert 'data' in breakdown

    def test_category_breakdown_counts_correctly(self, citizen, staff_user):
        """Category breakdown should count requests by category."""
        from citizens.dashboard import get_request_category_breakdown

        # Create requests in different categories
        Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
            αιτημα_κειμενο='Test 1',
            created_by=staff_user
        )
        Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
            αιτημα_κειμενο='Test 2',
            created_by=staff_user
        )
        Request.objects.create(
            πολιτης=citizen,
            κατηγορια_αιτηματος='ΙΑΤΡΙΚΟ',
            αιτημα_κειμενο='Test 3',
            created_by=staff_user
        )

        breakdown = get_request_category_breakdown(None)

        # Should have data for at least 2 categories
        assert len(breakdown['labels']) >= 2
        assert len(breakdown['data']) >= 2


@pytest.mark.django_db
class TestMonthlyTrends:
    """Tests for monthly request trends."""

    def test_monthly_trends_returns_data(self, citizen, pending_request):
        """Monthly trends should return data for charting."""
        from citizens.dashboard import get_monthly_requests_trend

        trend = get_monthly_requests_trend(None)

        assert isinstance(trend, dict)
        assert 'labels' in trend
        assert 'data' in trend
        # Should have entries for multiple months
        assert len(trend['labels']) > 0


@pytest.mark.django_db
class TestDashboardCallback:
    """Tests for the main dashboard callback function."""

    def test_dashboard_callback_returns_expected_structure(self, citizen, pending_request):
        """Dashboard callback should return expected context structure."""
        from citizens.dashboard import dashboard_callback

        context = dashboard_callback(None, {})

        # Check that expected keys are present
        assert 'stats' in context
        assert 'category_data' in context
        assert 'status_data' in context
        assert 'monthly_trend' in context

    def test_dashboard_callback_handles_errors_gracefully(self, db):
        """Dashboard callback should handle errors without crashing."""
        from citizens.dashboard import dashboard_callback

        # With empty database, should still return valid context
        context = dashboard_callback(None, {})

        assert isinstance(context, dict)
