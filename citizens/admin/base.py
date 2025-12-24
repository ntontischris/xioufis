"""
Base admin classes and mixins for citizens app.

Provides reusable components to eliminate code duplication:
- CitizenDashboardLinkMixin: Link to citizen dashboard from related models
- BadgeGeneratorMixin: Colored badge generation for status displays
"""
from django.utils.html import format_html
from django.urls import reverse


class CitizenDashboardLinkMixin:
    """
    Mixin providing citizen_dashboard_link method.

    Eliminates duplication across RequestAdmin, CommunicationAdmin, MilitaryPersonnelAdmin.
    Each subclass should set `dashboard_tab` to the appropriate tab name.

    Usage:
        class RequestAdmin(CitizenDashboardLinkMixin, ModelAdmin):
            dashboard_tab = 'requests'
            list_display = ['citizen_dashboard_link', ...]
    """
    dashboard_tab = 'basic'  # Override in subclasses

    def citizen_dashboard_link(self, obj):
        """
        Display citizen name as link to dashboard with appropriate tab.
        """
        citizen = getattr(obj, 'πολιτης', None)
        if not citizen:
            return '-'

        dashboard_url = f"{reverse('citizen_dashboard', args=[citizen.pk])}?tab={self.dashboard_tab}"
        return format_html(
            '<a href="{}" style="color: #007bff; font-weight: 500; text-decoration: none;">'
            '👤 {}</a>',
            dashboard_url,
            citizen.full_name
        )

    citizen_dashboard_link.short_description = 'Πολίτης'


class BadgeGeneratorMixin:
    """
    Mixin providing colored badge generation methods.

    Common badge styles used throughout the admin interface.
    """

    @staticmethod
    def create_badge(text, bg_color, text_color='white'):
        """
        Create a colored badge HTML element.

        Args:
            text: The text to display in the badge
            bg_color: Background color (hex or color name)
            text_color: Text color (default: white)

        Returns:
            format_html safe string with badge markup
        """
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 5px 12px; '
            'border-radius: 12px; font-weight: bold; display: inline-block;">{}</span>',
            bg_color, text_color, text
        )

    @staticmethod
    def create_small_badge(text, bg_color, text_color='white'):
        """
        Create a smaller colored badge for compact displays.
        """
        return format_html(
            '<span style="background-color: {}; color: {}; padding: 3px 8px; '
            'border-radius: 8px; font-weight: bold; font-size: 11px;">{}</span>',
            bg_color, text_color, text
        )


# Status color mappings (used across multiple admin classes)
STATUS_COLORS = {
    'ΟΛΟΚΛΗΡΩΜΕΝΟ': '#28a745',    # Green
    'ΕΚΚΡΕΜΕΙ': '#ffc107',         # Yellow/Warning
    'ΜΗ_ΟΛΟΚΛΗΡΩΜΕΝΟ': '#6c757d',  # Gray
    'OVERDUE': '#dc3545',          # Red (for overdue items)
}

MILITARY_TYPE_COLORS = {
    'ΣΤΡΑΤΙΩΤΗΣ': '#17a2b8',  # Cyan
    'ΜΟΝΙΜΟΣ': '#28a745',      # Green
}

USER_LEVEL_COLORS = {
    'superuser': '#dc3545',       # Red
    'admin': '#007bff',           # Blue
    'regular': '#28a745',         # Green
    'no_group': '#6c757d',        # Gray
}
