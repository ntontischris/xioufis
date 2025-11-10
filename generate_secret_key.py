#!/usr/bin/env python
"""
Generate a Django SECRET_KEY for Railway deployment.

Usage:
    python generate_secret_key.py

This will print a secure SECRET_KEY that you can copy to Railway environment variables.
"""

from django.core.management.utils import get_random_secret_key

if __name__ == '__main__':
    secret_key = get_random_secret_key()
    print("=" * 80)
    print("Generated Django SECRET_KEY for Railway:")
    print("=" * 80)
    print()
    print(secret_key)
    print()
    print("=" * 80)
    print("Copy this key and add it to Railway environment variables as:")
    print(f"SECRET_KEY={secret_key}")
    print("=" * 80)
    print()
    print("Steps to add in Railway:")
    print("1. Go to your Railway project dashboard")
    print("2. Click on your service (web)")
    print("3. Go to 'Variables' tab")
    print("4. Click 'New Variable'")
    print("5. Add: SECRET_KEY = <paste the key above>")
    print("6. Save and redeploy")
    print()
