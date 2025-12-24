"""
Dashboard configuration for Political CRM

This module provides dashboard statistics and widgets for the admin interface.
Uses Django Unfold's dashboard callback system.

All functions include error handling for production reliability.
"""
import logging
from django.db.models import Count, Q
from datetime import date, timedelta

logger = logging.getLogger(__name__)


def get_dashboard_stats(request):
    """
    Generate dashboard statistics for the admin home page.

    Returns a dict with:
    - total_citizens: Active citizen count
    - active_requests: Non-completed requests count
    - overdue_requests: Pending requests > 25 days
    - completion_rate: Percentage of completed requests
    - new_citizens_last_month: Citizens added in last 30 days
    - new_requests_last_month: Requests created in last 30 days

    Error Handling:
    - Returns zeros for all stats on database errors
    - Logs errors for debugging
    """
    try:
        from citizens.models import Citizen, Request

        # Total citizens count
        total_citizens = Citizen.objects.filter(is_active=True).count()

        # Active requests (not completed)
        active_requests = Request.objects.exclude(κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ').count()

        # Overdue requests (pending for more than 25 days)
        twenty_five_days_ago = date.today() - timedelta(days=25)
        overdue_requests = Request.objects.filter(
            κατασταση='ΕΚΚΡΕΜΕΙ',
            ημερομηνια_αποστολης__lt=twenty_five_days_ago
        ).count()

        # Completion rate
        total_requests = Request.objects.count()
        completed_requests = Request.objects.filter(κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ').count()
        completion_rate = round(
            (completed_requests / total_requests * 100) if total_requests > 0 else 0, 1
        )

        # Recent activity stats (last 30 days)
        thirty_days_ago = date.today() - timedelta(days=30)
        new_citizens_last_month = Citizen.objects.filter(
            ημερομηνια_προσθηκης__gte=thirty_days_ago
        ).count()

        new_requests_last_month = Request.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()

        return {
            'total_citizens': total_citizens,
            'active_requests': active_requests,
            'overdue_requests': overdue_requests,
            'completion_rate': completion_rate,
            'new_citizens_last_month': new_citizens_last_month,
            'new_requests_last_month': new_requests_last_month,
        }

    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return {
            'total_citizens': 0,
            'active_requests': 0,
            'overdue_requests': 0,
            'completion_rate': 0,
            'new_citizens_last_month': 0,
            'new_requests_last_month': 0,
        }


def get_request_category_breakdown(request=None):
    """
    Get breakdown of requests by category for pie chart.

    Returns:
        dict with 'labels' and 'data' lists for charting

    Error Handling:
        Returns empty lists on error
    """
    try:
        from citizens.models import Request

        categories = Request.objects.values('κατηγορια_αιτηματος').annotate(
            count=Count('id')
        ).order_by('-count')

        # Category display names
        category_labels = {
            'ΣΤΡΑΤΙΩΤΙΚΟ': 'Στρατιωτικό',
            'ΙΑΤΡΙΚΟ': 'Ιατρικό',
            'ΑΣΤΥΝΟΜΙΚΟ': 'Αστυνομικό',
            'ΠΥΡΟΣΒΕΣΤΙΚΗ': 'Πυροσβεστική',
            'ΠΑΙΔΕΙΑΣ': 'Παιδείας',
            'ΔΙΟΙΚΗΤΙΚΟ': 'Διοικητικό',
            'ΕΥΡΕΣΗ_ΕΡΓΑΣΙΑΣ': 'Εύρεση Εργασίας',
            'ΕΦΚΑ': 'ΕΦΚΑ',
            'ΑΛΛΟ': 'Άλλο',
        }

        labels = []
        data = []
        for item in categories:
            cat_key = item['κατηγορια_αιτηματος']
            labels.append(category_labels.get(cat_key, cat_key))
            data.append(item['count'])

        return {'labels': labels, 'data': data}

    except Exception as e:
        logger.error(f"Error getting request category breakdown: {e}")
        return {'labels': [], 'data': []}


def get_requests_by_status(request=None):
    """
    Get breakdown of requests by status.

    Returns:
        dict with 'labels' and 'data' lists for charting

    Error Handling:
        Returns empty lists on error
    """
    try:
        from citizens.models import Request

        statuses = Request.objects.values('κατασταση').annotate(
            count=Count('id')
        ).order_by('-count')

        status_labels = {
            'ΟΛΟΚΛΗΡΩΜΕΝΟ': 'Ολοκληρωμένα',
            'ΕΚΚΡΕΜΕΙ': 'Εκκρεμή',
            'ΜΗ_ΟΛΟΚΛΗΡΩΜΕΝΟ': 'Μη Ολοκληρωμένα'
        }

        labels = []
        data = []
        for item in statuses:
            status_key = item['κατασταση']
            labels.append(status_labels.get(status_key, status_key))
            data.append(item['count'])

        return {'labels': labels, 'data': data}

    except Exception as e:
        logger.error(f"Error getting requests by status: {e}")
        return {'labels': [], 'data': []}


def get_monthly_requests_trend(request=None, months=6):
    """
    Get requests trend for the last N months.

    Args:
        request: Django request object (optional)
        months (int): Number of months to include

    Returns:
        dict with 'labels' and 'data' lists for line chart

    Error Handling:
        Returns empty lists on error
    """
    try:
        from citizens.models import Request
        import calendar

        today = date.today()
        labels = []
        data = []

        for i in range(months - 1, -1, -1):
            # Calculate months ago
            target_year = today.year
            target_month = today.month - i

            # Handle year rollover
            while target_month <= 0:
                target_month += 12
                target_year -= 1

            # Get first and last day of target month
            month_start = date(target_year, target_month, 1)
            last_day = calendar.monthrange(target_year, target_month)[1]
            month_end = date(target_year, target_month, last_day)

            count = Request.objects.filter(
                created_at__gte=month_start,
                created_at__lte=month_end
            ).count()

            # Format month label using Greek month names
            greek_months = {
                1: 'Ιαν', 2: 'Φεβ', 3: 'Μαρ', 4: 'Απρ', 5: 'Μάι', 6: 'Ιουν',
                7: 'Ιουλ', 8: 'Αυγ', 9: 'Σεπ', 10: 'Οκτ', 11: 'Νοε', 12: 'Δεκ'
            }
            labels.append(f"{greek_months[target_month]} {target_year}")
            data.append(count)

        return {'labels': labels, 'data': data}

    except Exception as e:
        logger.error(f"Error getting monthly requests trend: {e}")
        return {'labels': [], 'data': []}


def get_top_collaborators(request=None, limit=5):
    """
    Get top collaborators by number of assigned citizens.

    Args:
        request: Django request object (optional)
        limit (int): Number of top collaborators to return

    Returns:
        list of tuples: [(name, count), ...]

    Error Handling:
        Returns empty list on error
    """
    try:
        from citizens.models import Citizen

        collaborators = Citizen.objects.filter(
            αρμοδιος_συνεργατης__isnull=False
        ).values(
            'αρμοδιος_συνεργατης__username',
            'αρμοδιος_συνεργατης__first_name',
            'αρμοδιος_συνεργατης__last_name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:limit]

        result = []
        for item in collaborators:
            # Use full name if available, otherwise username
            full_name = f"{item['αρμοδιος_συνεργατης__first_name']} {item['αρμοδιος_συνεργατης__last_name']}".strip()
            name = full_name if full_name else item['αρμοδιος_συνεργατης__username']
            result.append((name, item['count']))

        return result

    except Exception as e:
        logger.error(f"Error getting top collaborators: {e}")
        return []


def get_citizens_by_municipality(request=None, limit=10):
    """
    Get citizen distribution by municipality.

    Args:
        request: Django request object (optional)
        limit (int): Number of top municipalities to return

    Returns:
        dict with 'labels' and 'data' lists for charting

    Error Handling:
        Returns empty lists on error
    """
    try:
        from citizens.models import Citizen

        municipalities = Citizen.objects.filter(
            is_active=True,
            δημος__isnull=False
        ).exclude(
            δημος__exact=''
        ).values('δημος').annotate(
            count=Count('id')
        ).order_by('-count')[:limit]

        # Municipality display names
        municipality_labels = {
            'ΠΑΥΛΟΥ_ΜΕΛΑ': 'Παύλου Μελά',
            'ΚΟΡΔΕΛΙΟΥ_ΕΥΟΣΜΟΥ': 'Κορδελίου-Ευόσμου',
            'ΑΜΠΕΛΟΚΗΠΩΝ_ΜΕΝΕΜΕΝΗΣ': 'Αμπελοκήπων-Μενεμένης',
            'ΝΕΑΠΟΛΗΣ_ΣΥΚΕΩΝ': 'Νεάπολης-Συκεών',
            'ΘΕΣΣΑΛΟΝΙΚΗΣ': 'Θεσσαλονίκης',
            'ΚΑΛΑΜΑΡΙΑΣ': 'Καλαμαριάς',
            'ΑΛΛΟ': 'Άλλο',
        }

        labels = []
        data = []
        for item in municipalities:
            mun_key = item['δημος']
            labels.append(municipality_labels.get(mun_key, mun_key))
            data.append(item['count'])

        return {'labels': labels, 'data': data}

    except Exception as e:
        logger.error(f"Error getting citizens by municipality: {e}")
        return {'labels': [], 'data': []}


def dashboard_callback(request, context):
    """
    Main dashboard callback function for Unfold admin.

    This function is called by Unfold to populate the admin homepage
    with custom statistics and widgets.

    Args:
        request: Django HttpRequest object
        context: Dictionary with current context

    Returns:
        dict: Updated context with dashboard data

    Error Handling:
        Returns context with empty/default values on error
    """
    try:
        # Get all statistics
        stats = get_dashboard_stats(request)

        # Prepare chart data
        category_data = get_request_category_breakdown(request)
        status_data = get_requests_by_status(request)
        monthly_trend = get_monthly_requests_trend(request, months=6)
        municipality_data = get_citizens_by_municipality(request, limit=10)

        # Add to context
        context.update({
            # Main stats
            'stats': stats,
            'dashboard_stats': stats,  # Backward compatibility

            # Charts data (new format for consistency)
            'category_data': category_data,
            'status_data': status_data,
            'monthly_trend': monthly_trend,
            'municipality_data': municipality_data,

            # Legacy format (backward compatibility)
            'request_categories': {
                label: data
                for label, data in zip(category_data['labels'], category_data['data'])
            } if category_data['labels'] else {},
            'request_statuses': {
                label: data
                for label, data in zip(status_data['labels'], status_data['data'])
            } if status_data['labels'] else {},

            # Additional insights
            'top_collaborators': get_top_collaborators(request, limit=5),
            'citizens_by_municipality': {
                label: data
                for label, data in zip(municipality_data['labels'], municipality_data['data'])
            } if municipality_data['labels'] else {},
        })

        return context

    except Exception as e:
        logger.error(f"Error in dashboard_callback: {e}")
        # Return context with empty defaults
        context.update({
            'stats': {
                'total_citizens': 0,
                'active_requests': 0,
                'overdue_requests': 0,
                'completion_rate': 0,
                'new_citizens_last_month': 0,
                'new_requests_last_month': 0,
            },
            'category_data': {'labels': [], 'data': []},
            'status_data': {'labels': [], 'data': []},
            'monthly_trend': {'labels': [], 'data': []},
            'municipality_data': {'labels': [], 'data': []},
            'top_collaborators': [],
            'request_categories': {},
            'request_statuses': {},
            'citizens_by_municipality': {},
        })
        return context
