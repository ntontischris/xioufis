from django.apps import AppConfig


class CitizensConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'citizens'
    verbose_name = 'Διαχείριση Πολιτών'

    def ready(self):
        # Import signal handlers
        import citizens.signals  # noqa
