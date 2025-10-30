"""
Dashboard configuration for Political CRM

This module provides dashboard statistics and widgets for the admin interface.
Uses Django Unfold's dashboard callback system.
"""

from django.db.models import Count, Q, Avg
from django.utils.translation import gettext_lazy as _
from datetime import date, timedelta


def get_dashboard_stats(request):
    """
    Generate dashboard statistics for the admin home page.

    Returns a list of stat cards showing:
    - Total citizens
    - Active requests
    - Overdue requests (>25 days)
    - Completion rate
    """
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
    completion_rate = round((completed_requests / total_requests * 100) if total_requests > 0 else 0, 1)

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


def get_request_category_breakdown():
    """
    Get breakdown of requests by category for pie chart.

    Returns:
        dict: Category names as keys, counts as values
    """
    from citizens.models import Request

    categories = Request.objects.values('κατηγορια_αιτηματος').annotate(
        count=Count('id')
    ).order_by('-count')

    return {item['κατηγορια_αιτηματος']: item['count'] for item in categories}


def get_requests_by_status():
    """
    Get breakdown of requests by status.

    Returns:
        dict: Status labels as keys, counts as values
    """
    from citizens.models import Request

    statuses = Request.objects.values('κατασταση').annotate(
        count=Count('id')
    ).order_by('-count')

    status_labels = {
        'ΟΛΟΚΛΗΡΩΜΕΝΟ': 'Ολοκληρωμένα',
        'ΕΚΚΡΕΜΕΙ': 'Εκκρεμή',
        'ΜΗ_ΟΛΟΚΛΗΡΩΜΕΝΟ': 'Μη Ολοκληρωμένα'
    }

    return {
        status_labels.get(item['κατασταση'], item['κατασταση']): item['count']
        for item in statuses
    }


def get_monthly_requests_trend(months=6):
    """
    Get requests trend for the last N months.

    Args:
        months (int): Number of months to include

    Returns:
        dict: Month labels as keys, counts as values
    """
    from citizens.models import Request
    from datetime import date, timedelta
    import calendar

    today = date.today()
    month_data = {}

    for i in range(months):
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
        month_label = f"{greek_months[target_month]} {target_year}"
        month_data[month_label] = count

    # Reverse to show oldest to newest
    return dict(reversed(list(month_data.items())))


def get_top_collaborators(limit=5):
    """
    Get top collaborators by number of assigned citizens.

    Args:
        limit (int): Number of top collaborators to return

    Returns:
        list: Tuples of (collaborator_name, citizen_count)
    """
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


def get_citizens_by_municipality(limit=10):
    """
    Get citizen distribution by municipality.

    Args:
        limit (int): Number of top municipalities to return

    Returns:
        dict: Municipality names as keys, counts as values
    """
    from citizens.models import Citizen

    municipalities = Citizen.objects.filter(
        is_active=True,
        δημος__isnull=False
    ).exclude(
        δημος__exact=''
    ).values('δημος').annotate(
        count=Count('id')
    ).order_by('-count')[:limit]

    return {item['δημος']: item['count'] for item in municipalities}


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
    """
    # Get all statistics
    stats = get_dashboard_stats(request)

    # Add to context
    context.update({
        # Main stats
        'dashboard_stats': stats,

        # Charts data
        'request_categories': get_request_category_breakdown(),
        'request_statuses': get_requests_by_status(),
        'monthly_trend': get_monthly_requests_trend(months=6),

        # Additional insights
        'top_collaborators': get_top_collaborators(limit=5),
        'citizens_by_municipality': get_citizens_by_municipality(limit=10),
    })

    return context
