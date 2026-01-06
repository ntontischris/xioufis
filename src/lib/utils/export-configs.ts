import { ExcelColumn, formatDateForExcel, formatBooleanForExcel } from './excel-export'
import {
  getLabel,
  MUNICIPALITY_OPTIONS,
  ELECTORAL_DISTRICT_OPTIONS,
  REQUEST_STATUS_OPTIONS,
  REQUEST_CATEGORY_OPTIONS,
  COMMUNICATION_TYPE_OPTIONS,
  MILITARY_TYPE_OPTIONS,
  CONTACT_CATEGORY_OPTIONS,
} from './constants'
import { formatGreekPhone } from './validators'

// Types for extended entities with computed fields
export interface CitizenWithRequests {
  id: string
  surname: string
  first_name: string
  father_name: string | null
  referral_source: string | null
  mobile: string | null
  landline: string | null
  email: string | null
  address: string | null
  postal_code: string | null
  area: string | null
  municipality: string | null
  electoral_district: string | null
  contact_category: string
  profession: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  requests_pending: number
  requests_completed: number
  requests_not_completed: number
  requests_total: number
}

export interface RequestWithCitizen {
  id: string
  citizen_id: string
  category: string
  status: string
  request_text: string | null
  notes: string | null
  submitted_at: string
  completed_at: string | null
  created_at: string
  citizen?: {
    id: string
    surname: string
    first_name: string
    mobile: string | null
    email: string | null
  } | null
}

export interface CommunicationWithCitizen {
  id: string
  citizen_id: string
  communication_date: string
  comm_type: string
  notes: string | null
  created_at: string
  citizen?: {
    id: string
    surname: string
    first_name: string
    mobile: string | null
    email: string | null
  } | null
}

export interface MilitaryWithCitizen {
  id: string
  citizen_id: string | null
  military_type: string
  surname: string
  first_name: string
  father_name: string | null
  mobile: string | null
  email: string | null
  esso_year: number | null
  esso_letter: string | null
  military_number: string | null
  conscript_wish: string | null
  training_center: string | null
  presentation_date: string | null
  assignment: string | null
  assignment_date: string | null
  transfer: string | null
  transfer_date: string | null
  rank: string | null
  service_unit: string | null
  permanent_wish: string | null
  service_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
  requests_pending: number
  requests_completed: number
  requests_not_completed: number
  requests_total: number
}

/**
 * Excel export columns configuration for Citizens
 */
export const citizensExportColumns: ExcelColumn<CitizenWithRequests>[] = [
  { header: 'Επίθετο', key: 'surname', width: 18 },
  { header: 'Όνομα', key: 'first_name', width: 15 },
  { header: 'Πατρώνυμο', key: 'father_name', width: 15 },
  {
    header: 'Κινητό',
    key: (c) => formatGreekPhone(c.mobile),
    width: 15,
  },
  {
    header: 'Σταθερό',
    key: (c) => formatGreekPhone(c.landline),
    width: 15,
  },
  { header: 'Email', key: 'email', width: 25 },
  { header: 'Διεύθυνση', key: 'address', width: 30 },
  { header: 'Τ.Κ.', key: 'postal_code', width: 8 },
  { header: 'Περιοχή', key: 'area', width: 15 },
  {
    header: 'Δήμος',
    key: (c) => getLabel(MUNICIPALITY_OPTIONS, c.municipality),
    width: 18,
  },
  {
    header: 'Εκλ. Περιφέρεια',
    key: (c) => getLabel(ELECTORAL_DISTRICT_OPTIONS, c.electoral_district),
    width: 18,
  },
  {
    header: 'Κατηγορία Επαφής',
    key: (c) => getLabel(CONTACT_CATEGORY_OPTIONS, c.contact_category),
    width: 18,
  },
  { header: 'Ιδιότητα', key: 'profession', width: 20 },
  { header: 'Σύσταση από', key: 'referral_source', width: 20 },
  { header: 'Εκκρεμή Αιτ.', key: 'requests_pending', width: 12 },
  { header: 'Ολοκλ. Αιτ.', key: 'requests_completed', width: 12 },
  { header: 'Σύνολο Αιτ.', key: 'requests_total', width: 12 },
  {
    header: 'Ενεργός',
    key: (c) => formatBooleanForExcel(c.is_active),
    width: 10,
  },
  { header: 'Παρατηρήσεις', key: 'notes', width: 40 },
  {
    header: 'Ημ/νία Δημιουργίας',
    key: (c) => formatDateForExcel(c.created_at),
    width: 15,
  },
]

/**
 * Excel export columns configuration for Requests
 */
export const requestsExportColumns: ExcelColumn<RequestWithCitizen>[] = [
  {
    header: 'Πολίτης',
    key: (r) => r.citizen ? `${r.citizen.surname} ${r.citizen.first_name}` : '-',
    width: 25,
  },
  {
    header: 'Κινητό Πολίτη',
    key: (r) => formatGreekPhone(r.citizen?.mobile),
    width: 15,
  },
  {
    header: 'Email Πολίτη',
    key: (r) => r.citizen?.email || '-',
    width: 25,
  },
  {
    header: 'Κατηγορία',
    key: (r) => getLabel(REQUEST_CATEGORY_OPTIONS, r.category),
    width: 18,
  },
  {
    header: 'Κατάσταση',
    key: (r) => getLabel(REQUEST_STATUS_OPTIONS, r.status),
    width: 15,
  },
  { header: 'Κείμενο Αιτήματος', key: 'request_text', width: 50 },
  {
    header: 'Ημ/νία Υποβολής',
    key: (r) => formatDateForExcel(r.submitted_at),
    width: 15,
  },
  {
    header: 'Ημ/νία Ολοκλήρωσης',
    key: (r) => formatDateForExcel(r.completed_at),
    width: 18,
  },
  { header: 'Σημειώσεις', key: 'notes', width: 40 },
]

/**
 * Excel export columns configuration for Communications
 */
export const communicationsExportColumns: ExcelColumn<CommunicationWithCitizen>[] = [
  {
    header: 'Πολίτης',
    key: (c) => c.citizen ? `${c.citizen.surname} ${c.citizen.first_name}` : '-',
    width: 25,
  },
  {
    header: 'Κινητό Πολίτη',
    key: (c) => formatGreekPhone(c.citizen?.mobile),
    width: 15,
  },
  {
    header: 'Email Πολίτη',
    key: (c) => c.citizen?.email || '-',
    width: 25,
  },
  {
    header: 'Τύπος Επικοινωνίας',
    key: (c) => getLabel(COMMUNICATION_TYPE_OPTIONS, c.comm_type),
    width: 18,
  },
  {
    header: 'Ημ/νία Επικοινωνίας',
    key: (c) => formatDateForExcel(c.communication_date),
    width: 18,
  },
  { header: 'Σημειώσεις', key: 'notes', width: 50 },
  {
    header: 'Ημ/νία Καταχώρησης',
    key: (c) => formatDateForExcel(c.created_at),
    width: 18,
  },
]

/**
 * Excel export columns configuration for Military Personnel
 */
export const militaryExportColumns: ExcelColumn<MilitaryWithCitizen>[] = [
  {
    header: 'Τύπος',
    key: (m) => getLabel(MILITARY_TYPE_OPTIONS, m.military_type),
    width: 12,
  },
  { header: 'Επίθετο', key: 'surname', width: 18 },
  { header: 'Όνομα', key: 'first_name', width: 15 },
  { header: 'Πατρώνυμο', key: 'father_name', width: 15 },
  {
    header: 'Κινητό',
    key: (m) => formatGreekPhone(m.mobile),
    width: 15,
  },
  { header: 'Email', key: 'email', width: 25 },
  {
    header: 'ΕΣΣΟ',
    key: (m) => m.esso_year && m.esso_letter ? `${m.esso_year}${m.esso_letter}` : '-',
    width: 10,
  },
  { header: 'ΑΣΜ', key: 'military_number', width: 12 },
  { header: 'Κέντρο Εκπ.', key: 'training_center', width: 18 },
  {
    header: 'Ημ/νία Παρουσ.',
    key: (m) => formatDateForExcel(m.presentation_date),
    width: 15,
  },
  { header: 'Τοποθέτηση', key: 'assignment', width: 20 },
  {
    header: 'Ημ/νία Τοποθ.',
    key: (m) => formatDateForExcel(m.assignment_date),
    width: 15,
  },
  { header: 'Μετάθεση', key: 'transfer', width: 20 },
  {
    header: 'Ημ/νία Μετάθ.',
    key: (m) => formatDateForExcel(m.transfer_date),
    width: 15,
  },
  { header: 'Επιθυμία Στρατ.', key: 'conscript_wish', width: 25 },
  { header: 'Βαθμός', key: 'rank', width: 15 },
  { header: 'Μονάδα', key: 'service_unit', width: 20 },
  { header: 'ΑΜ', key: 'service_number', width: 12 },
  { header: 'Επιθυμία Μόνιμου', key: 'permanent_wish', width: 25 },
  { header: 'Εκκρεμή Αιτ.', key: 'requests_pending', width: 12 },
  { header: 'Ολοκλ. Αιτ.', key: 'requests_completed', width: 12 },
  { header: 'Σύνολο Αιτ.', key: 'requests_total', width: 12 },
  { header: 'Σημειώσεις', key: 'notes', width: 40 },
  {
    header: 'Ημ/νία Δημιουργίας',
    key: (m) => formatDateForExcel(m.created_at),
    width: 15,
  },
]
