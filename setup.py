#!/usr/bin/env python
"""
Setup script for Political CRM

Automates initial setup:
- Creates .env file from example
- Generates SECRET_KEY
- Provides setup instructions

Usage:
    python setup.py
"""

import os
import sys
from pathlib import Path


def generate_secret_key():
    """Generate a random Django SECRET_KEY"""
    from django.core.management.utils import get_random_secret_key
    return get_random_secret_key()


def create_env_file():
    """Create .env file from .env.example"""
    env_example = Path('.env.example')
    env_file = Path('.env')

    if env_file.exists():
        response = input('.env file already exists. Overwrite? (y/N): ')
        if response.lower() != 'y':
            print('❌ Setup cancelled.')
            return False

    if not env_example.exists():
        print('❌ Error: .env.example not found!')
        return False

    # Read example file
    with open(env_example, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generate new SECRET_KEY
    secret_key = generate_secret_key()
    content = content.replace(
        'django-insecure-generate-a-long-random-key-here-please-change-in-production',
        secret_key
    )

    # Write to .env
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print('✅ Created .env file with generated SECRET_KEY')
    return True


def check_python_version():
    """Check if Python version is 3.11+"""
    if sys.version_info < (3, 11):
        print(f'❌ Python 3.11+ required. Current version: {sys.version}')
        return False
    print(f'✅ Python version OK: {sys.version.split()[0]}')
    return True


def check_venv():
    """Check if running in virtual environment"""
    if sys.prefix == sys.base_prefix:
        print('⚠️  Warning: Not running in virtual environment!')
        print('   Run: python -m venv venv && venv\\Scripts\\activate (Windows)')
        print('        python -m venv venv && source venv/bin/activate (Mac/Linux)')
        return False
    print('✅ Virtual environment detected')
    return True


def main():
    """Main setup function"""
    print('='*60)
    print('🏛️  POLITICAL CRM - Initial Setup')
    print('='*60)
    print()

    # Check Python version
    if not check_python_version():
        sys.exit(1)

    # Check virtual environment
    venv_ok = check_venv()

    print()
    print('Step 1: Creating .env file...')
    if not create_env_file():
        sys.exit(1)

    print()
    print('='*60)
    print('✅ Initial setup completed!')
    print('='*60)
    print()
    print('Next steps:')
    print()

    if not venv_ok:
        print('1. Create and activate virtual environment:')
        print('   python -m venv venv')
        print('   venv\\Scripts\\activate  (Windows)')
        print('   source venv/bin/activate  (Mac/Linux)')
        print()

    print('2. Install dependencies:')
    print('   pip install -r requirements.txt')
    print()

    print('3. Edit .env file with your Supabase credentials:')
    print('   - SUPABASE_DB_HOST')
    print('   - SUPABASE_DB_PASSWORD')
    print('   - EMAIL settings (for reminders)')
    print()

    print('4. Run migrations:')
    print('   python manage.py migrate')
    print()

    print('5. Create superuser:')
    print('   python manage.py createsuperuser')
    print()

    print('6. Run development server:')
    print('   python manage.py runserver')
    print()

    print('Visit: http://127.0.0.1:8000/admin')
    print()
    print('For deployment instructions, see DEPLOYMENT.md')
    print('='*60)


if __name__ == '__main__':
    try:
        # Need Django to generate secret key
        import django
        main()
    except ImportError:
        print('Django not installed yet. Skipping SECRET_KEY generation.')
        print()
        print('Please run:')
        print('1. pip install Django')
        print('2. python setup.py')
        sys.exit(1)
