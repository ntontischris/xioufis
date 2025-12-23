# Railway uses railway.toml for deployment configuration
# This Procfile is kept for compatibility with other platforms (Heroku, Render, etc.)
web: gunicorn political_crm.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
