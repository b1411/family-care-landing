import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  childProfileSchema,
  prescriptionSchema,
  moodLogSchema,
} from '~/utils/validators'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'test@mail.com', password: '12345678' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'bad', password: '12345678' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@mail.com', password: '1234' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    firstName: 'Арман',
    lastName: 'Нурмагамбетов',
    email: 'arman@mail.com',
    phone: '+77001234567',
    password: 'securePass1',
    confirmPassword: 'securePass1',
  }

  it('accepts valid data', () => {
    const result = registerSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'different' })
    expect(result.success).toBe(false)
  })

  it('rejects wrong phone format', () => {
    const result = registerSchema.safeParse({ ...valid, phone: '8700123' })
    expect(result.success).toBe(false)
  })

  it('allows empty phone', () => {
    const result = registerSchema.safeParse({ ...valid, phone: '' })
    expect(result.success).toBe(true)
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true)
  })

  it('rejects empty email', () => {
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false)
  })
})

describe('childProfileSchema', () => {
  it('accepts valid child profile', () => {
    const result = childProfileSchema.safeParse({
      name: 'Алия',
      dateOfBirth: '2025-01-15',
      gender: 'female',
      birthWeightG: 3200,
      birthHeightCm: 50,
    })
    expect(result.success).toBe(true)
  })

  it('rejects short name', () => {
    expect(childProfileSchema.safeParse({ name: 'A' }).success).toBe(false)
  })

  it('rejects invalid weight', () => {
    expect(childProfileSchema.safeParse({ name: 'Алия', birthWeightG: 100 }).success).toBe(false)
  })
})

describe('prescriptionSchema', () => {
  it('accepts valid prescription', () => {
    const result = prescriptionSchema.safeParse({
      medication: 'Фолиевая кислота',
      dosage: '400 мкг',
      frequency: 'Ежедневно',
      timesOfDay: ['08:00'],
      startDate: '2025-06-01',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty timesOfDay', () => {
    const result = prescriptionSchema.safeParse({
      medication: 'Test',
      dosage: '10mg',
      frequency: 'Daily',
      timesOfDay: [],
      startDate: '2025-06-01',
    })
    expect(result.success).toBe(false)
  })
})

describe('moodLogSchema', () => {
  it('accepts valid mood', () => {
    expect(moodLogSchema.safeParse({ score: 3, notes: 'Нормально' }).success).toBe(true)
  })

  it('rejects out of range', () => {
    expect(moodLogSchema.safeParse({ score: 0 }).success).toBe(false)
    expect(moodLogSchema.safeParse({ score: 6 }).success).toBe(false)
  })
})
