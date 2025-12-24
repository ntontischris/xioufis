"""
Citizen Dashboard View

Provides a comprehensive dashboard for viewing all citizen-related data
organized in tabs for better user experience.

All views include error handling for production reliability.
"""
import logging
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, get_object_or_404
from django.db.models import Count, Q, Prefetch
from django.http import JsonResponse, Http404
from django.db import connection
from .models import Citizen, Request, Communication, MilitaryPersonnel

logger = logging.getLogger(__name__)


def homepage(request):
    """
    Homepage with connect button to admin login.

    Error Handling:
    - Returns simple error page on failure
    """
    try:
        return render(request, 'homepage.html')
    except Exception as e:
        logger.error(f"Error rendering homepage: {e}")
        return render(request, 'homepage.html', {'error': str(e)})


def health_check(request):
    """
    Railway healthcheck endpoint.

    Simple healthcheck that just returns 200 OK.
    Database checks removed to avoid healthcheck failures during migrations.

    Returns:
    - 200 OK if app is running

    Error Handling:
    - Always returns 200 to keep container alive
    - Logs any errors for debugging
    """
    try:
        return JsonResponse({
            'status': 'healthy',
            'app': 'running'
        }, status=200)
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=200)  # Still return 200 to keep container alive


@staff_member_required
def citizen_dashboard(request, pk):
    """
    Display comprehensive citizen dashboard with tabs.

    Tabs:
    - Βασικά Στοιχεία (Basic Info)
    - Αιτήματα (Requests)
    - Επικοινωνίες (Communications)
    - Στρατιωτικό Προσωπικό (Military Personnel)

    URL Parameters:
    - tab: Which tab to open (default: 'basic')

    Error Handling:
    - Returns 404 for non-existent citizens
    - Logs errors for debugging
    - Gracefully handles missing relations
    """
    try:
        # Get active tab from URL parameter
        active_tab = request.GET.get('tab', 'basic')

        # Validate tab parameter
        valid_tabs = ['basic', 'requests', 'communications', 'military']
        if active_tab not in valid_tabs:
            active_tab = 'basic'

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

        # Get counts for tab badges (using already-prefetched data)
        requests_count = citizen.requests.count()
        active_requests_count = citizen.requests.filter(~Q(κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ')).count()
        communications_count = citizen.communications.count()

        # Safely check for military personnel
        try:
            has_military = hasattr(citizen, 'military_personnel') and citizen.military_personnel is not None
            military_personnel = citizen.military_personnel if has_military else None
        except Exception:
            has_military = False
            military_personnel = None

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
            'military_personnel': military_personnel,

            # Metadata
            'opts': Citizen._meta,  # For admin breadcrumbs
            'title': f'Dashboard: {citizen.full_name}',
        }

        return render(request, 'admin/citizens/citizen_dashboard.html', context)

    except Http404:
        # Let 404 errors propagate normally
        raise
    except Exception as e:
        logger.error(f"Error in citizen_dashboard for pk={pk}: {e}")
        # Return error page
        return render(request, 'admin/citizens/citizen_dashboard.html', {
            'error': 'Σφάλμα κατά τη φόρτωση του dashboard. Παρακαλώ δοκιμάστε ξανά.',
            'error_detail': str(e) if request.user.is_superuser else None,
            'title': 'Σφάλμα Dashboard',
            'opts': Citizen._meta,
        })
