#!/usr/bin/env python
"""
MANUAL FIX SCRIPT - Run only when experiencing django_session errors

⚠️  WARNING: This script will:
    - Drop the existing django_session table
    - ALL users will be logged out
    - Should ONLY be run manually when there are session errors
    - NEVER add this to Procfile or run automatically!

Usage:
    Railway Shell: python manual_fix_django_session.py

Why you might need this:
    - Login fails with django_session table errors
    - Database corruption after manual interventions

Normal operation:
    - Django creates django_session table automatically via migrations
    - You should NOT need this script in normal circumstances
"""
import os
import sys

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found")
    print("This script only works with Railway PostgreSQL (DATABASE_URL must be set)")
    sys.exit(1)

print("\n" + "="*70)
print("⚠️  WARNING: This will DROP django_session table and logout all users!")
print("="*70)
print("\nConnecting to Railway database...")

try:
    import psycopg2

    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Drop existing django_session table
    print("Dropping old django_session table...")
    cursor.execute("DROP TABLE IF EXISTS django_session CASCADE;")
    conn.commit()
    print("SUCCESS: Old table dropped!")

    # Create correct django_session table
    print("Creating new django_session table with all columns...")
    cursor.execute("""
        CREATE TABLE django_session (
            session_key VARCHAR(40) PRIMARY KEY,
            session_data TEXT NOT NULL,
            expire_date TIMESTAMP WITH TIME ZONE NOT NULL
        );
    """)

    # Create index
    cursor.execute("""
        CREATE INDEX django_session_expire_date_idx
        ON django_session (expire_date);
    """)

    conn.commit()
    print("SUCCESS: django_session table created correctly!")

    # Verify columns exist
    cursor.execute("""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'django_session'
        ORDER BY ordinal_position;
    """)

    print("\nTable structure:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]}")

    cursor.close()
    conn.close()

    print("\n" + "="*50)
    print("ALL DONE! The django_session table is now correct!")
    print("="*50)
    print("\nYou can now login at /admin/ with:")
    print("  Username: admin")
    print("  Password: ChangeMe123")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
