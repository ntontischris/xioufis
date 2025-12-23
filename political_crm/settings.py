"""
Django settings for political_crm project.

Generated for Django 5.0+
For more information on this file, see https://docs.djangoproject.com/en/5.0/topics/settings/
"""

import os
from pathlib import Path
from decouple import config
import dj_database_url

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
# Railway will provide this via environment variable
SECRET_KEY = config('SECRET_KEY', default='')
if not SECRET_KEY:
    raise ValueError(
        "SECRET_KEY environment variable is required! "
        "Please set it in Railway dashboard. "
        "Generate one using: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
    )

# SECURITY WARNING: don't run with debug turned on in production!
# Default to False for production safety
DEBUG = config('DEBUG', default=False, cast=bool)

# Get Railway domain (auto-detected from Railway env vars)
railway_static_url = os.getenv('RAILWAY_STATIC_URL')

# ALLOWED_HOSTS configuration
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Add Railway domains (including healthcheck)
ALLOWED_HOSTS += [
    'healthcheck.railway.app',  # Railway health checks
]

# Add production Railway domains
if not DEBUG:
    ALLOWED_HOSTS += [
        '.railway.app',
        '.up.railway.app',
    ]

# Add specific Railway domain if available
if railway_static_url:
    ALLOWED_HOSTS.append(railway_static_url)

# CSRF Trusted Origins for Railway
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:8000,http://127.0.0.1:8000'
).split(',')

# Always add Railway domains for production
if not DEBUG:
    CSRF_TRUSTED_ORIGINS += [
        'https://*.railway.app',
        'https://*.up.railway.app',
    ]

# Add Railway public domain if it exists
if railway_static_url:
    CSRF_TRUSTED_ORIGINS.append(f'https://{railway_static_url}')
    CSRF_TRUSTED_ORIGINS.append(f'http://{railway_static_url}')


# Application definition

INSTALLED_APPS = [
    'unfold',  # Django Unfold - Must be before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps (minimal για testing)
    'import_export',
    # 'django_filters',  # Temporarily disabled
    # 'crispy_forms',
    # 'crispy_bootstrap5',
    # 'django_otp',
    # 'django_otp.plugins.otp_totp',
    # 'django_otp.plugins.otp_email',
    # 'two_factor',
    # 'axes',
    # 'auditlog',

    # Local apps
    'citizens.apps.CitizensConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    # 'django.middleware.locale.LocaleMiddleware',  # i18n support
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # 'django_otp.middleware.OTPMiddleware',  # 2FA middleware - disabled for testing
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'axes.middleware.AxesMiddleware',  # Brute-force protection - disabled for testing
    # 'auditlog.middleware.AuditlogMiddleware',  # Activity logging - disabled for testing
]

ROOT_URLCONF = 'political_crm.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'political_crm.wsgi.application'


# Database Configuration
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

# Production: REQUIRE PostgreSQL via DATABASE_URL
# Development: Allow SQLite fallback only when DEBUG=True
if 'DATABASE_URL' in os.environ:
    # Railway/Production PostgreSQL
    database_url = os.environ.get('DATABASE_URL')

    # Parse and fix URL encoding issues
    from urllib.parse import urlparse, quote
    parsed = urlparse(database_url)

    # URL-encode password to handle special characters
    if parsed.password and '@' in database_url:
        # Extract password and encode it properly
        password = quote(parsed.password, safe='')
        database_url = database_url.replace(
            f':{parsed.password}@',
            f':{password}@'
        )

    DATABASES = {
        'default': dj_database_url.config(
            default=database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

    # Add SSL requirement for Railway PostgreSQL
    DATABASES['default'].setdefault('OPTIONS', {})
    DATABASES['default']['OPTIONS']['sslmode'] = 'require'

    print(">>> Using Railway PostgreSQL Database with SSL")

# Development SQLite (only allowed when DEBUG=True)
elif DEBUG:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
    print(">>> Using SQLite (Development Only)")

# Production without DATABASE_URL: ERROR!
else:
    raise ValueError(
        "DATABASE_URL environment variable is required in production! "
        "DEBUG is False but no DATABASE_URL found. "
        "Please configure PostgreSQL database in Railway."
    )

# Alternative: Manual Supabase Configuration
# Uncomment if using Supabase instead of Railway PostgreSQL
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': config('SUPABASE_DB_NAME', default='postgres'),
#         'USER': config('SUPABASE_DB_USER', default='postgres'),
#         'PASSWORD': config('SUPABASE_DB_PASSWORD'),
#         'HOST': config('SUPABASE_DB_HOST'),
#         'PORT': config('SUPABASE_DB_PORT', default='5432'),
#         'OPTIONS': {
#             'sslmode': 'require',
#         },
#         'CONN_MAX_AGE': 600,
#     }
# }


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 10,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = config('LANGUAGE_CODE', default='el-gr')
TIME_ZONE = config('TIME_ZONE', default='Europe/Athens')
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Only include STATICFILES_DIRS if the directory exists (for local dev)
if (BASE_DIR / 'static').exists():
    STATICFILES_DIRS = [BASE_DIR / 'static']

# Whitenoise configuration for production
# Using CompressedStaticFilesStorage (non-manifest) to avoid strict missing file errors
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Email Configuration
# https://docs.djangoproject.com/en/5.0/topics/email/
# Falls back to console backend if email credentials not provided (development-friendly)

EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

# Use console backend if email not configured, SMTP otherwise
if not EMAIL_HOST_USER:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    print(">>> Email backend: Console (credentials not configured)")
else:
    EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
    EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
    EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
    EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
    print(f">>> Email backend: SMTP ({EMAIL_HOST})")

DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='CRM Γραφείου <noreply@example.com>')

# Site URL for emails
SITE_URL = config('SITE_URL', default='http://127.0.0.1:8000')


# Security Settings
# https://docs.djangoproject.com/en/5.0/topics/security/

# Production security (enable in production)
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=False, cast=bool)
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=False, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=False, cast=bool)
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=0, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Session settings
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = False


# Django Axes - Brute Force Protection (Disabled for testing)
# https://django-axes.readthedocs.io/

# AUTHENTICATION_BACKENDS = [
#     'axes.backends.AxesStandaloneBackend',  # Axes backend (must be first)
#     'django.contrib.auth.backends.ModelBackend',
# ]
#
# AXES_FAILURE_LIMIT = 5  # Lock after 5 failed attempts
# AXES_COOLOFF_TIME = 1  # 1 hour lockout
# AXES_RESET_ON_SUCCESS = True
# AXES_LOCKOUT_TEMPLATE = None  # Use default
# AXES_LOCKOUT_URL = None  # Use default


# Django Auditlog
# https://django-auditlog.readthedocs.io/

AUDITLOG_INCLUDE_ALL_MODELS = False  # Manually register models


# Crispy Forms
# https://django-crispy-forms.readthedocs.io/

CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"


# Two-Factor Authentication (Disabled for testing)
# https://django-two-factor-auth.readthedocs.io/

# TWO_FACTOR_PATCH_ADMIN = True  # Enable 2FA in admin
# LOGIN_URL = 'two_factor:login'
LOGIN_REDIRECT_URL = '/admin/'  # Redirect to dashboard after login


# Django Unfold Configuration
# https://docs.unfoldadmin.com/

from django.templatetags.static import static
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _

UNFOLD = {
    "SITE_TITLE": "Πολιτικό CRM",
    "SITE_HEADER": "Διαχείριση Πολιτών",
    "SITE_URL": "/",
    "SITE_ICON": None,  # Can add custom icon later

    # Branding
    "SITE_LOGO": None,  # Can add logo later
    "SITE_SYMBOL": "people",  # Google Material Icon name

    # Colors & Theme - Modern Gradient Palette (Indigo/Purple)
    "COLORS": {
        "primary": {
            "50": "238 242 255",   # Very light indigo
            "100": "224 231 255",  # Light indigo
            "200": "199 210 254",  # Soft indigo
            "300": "165 180 252",  # Medium light indigo
            "400": "129 140 248",  # Medium indigo
            "500": "99 102 241",   # Base indigo (#6366F1)
            "600": "79 70 229",    # Dark indigo
            "700": "67 56 202",    # Darker indigo
            "800": "55 48 163",    # Very dark indigo
            "900": "49 46 129",    # Deepest indigo
        },
    },

    # Sidebar - Custom navigation with Dashboard always visible
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": _("Αρχική"),
                "items": [
                    {
                        "title": _("Dashboard"),
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                    },
                ],
            },
            {
                "title": _("Διαχείριση"),
                "items": [
                    {
                        "title": _("Πολίτες"),
                        "icon": "people",
                        "link": reverse_lazy("admin:citizens_citizen_changelist"),
                    },
                    {
                        "title": _("Στρατιωτικό Προσωπικό"),
                        "icon": "military_tech",
                        "link": reverse_lazy("admin:citizens_militarypersonnel_changelist"),
                    },
                    {
                        "title": _("Χρήστες"),
                        "icon": "people_outline",
                        "link": reverse_lazy("admin:auth_user_changelist"),
                    },
                ],
            },
        ],
    },

    # Dashboard callback for statistics
    "DASHBOARD_CALLBACK": "citizens.dashboard.dashboard_callback",

    # Login redirect to dashboard
    "LOGIN_REDIRECT": "/admin/",
}


# Logging Configuration
# Railway uses ephemeral filesystem - only console logging
# File logging only enabled for local development
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'citizens': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Optional: Add file logging for local development only
if DEBUG and 'DATABASE_URL' not in os.environ:
    LOGS_DIR = BASE_DIR / 'logs'
    LOGS_DIR.mkdir(exist_ok=True)
    LOGGING['handlers']['file'] = {
        'level': 'INFO',
        'class': 'logging.FileHandler',
        'filename': LOGS_DIR / 'django.log',
        'formatter': 'verbose',
    }
    LOGGING['loggers']['django']['handlers'].append('file')
    LOGGING['loggers']['citizens']['handlers'].append('file')
    print(">>> File logging enabled (local development)")
