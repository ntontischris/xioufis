release: python manage.py migrate --noinput && python manage.py collectstatic --noinput --clear && python create_admin_railway.py
web: gunicorn political_crm.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
