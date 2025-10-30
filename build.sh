#!/bin/bash

echo "======================================"
echo "Running Database Migrations..."
echo "======================================"
python manage.py migrate --noinput

echo "======================================"
echo "Collecting Static Files..."
echo "======================================"
python manage.py collectstatic --noinput --clear

echo "======================================"
echo "Build completed successfully!"
echo "======================================"
