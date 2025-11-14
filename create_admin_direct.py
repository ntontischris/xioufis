#!/usr/bin/env python
"""
Create admin user directly in PostgreSQL without Django
Usage: railway run python create_admin_direct.py
"""
import os
import sys

try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 not installed")
    sys.exit(1)

# Get DATABASE_URL from environment (Railway provides this)
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not found in environment")
    print("Run this with: railway run python create_admin_direct.py")
    sys.exit(1)

print("Connecting to Railway database...")

try:
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Password hash for "ChangeMe123"
    password_hash = 'pbkdf2_sha256$1000000$dGJjgoElxffpbT8JSsfX0u$NbthuTsbEEFpIjKJdUWoi9/bLagN2AsLh003C7ERm18='

    # Check if user exists
    cursor.execute("SELECT username FROM auth_user WHERE username = 'admin'")
    exists = cursor.fetchone()

    if exists:
        print("WARNING: User 'admin' already exists!")
        print("Updating password and permissions...")
        cursor.execute("""
            UPDATE auth_user
            SET password = %s,
                is_superuser = true,
                is_staff = true,
                is_active = true
            WHERE username = 'admin'
        """, (password_hash,))
        print("SUCCESS: Password reset for 'admin'!")
    else:
        print("Creating new admin user...")
        cursor.execute("""
            INSERT INTO auth_user (
                username, first_name, last_name, email, password,
                is_superuser, is_staff, is_active, date_joined
            )
            VALUES (
                'admin', 'Admin', 'User', 'admin@example.com', %s,
                true, true, true, NOW()
            )
        """, (password_hash,))
        print("SUCCESS: Admin user created!")

    conn.commit()
    cursor.close()
    conn.close()

    print("")
    print("=" * 50)
    print("  LOGIN CREDENTIALS")
    print("=" * 50)
    print("  Username: admin")
    print("  Password: ChangeMe123")
    print("=" * 50)
    print("")
    print("Go to your Railway app /admin/ to login!")

except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
