#!/bin/bash

echo "======================================"
echo "Running Database Migrations..."
echo "======================================"
python manage.py migrate --noinput

echo "======================================"
echo "Creating Superuser (if needed)..."
echo "======================================"
python create_admin_railway.py || echo "Admin creation skipped (may already exist)"

echo "======================================"
echo "Collecting Static Files..."
echo "======================================"
python manage.py collectstatic --noinput --clear

echo "======================================"
echo "Build completed successfully!"
echo "======================================"
