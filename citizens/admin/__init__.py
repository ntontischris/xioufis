"""
Citizens Admin Package

Re-exports all admin classes for Django autodiscovery.

Structure:
- base.py: Mixins and utility classes
- inlines.py: Inline admin classes
- citizen.py: CitizenAdmin
- request.py: RequestAdmin
- communication.py: CommunicationAdmin
- military.py: MilitaryPersonnelAdmin
- user.py: CustomUserAdmin
"""

# Import all admin classes to register them with Django
from .citizen import CitizenAdmin
from .request import RequestAdmin
from .communication import CommunicationAdmin
from .military import MilitaryPersonnelAdmin
from .user import CustomUserAdmin

# Export for explicit imports
__all__ = [
    'CitizenAdmin',
    'RequestAdmin',
    'CommunicationAdmin',
    'MilitaryPersonnelAdmin',
    'CustomUserAdmin',
]
