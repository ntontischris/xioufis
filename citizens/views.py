"""
Citizen Dashboard View

Provides a comprehensive dashboard for viewing all citizen-related data
organized in tabs for better user experience.
"""
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, get_object_or_404
from django.db.models import Count, Q, Prefetch
from django.http import JsonResponse
from django.db import connection
from .models import Citizen, Request, Communication, MilitaryPersonnel


def homepage(request):
    """
    Homepage with connect button to admin login
    """
    return render(request, 'homepage.html')


def health_check(request):
    """
    Railway healthcheck endpoint.

    Checks:
    - Database connectivity
    - Basic app health

    Returns:
    - 200 OK if healthy
    - 500 Error if unhealthy
    """
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")

        return JsonResponse({
            'status': 'healthy',
            'database': 'connected'
        }, status=200)

    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)


@staff_member_required
def citizen_dashboard(request, pk):
    """
    Display comprehensive citizen dashboard with tabs

    Tabs:
    - Βασικά Στοιχεία (Basic Info)
    - Αιτήματα (Requests)
    - Επικοινωνίες (Communications)
    - Στρατιωτικό Προσωπικό (Military Personnel)

    URL Parameters:
    - tab: Which tab to open (default: 'basic')
    """

    # Get active tab from URL parameter
    active_tab = request.GET.get('tab', 'basic')

    # Optimize query with select_related and prefetch_related
    citizen = get_object_or_404(
        Citizen.objects.select_related(
            'αρμοδιος_συνεργατης'
        ).prefetch_related(
            Prefetch(
                'requests',
                queryset=Request.objects.select_related('created_by').order_by('-ημερομηνια_αποστολης')
            ),
            Prefetch(
                'communications',
                queryset=Communication.objects.select_related('created_by').order_by('-ημερομηνια_επικοινωνιας')
            ),
            'military_personnel'
        ),
        pk=pk
    )

    # Get counts for tab badges
    requests_count = citizen.requests.count()
    active_requests_count = citizen.requests.filter(~Q(κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ')).count()
    communications_count = citizen.communications.count()
    has_military = hasattr(citizen, 'military_personnel') and citizen.military_personnel is not None

    # Organize data by category for better template rendering
    context = {
        'citizen': citizen,
        'active_tab': active_tab,

        # Counts for badges
        'requests_count': requests_count,
        'active_requests_count': active_requests_count,
        'communications_count': communications_count,
        'has_military': has_military,

        # Related data (already prefetched, no extra queries!)
        'requests': citizen.requests.all(),
        'communications': citizen.communications.all(),
        'military_personnel': citizen.military_personnel if has_military else None,

        # Metadata
        'opts': Citizen._meta,  # For admin breadcrumbs
        'title': f'Dashboard: {citizen.full_name}',
    }

    return render(request, 'admin/citizens/citizen_dashboard.html', context)
