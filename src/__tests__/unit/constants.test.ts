import { describe, it, expect } from 'vitest'
import {
  LABELS,
  MUNICIPALITY_OPTIONS,
  ELECTORAL_DISTRICT_OPTIONS,
  CONTACT_CATEGORY_OPTIONS,
  REQUEST_CATEGORY_OPTIONS,
  REQUEST_STATUS_OPTIONS,
  COMMUNICATION_TYPE_OPTIONS,
  MILITARY_TYPE_OPTIONS,
  ESSO_LETTER_OPTIONS,
  USER_ROLE_OPTIONS,
  getLabel,
  getStatusColor,
} from '@/lib/utils/constants'

describe('LABELS', () => {
  it('should have all required citizen labels', () => {
    expect(LABELS.surname).toBe('Επίθετο')
    expect(LABELS.first_name).toBe('Όνομα')
    expect(LABELS.father_name).toBe('Πατρώνυμο')
    expect(LABELS.mobile).toBe('Κινητό')
    expect(LABELS.landline).toBe('Σταθερό')
    expect(LABELS.email).toBe('Email')
    expect(LABELS.address).toBe('Διεύθυνση')
    expect(LABELS.postal_code).toBe('Τ.Κ.')
  })

  it('should have all required request labels', () => {
    expect(LABELS.category).toBe('Κατηγορία')
    expect(LABELS.status).toBe('Κατάσταση')
    expect(LABELS.request_text).toBe('Κείμενο Αιτήματος')
    expect(LABELS.submitted_at).toBe('Ημ/νία Αποστολής')
    expect(LABELS.completed_at).toBe('Ημ/νία Ολοκλήρωσης')
  })

  it('should have all required military labels', () => {
    expect(LABELS.military_type).toBe('Τύπος')
    expect(LABELS.esso_year).toBe('ΕΣΣΟ Έτος')
    expect(LABELS.esso_letter).toBe('ΕΣΣΟ Γράμμα')
    expect(LABELS.rank).toBe('Βαθμός')
  })
})

describe('Option Arrays', () => {
  describe('MUNICIPALITY_OPTIONS', () => {
    it('should have correct structure', () => {
      expect(MUNICIPALITY_OPTIONS.length).toBeGreaterThan(0)
      MUNICIPALITY_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
        expect(typeof option.value).toBe('string')
        expect(typeof option.label).toBe('string')
      })
    })

    it('should contain Thessaloniki', () => {
      const thessaloniki = MUNICIPALITY_OPTIONS.find(o => o.value === 'THESSALONIKI')
      expect(thessaloniki).toBeDefined()
      expect(thessaloniki?.label).toBe('Θεσσαλονίκη')
    })

    it('should have OTHER option', () => {
      const other = MUNICIPALITY_OPTIONS.find(o => o.value === 'OTHER')
      expect(other).toBeDefined()
    })
  })

  describe('ELECTORAL_DISTRICT_OPTIONS', () => {
    it('should have A and B Thessaloniki', () => {
      const districtA = ELECTORAL_DISTRICT_OPTIONS.find(o => o.value === 'THESSALONIKI_A')
      const districtB = ELECTORAL_DISTRICT_OPTIONS.find(o => o.value === 'THESSALONIKI_B')
      expect(districtA).toBeDefined()
      expect(districtB).toBeDefined()
    })
  })

  describe('REQUEST_CATEGORY_OPTIONS', () => {
    it('should contain all expected categories', () => {
      const categories = REQUEST_CATEGORY_OPTIONS.map(o => o.value)
      expect(categories).toContain('MILITARY')
      expect(categories).toContain('MEDICAL')
      expect(categories).toContain('POLICE')
      expect(categories).toContain('EDUCATION')
      expect(categories).toContain('OTHER')
    })
  })

  describe('REQUEST_STATUS_OPTIONS', () => {
    it('should have three statuses with colors', () => {
      expect(REQUEST_STATUS_OPTIONS).toHaveLength(3)
      REQUEST_STATUS_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('color')
      })
    })

    it('should have correct status values', () => {
      const statuses = REQUEST_STATUS_OPTIONS.map(o => o.value)
      expect(statuses).toContain('COMPLETED')
      expect(statuses).toContain('PENDING')
      expect(statuses).toContain('NOT_COMPLETED')
    })
  })

  describe('COMMUNICATION_TYPE_OPTIONS', () => {
    it('should have phone, email, in-person options', () => {
      const types = COMMUNICATION_TYPE_OPTIONS.map(o => o.value)
      expect(types).toContain('PHONE')
      expect(types).toContain('EMAIL')
      expect(types).toContain('IN_PERSON')
    })
  })

  describe('MILITARY_TYPE_OPTIONS', () => {
    it('should have conscript and permanent', () => {
      expect(MILITARY_TYPE_OPTIONS).toHaveLength(2)
      const types = MILITARY_TYPE_OPTIONS.map(o => o.value)
      expect(types).toContain('CONSCRIPT')
      expect(types).toContain('PERMANENT')
    })
  })

  describe('ESSO_LETTER_OPTIONS', () => {
    it('should have Greek letters Α-Ε', () => {
      expect(ESSO_LETTER_OPTIONS).toHaveLength(5)
      const letters = ESSO_LETTER_OPTIONS.map(o => o.value)
      expect(letters).toEqual(['Α', 'Β', 'Γ', 'Δ', 'Ε'])
    })
  })

  describe('USER_ROLE_OPTIONS', () => {
    it('should have admin roles', () => {
      const roles = USER_ROLE_OPTIONS.map(o => o.value)
      expect(roles).toContain('SUPERADMIN')
      expect(roles).toContain('ADMIN')
      expect(roles).toContain('REGULAR')
    })
  })
})

describe('Helper Functions', () => {
  describe('getLabel', () => {
    it('should return label for valid value', () => {
      expect(getLabel(MUNICIPALITY_OPTIONS, 'THESSALONIKI')).toBe('Θεσσαλονίκη')
      expect(getLabel(REQUEST_STATUS_OPTIONS, 'COMPLETED')).toBe('Ολοκληρωμένο')
    })

    it('should return dash for null/undefined', () => {
      expect(getLabel(MUNICIPALITY_OPTIONS, null)).toBe('-')
      expect(getLabel(MUNICIPALITY_OPTIONS, undefined)).toBe('-')
    })

    it('should return original value if not found', () => {
      expect(getLabel(MUNICIPALITY_OPTIONS, 'UNKNOWN')).toBe('UNKNOWN')
    })
  })

  describe('getStatusColor', () => {
    it('should return correct colors for statuses', () => {
      expect(getStatusColor('COMPLETED')).toBe('success')
      expect(getStatusColor('PENDING')).toBe('warning')
      expect(getStatusColor('NOT_COMPLETED')).toBe('secondary')
    })

    it('should return secondary for unknown status', () => {
      expect(getStatusColor('UNKNOWN')).toBe('secondary')
    })
  })
})
