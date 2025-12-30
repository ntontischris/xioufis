import { describe, it, expect } from 'vitest'
import {
  validateGreekPhone,
  formatGreekPhone,
  citizenSchema,
  requestSchema,
  communicationSchema,
  militarySchema,
  GREEK_PHONE_REGEX,
  GREEK_POSTAL_CODE_REGEX,
} from '@/lib/utils/validators'

describe('Greek Phone Validation', () => {
  describe('GREEK_PHONE_REGEX', () => {
    it('should match valid Greek mobile numbers', () => {
      expect(GREEK_PHONE_REGEX.test('6971234567')).toBe(true)
      expect(GREEK_PHONE_REGEX.test('6901234567')).toBe(true)
      expect(GREEK_PHONE_REGEX.test('+306971234567')).toBe(true)
    })

    it('should match valid Greek landline numbers', () => {
      expect(GREEK_PHONE_REGEX.test('2310123456')).toBe(true)
      expect(GREEK_PHONE_REGEX.test('2101234567')).toBe(true)
      expect(GREEK_PHONE_REGEX.test('+302310123456')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(GREEK_PHONE_REGEX.test('123456789')).toBe(false) // Too short
      expect(GREEK_PHONE_REGEX.test('12345678901')).toBe(false) // Too long
      expect(GREEK_PHONE_REGEX.test('0123456789')).toBe(false) // Starts with 0
      expect(GREEK_PHONE_REGEX.test('1234567890')).toBe(false) // Starts with 1
      expect(GREEK_PHONE_REGEX.test('+316971234567')).toBe(false) // Wrong country code
    })
  })

  describe('validateGreekPhone', () => {
    it('should return true for empty/null values (optional field)', () => {
      expect(validateGreekPhone('')).toBe(true)
    })

    it('should return true for valid phone numbers', () => {
      expect(validateGreekPhone('6971234567')).toBe(true)
      expect(validateGreekPhone('697 123 4567')).toBe(true) // With spaces
      expect(validateGreekPhone('+30 697 123 4567')).toBe(true)
    })

    it('should return false for invalid phone numbers', () => {
      expect(validateGreekPhone('123')).toBe(false)
      expect(validateGreekPhone('abcdefghij')).toBe(false)
    })
  })

  describe('formatGreekPhone', () => {
    it('should format 10-digit numbers correctly', () => {
      expect(formatGreekPhone('6971234567')).toBe('697 123 4567')
    })

    it('should format numbers with +30 correctly', () => {
      expect(formatGreekPhone('306971234567')).toBe('+30 697 123 4567')
    })

    it('should return dash for null/undefined', () => {
      expect(formatGreekPhone(null)).toBe('-')
      expect(formatGreekPhone(undefined)).toBe('-')
    })

    it('should return original if format unknown', () => {
      expect(formatGreekPhone('12345')).toBe('12345')
    })
  })
})

describe('Greek Postal Code Validation', () => {
  it('should match valid postal codes', () => {
    expect(GREEK_POSTAL_CODE_REGEX.test('54622')).toBe(true)
    expect(GREEK_POSTAL_CODE_REGEX.test('10431')).toBe(true)
    expect(GREEK_POSTAL_CODE_REGEX.test('00000')).toBe(true)
  })

  it('should reject invalid postal codes', () => {
    expect(GREEK_POSTAL_CODE_REGEX.test('5462')).toBe(false) // 4 digits
    expect(GREEK_POSTAL_CODE_REGEX.test('546221')).toBe(false) // 6 digits
    expect(GREEK_POSTAL_CODE_REGEX.test('5462a')).toBe(false) // Contains letter
  })
})

describe('Citizen Schema Validation', () => {
  const validCitizen = {
    surname: 'Παπαδόπουλος',
    first_name: 'Γιώργος',
    mobile: '6971234567',
    contact_category: 'GDPR',
  }

  it('should validate a correct citizen', () => {
    const result = citizenSchema.safeParse(validCitizen)
    expect(result.success).toBe(true)
  })

  it('should require surname', () => {
    const result = citizenSchema.safeParse({ ...validCitizen, surname: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('surname')
    }
  })

  it('should require first_name', () => {
    const result = citizenSchema.safeParse({ ...validCitizen, first_name: '' })
    expect(result.success).toBe(false)
  })

  it('should require at least one contact method', () => {
    const result = citizenSchema.safeParse({
      surname: 'Παπαδόπουλος',
      first_name: 'Γιώργος',
      mobile: '',
      landline: '',
      email: '',
    })
    expect(result.success).toBe(false)
  })

  it('should validate email format', () => {
    const result = citizenSchema.safeParse({
      ...validCitizen,
      mobile: '',
      email: 'invalid-email',
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid email as contact', () => {
    const result = citizenSchema.safeParse({
      surname: 'Παπαδόπουλος',
      first_name: 'Γιώργος',
      email: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('should validate postal code format', () => {
    const result = citizenSchema.safeParse({
      ...validCitizen,
      postal_code: '123', // Invalid
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid postal code', () => {
    const result = citizenSchema.safeParse({
      ...validCitizen,
      postal_code: '54622',
    })
    expect(result.success).toBe(true)
  })
})

describe('Request Schema Validation', () => {
  const validRequest = {
    citizen_id: '123e4567-e89b-12d3-a456-426614174000',
    category: 'MILITARY',
    status: 'PENDING',
  }

  it('should validate a correct request', () => {
    const result = requestSchema.safeParse(validRequest)
    expect(result.success).toBe(true)
  })

  it('should require citizen_id to be UUID', () => {
    const result = requestSchema.safeParse({ ...validRequest, citizen_id: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('should require category', () => {
    const result = requestSchema.safeParse({ ...validRequest, category: '' })
    expect(result.success).toBe(false)
  })

  it('should default status to PENDING', () => {
    const result = requestSchema.safeParse({
      citizen_id: '123e4567-e89b-12d3-a456-426614174000',
      category: 'MILITARY',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('PENDING')
    }
  })
})

describe('Communication Schema Validation', () => {
  const validCommunication = {
    citizen_id: '123e4567-e89b-12d3-a456-426614174000',
    communication_date: '2024-01-15',
    comm_type: 'PHONE',
  }

  it('should validate a correct communication', () => {
    const result = communicationSchema.safeParse(validCommunication)
    expect(result.success).toBe(true)
  })

  it('should require comm_type', () => {
    const result = communicationSchema.safeParse({ ...validCommunication, comm_type: '' })
    expect(result.success).toBe(false)
  })
})

describe('Military Schema Validation', () => {
  const validMilitary = {
    military_type: 'CONSCRIPT',
    surname: 'Παπαδόπουλος',
    first_name: 'Γιώργος',
    mobile: '6971234567',
  }

  it('should validate a correct military record', () => {
    const result = militarySchema.safeParse(validMilitary)
    expect(result.success).toBe(true)
  })

  it('should require at least mobile or email', () => {
    const result = militarySchema.safeParse({
      military_type: 'CONSCRIPT',
      surname: 'Παπαδόπουλος',
      first_name: 'Γιώργος',
    })
    expect(result.success).toBe(false)
  })

  it('should accept email as alternative contact', () => {
    const result = militarySchema.safeParse({
      military_type: 'CONSCRIPT',
      surname: 'Παπαδόπουλος',
      first_name: 'Γιώργος',
      email: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })
})
