-- ============================================
-- SAMPLE DATA FOR POLITICAL CRM
-- Run this in Supabase SQL Editor
-- ============================================

-- First, get your user ID (replace with your actual user ID from auth.users)
-- You can find it by running: SELECT id FROM auth.users LIMIT 1;

-- For this script, we'll use a placeholder that you should replace
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID

DO $$
DECLARE
    v_user_id UUID;

    -- Citizen IDs
    c1 UUID := gen_random_uuid();
    c2 UUID := gen_random_uuid();
    c3 UUID := gen_random_uuid();
    c4 UUID := gen_random_uuid();
    c5 UUID := gen_random_uuid();
    c6 UUID := gen_random_uuid();
    c7 UUID := gen_random_uuid();
    c8 UUID := gen_random_uuid();
    c9 UUID := gen_random_uuid();
    c10 UUID := gen_random_uuid();
    c11 UUID := gen_random_uuid();
    c12 UUID := gen_random_uuid();
    c13 UUID := gen_random_uuid();
    c14 UUID := gen_random_uuid();
    c15 UUID := gen_random_uuid();
    c16 UUID := gen_random_uuid();
    c17 UUID := gen_random_uuid();
    c18 UUID := gen_random_uuid();
    c19 UUID := gen_random_uuid();
    c20 UUID := gen_random_uuid();

BEGIN
    -- Get the first user from auth.users
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found in auth.users. Please create a user first.';
    END IF;

    -- ============================================
    -- CITIZENS (20 records)
    -- ============================================

    INSERT INTO citizens (id, surname, first_name, father_name, mobile, landline, email, address, postal_code, area, municipality, electoral_district, contact_category, profession, referral_source, notes, is_active) VALUES

    -- Active citizens with various data
    (c1, 'Παπαδόπουλος', 'Γιώργος', 'Νικόλαος', '6944123456', '2310123456', 'g.papadopoulos@email.gr', 'Τσιμισκή 45', '54623', 'Κέντρο', 'THESSALONIKI', 'THESSALONIKI_A', 'BOTH', 'Δικηγόρος', 'Φίλος από γυμνάσιο', 'Πολύ καλή επαφή, βοηθάει σε νομικά θέματα', true),

    (c2, 'Κωνσταντινίδου', 'Μαρία', 'Δημήτριος', '6972234567', NULL, 'maria.kon@gmail.com', 'Εγνατία 120', '54635', 'Κέντρο', 'THESSALONIKI', 'THESSALONIKI_A', 'GDPR', 'Καθηγήτρια', 'Εκδήλωση κόμματος', NULL, true),

    (c3, 'Αντωνίου', 'Κώστας', 'Αντώνιος', '6981345678', '2310234567', 'k.antoniou@yahoo.gr', 'Λαγκαδά 85', '56430', 'Σταυρούπολη', 'PAVLOS_MELAS', 'THESSALONIKI_B', 'REQUEST', 'Ιδιωτικός Υπάλληλος', NULL, 'Έχει αίτημα για στρατιωτικά', true),

    (c4, 'Δημητρίου', 'Ελένη', 'Γεώργιος', '6955456789', NULL, 'eleni.d@hotmail.com', 'Καραμανλή 22', '55133', 'Καλαμαριά', 'KALAMARIA', 'THESSALONIKI_A', 'BOTH', 'Γιατρός', 'Σύσταση από Παπαδόπουλο', 'Παθολόγος, μπορεί να βοηθήσει', true),

    (c5, 'Νικολάου', 'Πέτρος', 'Ιωάννης', '6932567890', '2310345678', NULL, 'Βασ. Όλγας 150', '54645', 'Ντεπώ', 'THESSALONIKI', 'THESSALONIKI_A', 'GDPR', 'Συνταξιούχος', 'Γείτονας γραφείου', NULL, true),

    (c6, 'Γεωργίου', 'Σοφία', 'Κωνσταντίνος', '6978678901', NULL, 'sofia.g@gmail.com', 'Μοναστηρίου 55', '54627', 'Βαρδάρη', 'THESSALONIKI', 'THESSALONIKI_A', 'REQUEST', 'Φοιτήτρια', NULL, 'Ζητάει βοήθεια για μεταπτυχιακό', true),

    (c7, 'Ιωάννου', 'Δημήτρης', 'Παναγιώτης', '6945789012', '2310456789', 'd.ioannou@company.gr', 'Πλαστήρα 30', '55131', 'Καλαμαριά', 'KALAMARIA', 'THESSALONIKI_A', 'BOTH', 'Επιχειρηματίας', 'Εμπορικό Επιμελητήριο', 'Ιδιοκτήτης εστιατορίου', true),

    (c8, 'Βασιλείου', 'Αναστασία', 'Βασίλειος', '6923890123', NULL, 'a.vasiliou@outlook.com', 'Δελφών 78', '54642', 'Τούμπα', 'THESSALONIKI', 'THESSALONIKI_B', 'GDPR', 'Νοσηλεύτρια', 'Facebook', NULL, true),

    (c9, 'Χριστοδούλου', 'Αλέξανδρος', 'Χρήστος', '6967901234', '2310567890', 'alex.chris@gmail.com', 'Παπάφη 95', '54638', 'Τούμπα', 'THESSALONIKI', 'THESSALONIKI_B', 'REQUEST', 'Μηχανικός', NULL, 'Πολιτικός μηχανικός, θέλει άδεια', true),

    (c10, 'Παπανικολάου', 'Θεοδώρα', 'Νικόλαος', '6934012345', NULL, 't.papanikolaou@email.gr', 'Βούλγαρη 40', '54248', 'Χαριλάου', 'THESSALONIKI', 'THESSALONIKI_A', 'BOTH', 'Λογίστρια', 'Λογιστικό γραφείο', 'Βοηθάει με φορολογικά', true),

    (c11, 'Μιχαηλίδης', 'Στέφανος', 'Μιχαήλ', '6989123456', '2310678901', 's.michailidis@work.gr', 'Ολύμπου 15', '56224', 'Εύοσμος', 'KORDELIO_EVOSMOS', 'THESSALONIKI_B', 'REQUEST', 'Δημόσιος Υπάλληλος', NULL, 'Εργάζεται σε ΚΕΠ', true),

    (c12, 'Αλεξίου', 'Κατερίνα', 'Αλέξιος', '6956234567', NULL, 'katerina.alex@gmail.com', 'Γρηγορίου Λαμπράκη 50', '54352', 'Χαριλάου', 'THESSALONIKI', 'THESSALONIKI_A', 'GDPR', 'Δασκάλα', 'Σχολική εκδήλωση', NULL, true),

    (c13, 'Οικονόμου', 'Νίκος', 'Οικονόμος', '6943345678', '2310789012', 'n.oikonomou@business.gr', 'Πολυτεχνείου 88', '54626', 'Κέντρο', 'THESSALONIKI', 'THESSALONIKI_A', 'BOTH', 'Οικονομολόγος', 'Επαγγελματική επαφή', 'Σύμβουλος επιχειρήσεων', true),

    (c14, 'Παπαγεωργίου', 'Βασίλης', 'Γεώργιος', '6978456789', NULL, 'v.papageorgiou@email.gr', 'Ανθέων 25', '55134', 'Καλαμαριά', 'KALAMARIA', 'THESSALONIKI_A', 'REQUEST', 'Αστυνομικός', NULL, 'Υπηρετεί στη Θεσσαλονίκη', true),

    (c15, 'Σταυρίδου', 'Μαριάννα', 'Σταύρος', '6965567890', '2310890123', 'm.stavridou@yahoo.gr', 'Κομνηνών 100', '54624', 'Κέντρο', 'THESSALONIKI', 'THESSALONIKI_A', 'GDPR', 'Φαρμακοποιός', 'Φαρμακευτικός Σύλλογος', 'Ιδιοκτήτρια φαρμακείου', true),

    (c16, 'Καραγιάννης', 'Θανάσης', 'Ιωάννης', '6932678901', NULL, 'th.karagiannis@gmail.com', 'Κηφισίας 45', '56429', 'Σταυρούπολη', 'PAVLOS_MELAS', 'THESSALONIKI_B', 'REQUEST', 'Οδηγός', NULL, 'Οδηγός ταξί', true),

    (c17, 'Λαζαρίδης', 'Γιάννης', 'Λάζαρος', '6949789012', '2310901234', 'g.lazaridis@company.gr', 'Αγίας Σοφίας 30', '54622', 'Κέντρο', 'THESSALONIKI', 'THESSALONIKI_A', 'BOTH', 'Αρχιτέκτονας', 'Τεχνικό Επιμελητήριο', 'Σχεδιάζει κτίρια', true),

    (c18, 'Πετρίδου', 'Χριστίνα', 'Πέτρος', '6976890123', NULL, 'ch.petridou@email.gr', 'Μητροπόλεως 60', '54625', 'Κέντρο', 'THESSALONIKI', 'THESSALONIKI_A', 'GDPR', 'Δημοσιογράφος', 'Δημοσιογραφική κάλυψη', NULL, true),

    (c19, 'Κουτσούμπας', 'Μάριος', 'Κωνσταντίνος', '6963901234', '2310012345', 'm.koutsoumpas@work.gr', 'Αριστοτέλους 80', '54631', 'Κέντρο', 'THESSALONIKI', 'THESSALONIKI_A', 'REQUEST', 'Πυροσβέστης', NULL, 'Υπηρετεί στην Πυροσβεστική', true),

    (c20, 'Αθανασίου', 'Ειρήνη', 'Αθανάσιος', '6954012345', NULL, 'eirini.ath@gmail.com', 'Καυταντζόγλου 12', '54639', 'Τούμπα', 'THESSALONIKI', 'THESSALONIKI_B', 'BOTH', 'Ψυχολόγος', 'Ιατρικός Σύλλογος', 'Ιδιωτικό γραφείο', true);

    -- ============================================
    -- REQUESTS (30 records)
    -- ============================================

    INSERT INTO requests (citizen_id, category, status, request_text, notes, submitted_at, completed_at, created_by) VALUES

    -- Completed requests
    (c1, 'ADMINISTRATIVE', 'COMPLETED', 'Βεβαίωση μονίμου κατοικίας για φορολογικούς λόγους', 'Εκδόθηκε από τον Δήμο', '2024-09-15', '2024-09-20', v_user_id),
    (c2, 'EDUCATION', 'COMPLETED', 'Μετάθεση σε σχολείο κοντά στο σπίτι', 'Εγκρίθηκε από το Υπουργείο', '2024-08-10', '2024-10-01', v_user_id),
    (c4, 'MEDICAL', 'COMPLETED', 'Θέση ειδικευόμενου σε δημόσιο νοσοκομείο', 'Τοποθετήθηκε στο ΑΧΕΠΑ', '2024-07-20', '2024-09-15', v_user_id),
    (c7, 'ADMINISTRATIVE', 'COMPLETED', 'Άδεια λειτουργίας εστιατορίου', 'Εκδόθηκε μετά από επιθεώρηση', '2024-06-01', '2024-08-30', v_user_id),
    (c10, 'SOCIAL_SECURITY', 'COMPLETED', 'Διόρθωση ενσήμων ΕΦΚΑ', 'Ολοκληρώθηκε η διόρθωση', '2024-05-15', '2024-07-20', v_user_id),
    (c13, 'JOB_SEARCH', 'COMPLETED', 'Σύσταση για θέση σε τράπεζα', 'Προσλήφθηκε', '2024-04-10', '2024-06-01', v_user_id),
    (c15, 'ADMINISTRATIVE', 'COMPLETED', 'Άδεια ίδρυσης φαρμακείου', 'Εκδόθηκε η άδεια', '2024-03-20', '2024-05-15', v_user_id),
    (c17, 'ADMINISTRATIVE', 'COMPLETED', 'Έγκριση οικοδομικής άδειας', 'Εγκρίθηκε το project', '2024-02-15', '2024-04-20', v_user_id),

    -- Pending requests
    (c3, 'MILITARY', 'PENDING', 'Αναβολή στράτευσης για λόγους υγείας', 'Αναμένεται απάντηση από ΓΕΣ', '2024-11-01', NULL, v_user_id),
    (c5, 'MEDICAL', 'PENDING', 'Προτεραιότητα σε χειρουργείο γόνατος', 'Επικοινωνία με ΑΧΕΠΑ', '2024-11-15', NULL, v_user_id),
    (c6, 'EDUCATION', 'PENDING', 'Υποτροφία για μεταπτυχιακό', 'Κατατέθηκε η αίτηση', '2024-10-20', NULL, v_user_id),
    (c8, 'JOB_SEARCH', 'PENDING', 'Θέση νοσηλεύτριας σε δημόσιο νοσοκομείο', 'Αναμένονται προκηρύξεις', '2024-11-10', NULL, v_user_id),
    (c9, 'ADMINISTRATIVE', 'PENDING', 'Άδεια μηχανικού για ειδικές κατασκευές', 'Σε εξέλιξη', '2024-10-05', NULL, v_user_id),
    (c11, 'ADMINISTRATIVE', 'PENDING', 'Μετάθεση σε ΚΕΠ κοντά στο σπίτι', 'Υποβλήθηκε αίτηση', '2024-09-25', NULL, v_user_id),
    (c12, 'EDUCATION', 'PENDING', 'Απόσπαση σε άλλο σχολείο', 'Αναμένεται έγκριση', '2024-11-20', NULL, v_user_id),
    (c14, 'POLICE', 'PENDING', 'Μετάθεση σε υπηρεσία Θεσσαλονίκης', 'Επικοινωνία με Αρχηγείο', '2024-10-15', NULL, v_user_id),
    (c16, 'ADMINISTRATIVE', 'PENDING', 'Ανανέωση άδειας ταξί', 'Λείπουν δικαιολογητικά', '2024-11-05', NULL, v_user_id),
    (c18, 'JOB_SEARCH', 'PENDING', 'Θέση σε δημόσιο ΜΜΕ', 'Αναζήτηση επαφών', '2024-10-25', NULL, v_user_id),
    (c19, 'FIRE_DEPARTMENT', 'PENDING', 'Μετάθεση εντός νομού', 'Υποβλήθηκε αίτημα', '2024-09-30', NULL, v_user_id),
    (c20, 'MEDICAL', 'PENDING', 'Άδεια λειτουργίας ψυχολογικού γραφείου', 'Σε αναμονή', '2024-11-25', NULL, v_user_id),

    -- Not completed requests
    (c3, 'EDUCATION', 'NOT_COMPLETED', 'Εγγραφή σε ΙΕΚ', 'Δεν υπήρχαν θέσεις', '2024-06-15', NULL, v_user_id),
    (c6, 'JOB_SEARCH', 'NOT_COMPLETED', 'Πρακτική σε εταιρεία', 'Δεν βρέθηκε θέση', '2024-05-20', NULL, v_user_id),
    (c9, 'ADMINISTRATIVE', 'NOT_COMPLETED', 'Άδεια για εξωτερικό', 'Απορρίφθηκε', '2024-04-15', NULL, v_user_id),

    -- More varied requests
    (c1, 'MILITARY', 'COMPLETED', 'Βεβαίωση στρατιωτικής θητείας', 'Εκδόθηκε', '2024-01-10', '2024-01-20', v_user_id),
    (c4, 'EDUCATION', 'PENDING', 'Θέση επικουρικού γιατρού', 'Σε εξέλιξη', '2024-12-01', NULL, v_user_id),
    (c7, 'SOCIAL_SECURITY', 'PENDING', 'Ρύθμιση οφειλών ΕΦΚΑ', 'Αναμένεται απάντηση', '2024-12-10', NULL, v_user_id),
    (c11, 'MEDICAL', 'COMPLETED', 'Πιστοποιητικό υγείας για εργασία', 'Εκδόθηκε', '2024-08-20', '2024-08-25', v_user_id),
    (c14, 'ADMINISTRATIVE', 'PENDING', 'Άδεια οπλοφορίας', 'Σε επεξεργασία', '2024-12-05', NULL, v_user_id),
    (c17, 'JOB_SEARCH', 'COMPLETED', 'Σύσταση για δημόσιο διαγωνισμό', 'Επιτυχής', '2024-07-10', '2024-09-01', v_user_id),
    (c20, 'EDUCATION', 'PENDING', 'Πιστοποίηση ειδικότητας', 'Κατατέθηκαν δικαιολογητικά', '2024-12-15', NULL, v_user_id);

    -- ============================================
    -- COMMUNICATIONS (40 records)
    -- ============================================

    INSERT INTO communications (citizen_id, communication_date, comm_type, notes, created_by) VALUES

    -- Various communications across citizens
    (c1, '2024-12-20', 'PHONE', 'Ευχαριστίες για την επίλυση του θέματος', v_user_id),
    (c1, '2024-09-18', 'IN_PERSON', 'Συνάντηση στο γραφείο για την βεβαίωση', v_user_id),
    (c1, '2024-09-16', 'PHONE', 'Ενημέρωση για την πορεία του αιτήματος', v_user_id),

    (c2, '2024-12-15', 'EMAIL', 'Αποστολή ευχών για τις γιορτές', v_user_id),
    (c2, '2024-10-02', 'PHONE', 'Ενημέρωση για την έγκριση μετάθεσης', v_user_id),
    (c2, '2024-08-15', 'IN_PERSON', 'Παραλαβή αίτησης μετάθεσης', v_user_id),

    (c3, '2024-12-10', 'PHONE', 'Ενημέρωση για αναβολή στράτευσης', v_user_id),
    (c3, '2024-11-05', 'EMAIL', 'Αποστολή δικαιολογητικών', v_user_id),
    (c3, '2024-11-02', 'IN_PERSON', 'Συνάντηση για στρατιωτικό αίτημα', v_user_id),

    (c4, '2024-12-18', 'PHONE', 'Επικοινωνία για νέο αίτημα', v_user_id),
    (c4, '2024-09-16', 'IN_PERSON', 'Ευχαριστίες για τη θέση ειδικευόμενου', v_user_id),
    (c4, '2024-07-25', 'EMAIL', 'Αποστολή βιογραφικού', v_user_id),

    (c5, '2024-12-05', 'PHONE', 'Ερώτηση για πορεία χειρουργείου', v_user_id),
    (c5, '2024-11-20', 'IN_PERSON', 'Κατάθεση ιατρικών εγγράφων', v_user_id),

    (c6, '2024-12-12', 'EMAIL', 'Ενημέρωση για υποτροφία', v_user_id),
    (c6, '2024-10-25', 'PHONE', 'Συζήτηση για μεταπτυχιακό', v_user_id),
    (c6, '2024-10-22', 'IN_PERSON', 'Παραλαβή συστατικής επιστολής', v_user_id),

    (c7, '2024-12-22', 'IN_PERSON', 'Πρόσκληση σε εκδήλωση', v_user_id),
    (c7, '2024-08-31', 'PHONE', 'Ευχαριστίες για την άδεια', v_user_id),
    (c7, '2024-06-10', 'EMAIL', 'Αποστολή δικαιολογητικών άδειας', v_user_id),

    (c8, '2024-12-08', 'PHONE', 'Ενημέρωση για προκηρύξεις', v_user_id),
    (c8, '2024-11-15', 'EMAIL', 'Αποστολή βιογραφικού', v_user_id),

    (c9, '2024-12-01', 'IN_PERSON', 'Συνάντηση για άδεια μηχανικού', v_user_id),
    (c9, '2024-10-10', 'PHONE', 'Ερώτηση για δικαιολογητικά', v_user_id),

    (c10, '2024-12-20', 'PHONE', 'Ευχές για τις γιορτές', v_user_id),
    (c10, '2024-07-25', 'IN_PERSON', 'Ευχαριστίες για ΕΦΚΑ', v_user_id),

    (c11, '2024-12-15', 'EMAIL', 'Ενημέρωση για μετάθεση', v_user_id),
    (c11, '2024-09-28', 'PHONE', 'Κατάθεση αίτησης', v_user_id),

    (c12, '2024-12-10', 'PHONE', 'Συζήτηση για απόσπαση', v_user_id),
    (c12, '2024-11-22', 'IN_PERSON', 'Παραλαβή αίτησης', v_user_id),

    (c13, '2024-12-18', 'IN_PERSON', 'Συνάντηση για συνεργασία', v_user_id),
    (c13, '2024-06-05', 'PHONE', 'Ευχαριστίες για τη σύσταση', v_user_id),

    (c14, '2024-12-05', 'PHONE', 'Ενημέρωση για μετάθεση', v_user_id),
    (c14, '2024-10-18', 'EMAIL', 'Αποστολή αίτησης', v_user_id),

    (c15, '2024-12-22', 'IN_PERSON', 'Επίσκεψη στο φαρμακείο', v_user_id),
    (c15, '2024-05-20', 'PHONE', 'Ευχαριστίες για άδεια', v_user_id),

    (c16, '2024-12-08', 'PHONE', 'Ερώτηση για δικαιολογητικά', v_user_id),
    (c17, '2024-12-12', 'IN_PERSON', 'Συνάντηση για νέο project', v_user_id),
    (c18, '2024-12-15', 'EMAIL', 'Επικοινωνία για δημοσίευμα', v_user_id),
    (c19, '2024-12-10', 'PHONE', 'Ενημέρωση για μετάθεση', v_user_id);

    -- ============================================
    -- MILITARY PERSONNEL (15 records)
    -- ============================================

    -- Conscripts (Στρατιώτες)
    INSERT INTO military_personnel (citizen_id, military_type, surname, first_name, father_name, mobile, email, esso_year, esso_letter, military_number, conscript_wish, training_center, presentation_date, assignment, assignment_date, transfer, transfer_date, notes, created_by) VALUES

    (NULL, 'CONSCRIPT', 'Αλεξόπουλος', 'Νίκος', 'Αλέξανδρος', '6944111222', 'n.alexopoulos@gmail.com', 2024, 'Α', 'ΣΜ-12345', 'Θεσσαλονίκη', 'ΚΕΝ Αυλώνα', '2024-01-15', '424 ΣΝΕΝ', '2024-02-20', NULL, NULL, 'Κληρωτός από Θεσσαλονίκη', v_user_id),

    (NULL, 'CONSCRIPT', 'Παπαθανασίου', 'Γιώργος', 'Θανάσης', '6972222333', 'g.papathanasio@email.gr', 2024, 'Α', 'ΣΜ-12346', 'ΣΕΑΠ', 'ΚΕΝ Τρίπολης', '2024-01-15', 'ΣΕΑΠ Θεσσαλονίκης', '2024-03-01', NULL, NULL, 'Μαθητευόμενος στρατιωτικός', v_user_id),

    (NULL, 'CONSCRIPT', 'Καραμάνης', 'Στέλιος', 'Μάνος', '6981333444', 's.karamanis@gmail.com', 2024, 'Β', 'ΣΜ-23456', 'Κοντά στο σπίτι', 'ΚΕΝ Λαμίας', '2024-03-15', 'ΠΖ Θεσσαλονίκης', '2024-04-25', NULL, NULL, NULL, v_user_id),

    (NULL, 'CONSCRIPT', 'Δημητρακόπουλος', 'Χρήστος', 'Δημήτρης', '6955444555', 'ch.dimitrakopoulos@yahoo.gr', 2024, 'Β', 'ΣΜ-23457', 'Αεροπορία', 'ΚΕΑ Δεκέλειας', '2024-03-15', '350 ΠΚΒ', '2024-04-30', 'Απόσπαση Σέδες', '2024-09-01', 'Τεχνικός αεροσκαφών', v_user_id),

    (NULL, 'CONSCRIPT', 'Νικολαΐδης', 'Άγγελος', 'Νίκος', '6932555666', 'a.nikolaidis@email.gr', 2024, 'Γ', 'ΣΜ-34567', 'Ναυτικό', 'ΚΕΝΠ Πόρου', '2024-05-15', 'ΝΒΘ', '2024-06-20', NULL, NULL, 'Μηχανικός πλοίων', v_user_id),

    (NULL, 'CONSCRIPT', 'Σταματίου', 'Μιχάλης', 'Σταμάτης', '6978666777', 'm.stamatiou@gmail.com', 2024, 'Γ', NULL, 'Θεσσαλονίκη', NULL, '2024-05-15', NULL, NULL, NULL, NULL, 'Αναμένει κατάταξη', v_user_id),

    (NULL, 'CONSCRIPT', 'Γκουτζουρέλης', 'Παύλος', 'Ιωάννης', '6945777888', 'p.goutzourellis@email.gr', 2024, 'Δ', NULL, 'Πολεμική Αεροπορία', NULL, '2024-07-15', NULL, NULL, NULL, NULL, 'Μελλοντική κατάταξη', v_user_id),

    (NULL, 'CONSCRIPT', 'Λαμπρόπουλος', 'Θοδωρής', 'Λάμπρος', '6923888999', 'th.lampropoulos@gmail.com', 2025, 'Α', NULL, 'Πεζικό', NULL, '2025-01-15', NULL, NULL, NULL, NULL, 'ΕΣΣΟ 2025', v_user_id),

    -- Permanent (Μόνιμοι)
    (NULL, 'PERMANENT', 'Κωστόπουλος', 'Αντώνης', 'Κώστας', '6967999000', 'a.kostopoulos@army.gr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Μόνιμος αξιωματικός', v_user_id),
    (NULL, 'PERMANENT', 'Μαρκόπουλος', 'Δημήτρης', 'Μάρκος', '6934000111', 'd.markopoulos@army.gr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Έμπειρος αξιωματικός', v_user_id),
    (NULL, 'PERMANENT', 'Ανδρεόπουλος', 'Σπύρος', 'Ανδρέας', '6989111222', 's.andreopoulos@army.gr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_user_id),
    (NULL, 'PERMANENT', 'Βλαχόπουλος', 'Γεώργιος', 'Βλάσης', '6956222333', 'g.vlachopoulos@army.gr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Τεχνικός', v_user_id),
    (NULL, 'PERMANENT', 'Τσολάκης', 'Κώστας', 'Τσόλας', '6943333444', 'k.tsolakis@army.gr', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Ναυτικό', v_user_id);

    -- Update permanent military with their specific fields
    UPDATE military_personnel SET
        rank = 'Λοχαγός',
        service_unit = '424 ΣΝΕΝ',
        service_number = 'ΑΜ-5678',
        permanent_wish = 'Μετάθεση σε Αθήνα'
    WHERE surname = 'Κωστόπουλος' AND military_type = 'PERMANENT';

    UPDATE military_personnel SET
        rank = 'Ταγματάρχης',
        service_unit = 'ΣΕΑΠ Θεσσαλονίκης',
        service_number = 'ΑΜ-4567',
        permanent_wish = 'Προαγωγή'
    WHERE surname = 'Μαρκόπουλος' AND military_type = 'PERMANENT';

    UPDATE military_personnel SET
        rank = 'Υπολοχαγός',
        service_unit = '3ο ΣΠ',
        service_number = 'ΑΜ-6789',
        permanent_wish = NULL
    WHERE surname = 'Ανδρεόπουλος' AND military_type = 'PERMANENT';

    UPDATE military_personnel SET
        rank = 'Λοχίας',
        service_unit = '350 ΠΚΒ',
        service_number = 'ΑΜ-7890',
        permanent_wish = 'Εκπαίδευση'
    WHERE surname = 'Βλαχόπουλος' AND military_type = 'PERMANENT';

    UPDATE military_personnel SET
        rank = 'Επιλοχίας',
        service_unit = 'ΝΒΘ',
        service_number = 'ΑΜ-8901',
        permanent_wish = 'Απόσπαση σε νησί'
    WHERE surname = 'Τσολάκης' AND military_type = 'PERMANENT';

    RAISE NOTICE 'Sample data inserted successfully!';
    RAISE NOTICE 'Citizens: 20';
    RAISE NOTICE 'Requests: 30';
    RAISE NOTICE 'Communications: 40';
    RAISE NOTICE 'Military Personnel: 13';

END $$;

-- Verify the data
SELECT 'Citizens' as table_name, COUNT(*) as count FROM citizens
UNION ALL
SELECT 'Requests', COUNT(*) FROM requests
UNION ALL
SELECT 'Communications', COUNT(*) FROM communications
UNION ALL
SELECT 'Military Personnel', COUNT(*) FROM military_personnel;
