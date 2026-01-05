import { z } from 'zod'

// Greek phone number regex
export const GREEK_PHONE_REGEX = /^(\+30)?[2-9][0-9]{9}$/

// Greek postal code regex (5 digits)
export const GREEK_POSTAL_CODE_REGEX = /^[0-9]{5}$/

// Phone validation
export function validateGreekPhone(phone: string): boolean {
  if (!phone) return true // Optional field
  const cleaned = phone.replace(/\s/g, '')
  return GREEK_PHONE_REGEX.test(cleaned)
}

// Format Greek phone for display
export function formatGreekPhone(phone: string | null | undefined): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  if (cleaned.length === 12 && cleaned.startsWith('30')) {
    return `+30 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  return phone
}

// Base citizen fields (without refinement for composition)
const citizenBaseFields = {
  surname: z.string().min(1, 'Το επίθετο είναι υποχρεωτικό'),
  first_name: z.string().min(1, 'Το όνομα είναι υποχρεωτικό'),
  father_name: z.string().optional().nullable(),
  referral_source: z.string().optional().nullable(),
  mobile: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || GREEK_PHONE_REGEX.test(val.replace(/\s/g, '')),
      'Μη έγκυρος αριθμός κινητού'
    ),
  landline: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || GREEK_PHONE_REGEX.test(val.replace(/\s/g, '')),
      'Μη έγκυρος αριθμός σταθερού'
    ),
  email: z.string().email('Μη έγκυρο email').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  postal_code: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || GREEK_POSTAL_CODE_REGEX.test(val),
      'Ο Τ.Κ. πρέπει να είναι 5 ψηφία'
    ),
  area: z.string().optional().nullable(),
  municipality: z.string().optional().nullable(),
  electoral_district: z.string().optional().nullable(),
  contact_category: z.string().min(1, 'Επιλέξτε κατηγορία επαφής'),
  profession: z.string().optional().nullable(),
  assigned_user_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
}

// Citizen form schema
export const citizenSchema = z.object(citizenBaseFields).refine(
  (data) => data.mobile || data.landline || data.email,
  {
    message: 'Απαιτείται τουλάχιστον ένα στοιχείο επικοινωνίας (κινητό, σταθερό ή email)',
    path: ['mobile'],
  }
)

// Request form schema
export const requestSchema = z.object({
  citizen_id: z.string().uuid('Επιλέξτε πολίτη'),
  category: z.string().min(1, 'Επιλέξτε κατηγορία'),
  status: z.string().min(1, 'Επιλέξτε κατάσταση'),
  request_text: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  submitted_at: z.string().optional(),
  completed_at: z.string().optional().nullable(),
})

// Communication form schema
export const communicationSchema = z.object({
  citizen_id: z.string().uuid('Επιλέξτε πολίτη'),
  communication_date: z.string(),
  comm_type: z.string().min(1, 'Επιλέξτε τύπο επικοινωνίας'),
  notes: z.string().optional().nullable(),
})

// Military personnel form schema
export const militarySchema = z.object({
  citizen_id: z.string().uuid().optional().nullable().or(z.literal('')),
  military_type: z.string().min(1, 'Επιλέξτε τύπο'),
  surname: z.string().min(1, 'Το επώνυμο είναι υποχρεωτικό'),
  first_name: z.string().min(1, 'Το όνομα είναι υποχρεωτικό'),
  father_name: z.string().optional().nullable(),
  mobile: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || GREEK_PHONE_REGEX.test(val.replace(/\s/g, '')),
      'Μη έγκυρος αριθμός κινητού'
    ),
  email: z.string().email('Μη έγκυρο email').optional().nullable().or(z.literal('')),
  // Conscript fields
  esso_year: z.number().optional().nullable(),
  esso_letter: z.string().optional().nullable(),
  military_number: z.string().optional().nullable(),
  conscript_wish: z.string().optional().nullable(),
  training_center: z.string().optional().nullable(),
  presentation_date: z.string().optional().nullable(),
  assignment: z.string().optional().nullable(),
  assignment_date: z.string().optional().nullable(),
  transfer: z.string().optional().nullable(),
  transfer_date: z.string().optional().nullable(),
  // Permanent fields
  rank: z.string().optional().nullable(),
  service_unit: z.string().optional().nullable(),
  permanent_wish: z.string().optional().nullable(),
  service_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  assigned_user_id: z.string().uuid().optional().nullable(),
}).refine(
  (data) => data.mobile || data.email,
  {
    message: 'Απαιτείται τουλάχιστον ένα στοιχείο επικοινωνίας (κινητό ή email)',
    path: ['mobile'],
  }
)

// Combined citizen + military form schema (for creating citizen with military info)
export const citizenWithMilitarySchema = z.object({
  ...citizenBaseFields,
  // Military fields - all optional (only used when contact_category is MILITARY)
  military_type: z.string().optional(),
  esso_year: z.number().optional().nullable(),
  esso_letter: z.string().optional().nullable(),
  military_number: z.string().optional().nullable(),
  conscript_wish: z.string().optional().nullable(),
  training_center: z.string().optional().nullable(),
  presentation_date: z.string().optional().nullable(),
  assignment: z.string().optional().nullable(),
  assignment_date: z.string().optional().nullable(),
  transfer: z.string().optional().nullable(),
  transfer_date: z.string().optional().nullable(),
  rank: z.string().optional().nullable(),
  service_unit: z.string().optional().nullable(),
  permanent_wish: z.string().optional().nullable(),
  service_number: z.string().optional().nullable(),
  military_notes: z.string().optional().nullable(),
  // Optional Request fields (for creating citizen with request)
  add_request: z.boolean().optional(),
  request_category: z.string().optional(),
  request_status: z.string().optional(),
  request_text: z.string().optional().nullable(),
  request_notes: z.string().optional().nullable(),
  request_submitted_at: z.string().optional(),
  // Optional Communication fields (for creating citizen with communication)
  add_communication: z.boolean().optional(),
  comm_type: z.string().optional(),
  communication_date: z.string().optional(),
  communication_notes: z.string().optional().nullable(),
}).refine(
  (data) => data.mobile || data.landline || data.email,
  {
    message: 'Απαιτείται τουλάχιστον ένα στοιχείο επικοινωνίας (κινητό, σταθερό ή email)',
    path: ['mobile'],
  }
).refine(
  (data) => !data.add_request || (data.request_category && data.request_status),
  {
    message: 'Επιλέξτε κατηγορία και κατάσταση αιτήματος',
    path: ['request_category'],
  }
).refine(
  (data) => !data.add_communication || (data.comm_type && data.communication_date),
  {
    message: 'Επιλέξτε τύπο και ημερομηνία επικοινωνίας',
    path: ['comm_type'],
  }
)

export type CitizenFormData = z.infer<typeof citizenSchema>
export type CitizenWithMilitaryFormData = z.infer<typeof citizenWithMilitarySchema>
export type RequestFormData = z.infer<typeof requestSchema>
export type CommunicationFormData = z.infer<typeof communicationSchema>
export type MilitaryFormData = z.infer<typeof militarySchema>
