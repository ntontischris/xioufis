"""
URL configuration for political_crm project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from citizens.views import citizen_dashboard, homepage
# from two_factor.urls import urlpatterns as tf_urls  # Disabled for testing

urlpatterns = [
    # Homepage
    path('', homepage, name='homepage'),

    # Citizen Dashboard (must be before admin/ to work)
    path('admin/citizens/citizen/<int:pk>/dashboard/', citizen_dashboard, name='citizen_dashboard'),

    # Admin site
    path('admin/', admin.site.urls),

    # Two-Factor Authentication (disabled for testing)
    # path('', include(tf_urls)),

    # Media files (development only)
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Customize admin site headers
admin.site.site_header = "Πολιτικό CRM - Διαχείριση"
admin.site.site_title = "CRM Γραφείου"
admin.site.index_title = "Καλώς ήρθατε στο Σύστημα Διαχείρισης Πολιτών"
