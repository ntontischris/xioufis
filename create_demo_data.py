#!/usr/bin/env python
"""Create demo data for CRM"""
import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'political_crm.settings')
django.setup()

from django.contrib.auth import get_user_model
from citizens.models import Citizen, Communication, Request, MilitaryRequest

User = get_user_model()
admin_user = User.objects.get(username='admin')

print('Creating demo data...')

# Create some citizens
citizen1 = Citizen.objects.create(
    επιθετο='Παπαδοπουλος',
    ονομα='Γιωργος',
    πατρωνυμο='Δημητριου',
    κινητο='6912345678',
    email='g.papadopoulos@example.com',
    διευθυνση='Τσιμισκη 15',
    τκ='54623',
    δημος='Θεσσαλονικης',
    περιοχη='Κεντρο',
    εκλογικη_περιφερεια='Β Θεσσαλονικης',
    κατηγορια_επαφης='ΦΙΛΟΣ',
    αρμοδιος_συνεργατης=admin_user
)
print('  - Created citizen: Papadopoulos Giorgos')

citizen2 = Citizen.objects.create(
    επιθετο='Νικολαου',
    ονομα='Μαρια',
    κινητο='6987654321',
    σταθερο='2310123456',
    διευθυνση='Εγνατια 100',
    δημος='Θεσσαλονικης',
    κατηγορια_επαφης='ΠΟΛΙΤΗΣ'
)
print('  - Created citizen: Nikolaou Maria')

citizen3 = Citizen.objects.create(
    επιθετο='Ιωαννιδης',
    ονομα='Κωνσταντινος',
    κινητο='6945678901',
    email='k.ioannidis@example.com',
    δημος='Πυλαιας-Χορτιατη',
    κατηγορια_επαφης='ΜΕΛΟΣ_ΚΟΜΜΑΤΟΣ',
    αρμοδιος_συνεργατης=admin_user
)
print('  - Created citizen: Ioannidis Konstantinos')

# Create requests
req1 = Request.objects.create(
    πολιτης=citizen1,
    κατηγορια_αιτηματος='ΔΙΟΙΚΗΤΙΚΟ',
    κατασταση='ΕΚΚΡΕΜΕΙ',
    ημερομηνια_αποστολης=date.today() - timedelta(days=30),
    αιτημα_κειμενο='Αιτημα για χορηγηση αδειας',
    created_by=admin_user
)
print('  - Created request: Administrative (30 days old, PENDING)')

req2 = Request.objects.create(
    πολιτης=citizen2,
    κατηγορια_αιτηματος='ΙΑΤΡΙΚΟ',
    κατασταση='ΟΛΟΚΛΗΡΩΜΕΝΟ',
    ημερομηνια_αποστολης=date.today() - timedelta(days=15),
    ημερομηνια_ολοκληρωσης=date.today() - timedelta(days=5),
    αιτημα_κειμενο='Αιτημα για ραντεβου σε νοσοκομειο',
    created_by=admin_user
)
print('  - Created request: Medical (COMPLETED)')

req3 = Request.objects.create(
    πολιτης=citizen3,
    κατηγορια_αιτηματος='ΣΤΡΑΤΙΩΤΙΚΟ',
    κατασταση='ΕΚΚΡΕΜΕΙ',
    ημερομηνια_αποστολης=date.today() - timedelta(days=10),
    αιτημα_κειμενο='Αιτημα για τοποθετηση στρατιωτικου',
    created_by=admin_user
)
print('  - Created request: Military (10 days old, PENDING)')

# Create military request
mil_req = MilitaryRequest.objects.create(
    αιτημα=req3,
    τυπος='ΣΤΡΑΤΙΩΤΗΣ',
    ονομα='Κωνσταντινος',
    επωνυμο='Ιωαννιδης',
    πατρωνυμο='Γεωργιου',
    εσσο_ετος='2025',
    εσσο_γραμμα='Α',
    ασμ='2025001234',
    επιθυμια='71 Αεροπορικη Ταξιαρχια - Νεα Αγχιαλος',
    ημερομηνια_παρουσιασης=date.today() + timedelta(days=30)
)
print('  - Created military request: ESSO 2025A')

# Create communications
comm1 = Communication.objects.create(
    πολιτης=citizen1,
    ημερομηνια_επικοινωνιας=date.today() - timedelta(days=5),
    τυπος='ΤΗΛΕΦΩΝΟ',
    σημειωσεις='Τηλεφωνικη επικοινωνια για ενημερωση σχετικα με το αιτημα',
    created_by=admin_user
)
print('  - Created communication: Phone call with Papadopoulos')

comm2 = Communication.objects.create(
    πολιτης=citizen2,
    ημερομηνια_επικοινωνιας=date.today() - timedelta(days=1),
    τυπος='EMAIL',
    σημειωσεις='Email για ενημερωση ολοκληρωσης αιτηματος',
    created_by=admin_user
)
print('  - Created communication: Email to Nikolaou')

print('\n===========================================')
print('Demo data created successfully!')
print('===========================================')
print('Citizens: 3')
print('Requests: 3 (1 completed, 2 pending)')
print('Military Requests: 1')
print('Communications: 2')
print('\nAdmin credentials:')
print('  URL: http://127.0.0.1:8000/admin/')
print('  Username: admin')
print('  Password: admin123')
print('===========================================')
