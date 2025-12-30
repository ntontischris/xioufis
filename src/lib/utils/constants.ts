// Greek Labels for UI
export const LABELS = {
  // Citizens
  surname: 'Επίθετο',
  first_name: 'Όνομα',
  father_name: 'Πατρώνυμο',
  referral_source: 'Σύσταση από',
  mobile: 'Κινητό',
  landline: 'Σταθερό',
  email: 'Email',
  address: 'Διεύθυνση',
  postal_code: 'Τ.Κ.',
  area: 'Περιοχή',
  municipality: 'Δήμος',
  electoral_district: 'Εκλογική Περιφέρεια',
  contact_category: 'Κατηγορία Επαφής',
  profession: 'Ιδιότητα',
  assigned_user: 'Αρμόδιος Συνεργάτης',
  notes: 'Παρατηρήσεις',
  is_active: 'Ενεργός',
  created_at: 'Ημ/νία Δημιουργίας',
  updated_at: 'Τελευταία Ενημέρωση',

  // Requests
  category: 'Κατηγορία',
  status: 'Κατάσταση',
  request_text: 'Κείμενο Αιτήματος',
  submitted_at: 'Ημ/νία Αποστολής',
  completed_at: 'Ημ/νία Ολοκλήρωσης',
  reminder_sent: 'Υπενθύμιση',

  // Communications
  communication_date: 'Ημ/νία Επικοινωνίας',
  comm_type: 'Τύπος',

  // Military
  military_type: 'Τύπος',
  esso_year: 'ΕΣΣΟ Έτος',
  esso_letter: 'ΕΣΣΟ Γράμμα',
  military_number: 'ΑΣΜ',
  conscript_wish: 'Επιθυμία Στρατιώτη',
  training_center: 'Κέντρο Εκπαίδευσης',
  presentation_date: 'Ημ/νία Παρουσίασης',
  assignment: 'Τοποθέτηση',
  assignment_date: 'Ημ/νία Τοποθέτησης',
  transfer: 'Μετάθεση/Απόσπαση',
  transfer_date: 'Ημ/νία Μετάθεσης',
  rank: 'Βαθμός',
  service_unit: 'Μονάδα Υπηρεσίας',
  permanent_wish: 'Επιθυμία Μόνιμου',
  service_number: 'ΑΜ',
} as const

// Municipality options
export const MUNICIPALITY_OPTIONS = [
  { value: 'THESSALONIKI', label: 'Θεσσαλονίκη' },
  { value: 'KALAMARIA', label: 'Καλαμαριά' },
  { value: 'PAVLOS_MELAS', label: 'Παύλος Μελάς' },
  { value: 'KORDELIO_EVOSMOS', label: 'Κορδελιό-Εύοσμος' },
  { value: 'AMPELOKIPOI_MENEMENI', label: 'Αμπελόκηποι-Μενεμένη' },
  { value: 'NEAPOLI_SYKIES', label: 'Νεάπολη-Συκιές' },
  { value: 'OTHER', label: 'Άλλος' },
] as const

// Electoral district options
export const ELECTORAL_DISTRICT_OPTIONS = [
  { value: 'THESSALONIKI_A', label: "Α' Θεσσαλονίκης" },
  { value: 'THESSALONIKI_B', label: "Β' Θεσσαλονίκης" },
  { value: 'OTHER', label: 'Άλλη' },
] as const

// Contact category options
export const CONTACT_CATEGORY_OPTIONS = [
  { value: 'GDPR', label: 'GDPR' },
  { value: 'REQUEST', label: 'Αίτημα' },
  { value: 'BOTH', label: 'GDPR & Αίτημα' },
  { value: 'MILITARY', label: 'Στρατιωτικό' },
] as const

// Request category options
export const REQUEST_CATEGORY_OPTIONS = [
  { value: 'MILITARY', label: 'Στρατιωτικό' },
  { value: 'MEDICAL', label: 'Ιατρικό' },
  { value: 'POLICE', label: 'Αστυνομικό' },
  { value: 'FIRE_DEPARTMENT', label: 'Πυροσβεστική' },
  { value: 'EDUCATION', label: 'Παιδείας' },
  { value: 'ADMINISTRATIVE', label: 'Διοικητικό' },
  { value: 'JOB_SEARCH', label: 'Εύρεση Εργασίας' },
  { value: 'SOCIAL_SECURITY', label: 'ΕΦΚΑ' },
  { value: 'OTHER', label: 'Άλλο' },
] as const

// Request status options
export const REQUEST_STATUS_OPTIONS = [
  { value: 'COMPLETED', label: 'Ολοκληρωμένο', color: 'success' },
  { value: 'PENDING', label: 'Εκκρεμεί', color: 'warning' },
  { value: 'NOT_COMPLETED', label: 'Μη Ολοκληρωμένο', color: 'secondary' },
] as const

// Communication type options
export const COMMUNICATION_TYPE_OPTIONS = [
  { value: 'PHONE', label: 'Τηλέφωνο' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'IN_PERSON', label: 'Προσωπική' },
  { value: 'SMS', label: 'SMS' },
  { value: 'OTHER', label: 'Άλλο' },
] as const

// Military type options
export const MILITARY_TYPE_OPTIONS = [
  { value: 'CONSCRIPT', label: 'Στρατιώτης' },
  { value: 'PERMANENT', label: 'Μόνιμος' },
] as const

// ΕΣΣΟ letter options
export const ESSO_LETTER_OPTIONS = [
  { value: 'Α', label: 'Α' },
  { value: 'Β', label: 'Β' },
  { value: 'Γ', label: 'Γ' },
  { value: 'Δ', label: 'Δ' },
  { value: 'Ε', label: 'Ε' },
] as const

// User role options
export const USER_ROLE_OPTIONS = [
  { value: 'SUPERADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'REGULAR', label: 'Χρήστης' },
] as const

// Helper function to get label from value
export function getLabel(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return '-'
  const option = options.find((o) => o.value === value)
  return option?.label ?? value
}

// Helper function to get status color
export function getStatusColor(status: string): 'success' | 'warning' | 'secondary' | 'destructive' {
  const option = REQUEST_STATUS_OPTIONS.find((o) => o.value === status)
  return (option?.color as 'success' | 'warning' | 'secondary') ?? 'secondary'
}
