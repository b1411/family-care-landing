import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
})

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Минимум 2 символа'),
  lastName: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().regex(/^\+7\d{10}$/, 'Формат: +7XXXXXXXXXX').optional().or(z.literal('')),
  password: z.string().min(8, 'Минимум 8 символов'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Введите корректный email'),
})

export const childProfileSchema = z.object({
  name: z.string().min(2, 'Введите имя ребёнка'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  birthWeightG: z.number().min(500).max(6000).optional(),
  birthHeightCm: z.number().min(30).max(65).optional(),
  apgarScore: z.number().min(0).max(10).optional(),
  bloodType: z.string().optional(),
})

export const motherProfileSchema = z.object({
  lmpDate: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
})

export const appointmentSchema = z.object({
  doctorId: z.string().uuid(),
  slotId: z.string().uuid(),
  journeyEventId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
})

export const prescriptionSchema = z.object({
  medication: z.string().min(1, 'Введите название'),
  dosage: z.string().min(1, 'Введите дозировку'),
  frequency: z.string().min(1, 'Укажите частоту'),
  timesOfDay: z.array(z.string()).min(1, 'Укажите время приёма'),
  startDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
})

export const moodLogSchema = z.object({
  score: z.number().min(1).max(5),
  notes: z.string().max(500).optional(),
})

export const feedingLogSchema = z.object({
  type: z.enum(['breast_left', 'breast_right', 'formula', 'solid', 'mixed']),
  details: z.record(z.unknown()).default({}),
})

export const sleepLogSchema = z.object({
  sleepStart: z.string(),
  sleepEnd: z.string(),
  type: z.enum(['night', 'nap']),
  wakeUps: z.number().min(0).default(0),
  notes: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ChildProfileInput = z.infer<typeof childProfileSchema>
export type MotherProfileInput = z.infer<typeof motherProfileSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type PrescriptionInput = z.infer<typeof prescriptionSchema>
export type MoodLogInput = z.infer<typeof moodLogSchema>
export type FeedingLogInput = z.infer<typeof feedingLogSchema>
export type SleepLogInput = z.infer<typeof sleepLogSchema>
