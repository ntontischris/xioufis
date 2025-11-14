#!/usr/bin/env python
"""
Run Django migrations by connecting directly to Railway database
Usage: railway run python run_migrations_direct.py
"""
import os
import sys

# Get DATABASE_URL
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found")
    sys.exit(1)

print("Connecting to Railway database...")

try:
    import psycopg2

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Create django_session table
    print("Creating django_session table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS django_session (
            session_key VARCHAR(40) PRIMARY KEY,
            session_data TEXT NOT NULL,
            expire_date TIMESTAMP WITH TIME ZONE NOT NULL
        );
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS django_session_expire_date_idx
        ON django_session (expire_date);
    """)

    conn.commit()
    print("SUCCESS: django_session table created!")

    cursor.close()
    conn.close()

    print("\nNow running Django migrations...")

    # Setup Django and run migrations
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'political_crm.settings')
    import django
    django.setup()

    from django.core.management import execute_from_command_line
    execute_from_command_line(['manage.py', 'migrate', '--noinput'])

    print("\nSUCCESS: All migrations completed!")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
