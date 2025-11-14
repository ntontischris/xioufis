#!/usr/bin/env python
"""
Fix django_session table in Railway database
"""
import os
import sys

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found")
    sys.exit(1)

print("Connecting to Railway database...")

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
