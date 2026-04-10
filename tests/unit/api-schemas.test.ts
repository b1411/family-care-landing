import { describe, it, expect } from 'vitest'

// Test API endpoint validation schemas (extracted logic)
// These test the Zod schemas used in the endpoints

import { z } from 'zod'

// Appointment booking schema (mirrors server/api/appointments/index.post.ts)
const appointmentSchema = z.object({
  doctor_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  notes: z.string().max(500).optional(),
  appointment_type: z.enum(['checkup', 'screening', 'vaccination', 'consultation', 'emergency']).default('checkup'),
})

// Prescription schema (mirrors server/api/prescriptions/index.post.ts)
const prescriptionSchema = z.object({
  family_id: z.string().uuid(),
  child_id: z.string().uuid().optional(),
  medication: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  time_of_day: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1).max(6),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  instructions: z.string().max(500).optional(),
})

// Vaccination schema
const vaccinationSchema = z.object({
  child_id: z.string().uuid(),
  vaccine_name: z.string().min(1).max(200),
  dose_number: z.number().int().min(1).max(10),
  total_doses: z.number().int().min(1).max(10),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  administered_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  batch_number: z.string().max(50).optional(),
})

// Child schema
const childSchema = z.object({
  family_id: z.string().uuid(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().max(100).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['male', 'female']),
  blood_type: z.string().max(10).optional(),
  birth_weight: z.number().min(0.5).max(10).optional(),
  birth_height: z.number().min(20).max(70).optional(),
})

// Profile schema
const profileSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  language: z.enum(['ru', 'kk', 'en']).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: 'At least one field is required' })

// ─── Tests ───

describe('Appointment Schema', () => {
  it('accepts valid appointment', () => {
    const valid = {
      doctor_id: '550e8400-e29b-41d4-a716-446655440000',
      scheduled_at: '2026-04-15T10:00:00.000Z',
      notes: 'Плановый осмотр',
    }
    expect(appointmentSchema.parse(valid)).toBeTruthy()
  })

  it('rejects missing doctor_id', () => {
    expect(() => appointmentSchema.parse({ scheduled_at: '2026-04-15T10:00:00.000Z' })).toThrow()
  })

  it('rejects invalid UUID', () => {
    expect(() =>
      appointmentSchema.parse({ doctor_id: 'not-a-uuid', scheduled_at: '2026-04-15T10:00:00.000Z' }),
    ).toThrow()
  })

  it('uses default appointment_type', () => {
    const result = appointmentSchema.parse({
      doctor_id: '550e8400-e29b-41d4-a716-446655440000',
      scheduled_at: '2026-04-15T10:00:00.000Z',
    })
    expect(result.appointment_type).toBe('checkup')
  })

  it('rejects invalid appointment type', () => {
    expect(() =>
      appointmentSchema.parse({
        doctor_id: '550e8400-e29b-41d4-a716-446655440000',
        scheduled_at: '2026-04-15T10:00:00.000Z',
        appointment_type: 'invalid',
      }),
    ).toThrow()
  })

  it('enforces notes length limit', () => {
    expect(() =>
      appointmentSchema.parse({
        doctor_id: '550e8400-e29b-41d4-a716-446655440000',
        scheduled_at: '2026-04-15T10:00:00.000Z',
        notes: 'a'.repeat(501),
      }),
    ).toThrow()
  })
})

describe('Prescription Schema', () => {
  const validPrescription = {
    family_id: '550e8400-e29b-41d4-a716-446655440000',
    medication: 'Витамин D3',
    dosage: '2000 МЕ',
    frequency: '1 раз в день',
    time_of_day: ['09:00'],
    start_date: '2026-04-01',
  }

  it('accepts valid prescription', () => {
    expect(prescriptionSchema.parse(validPrescription)).toBeTruthy()
  })

  it('accepts multiple times', () => {
    const multi = { ...validPrescription, time_of_day: ['08:00', '20:00'] }
    expect(prescriptionSchema.parse(multi)).toBeTruthy()
  })

  it('rejects empty medication', () => {
    expect(() => prescriptionSchema.parse({ ...validPrescription, medication: '' })).toThrow()
  })

  it('rejects invalid time format', () => {
    expect(() => prescriptionSchema.parse({ ...validPrescription, time_of_day: ['9 AM'] })).toThrow()
  })

  it('rejects empty time_of_day array', () => {
    expect(() => prescriptionSchema.parse({ ...validPrescription, time_of_day: [] })).toThrow()
  })

  it('rejects invalid date format', () => {
    expect(() => prescriptionSchema.parse({ ...validPrescription, start_date: '04/01/2026' })).toThrow()
  })

  it('rejects > 6 doses per day', () => {
    expect(() =>
      prescriptionSchema.parse({
        ...validPrescription,
        time_of_day: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      }),
    ).toThrow()
  })
})

describe('Vaccination Schema', () => {
  const valid = {
    child_id: '550e8400-e29b-41d4-a716-446655440000',
    vaccine_name: 'BCG',
    dose_number: 1,
    total_doses: 1,
    scheduled_date: '2026-01-15',
  }

  it('accepts valid vaccination', () => {
    expect(vaccinationSchema.parse(valid)).toBeTruthy()
  })

  it('rejects dose_number 0', () => {
    expect(() => vaccinationSchema.parse({ ...valid, dose_number: 0 })).toThrow()
  })

  it('rejects dose_number > 10', () => {
    expect(() => vaccinationSchema.parse({ ...valid, dose_number: 11 })).toThrow()
  })

  it('accepts optional administered_date', () => {
    const result = vaccinationSchema.parse({ ...valid, administered_date: '2026-01-15' })
    expect(result.administered_date).toBe('2026-01-15')
  })
})

describe('Child Schema', () => {
  const valid = {
    family_id: '550e8400-e29b-41d4-a716-446655440000',
    first_name: 'Амира',
    birth_date: '2026-01-15',
    gender: 'female' as const,
  }

  it('accepts valid child', () => {
    expect(childSchema.parse(valid)).toBeTruthy()
  })

  it('rejects missing first_name', () => {
    expect(() => childSchema.parse({ ...valid, first_name: '' })).toThrow()
  })

  it('rejects invalid gender', () => {
    expect(() => childSchema.parse({ ...valid, gender: 'other' })).toThrow()
  })

  it('rejects unrealistic birth weight', () => {
    expect(() => childSchema.parse({ ...valid, birth_weight: 0.1 })).toThrow()
    expect(() => childSchema.parse({ ...valid, birth_weight: 15 })).toThrow()
  })

  it('accepts optional fields', () => {
    const result = childSchema.parse({ ...valid, blood_type: 'A+', birth_weight: 3.5 })
    expect(result.blood_type).toBe('A+')
    expect(result.birth_weight).toBe(3.5)
  })
})

describe('Profile Schema', () => {
  it('accepts partial update', () => {
    expect(profileSchema.parse({ first_name: 'Айгерим' })).toBeTruthy()
  })

  it('rejects empty update', () => {
    expect(() => profileSchema.parse({})).toThrow(/At least one field/)
  })

  it('validates language enum', () => {
    expect(() => profileSchema.parse({ language: 'fr' })).toThrow()
    expect(profileSchema.parse({ language: 'kk' })).toBeTruthy()
  })
})
