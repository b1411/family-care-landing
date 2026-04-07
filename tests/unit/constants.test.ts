import { describe, it, expect } from 'vitest'
import {
  FAMILY_ROLES,
  STAFF_ROLES,
  ROUTE_ROLE_MAP,
  ROLE_HOME_MAP,
  KZ_VACCINATION_CALENDAR,
  EPDS_QUESTIONS,
} from '~/utils/constants'
import type { UserRole } from '~/types/database'

describe('Role constants', () => {
  it('family roles include mother and father', () => {
    expect(FAMILY_ROLES).toContain('mother')
    expect(FAMILY_ROLES).toContain('father')
  })

  it('staff roles do not include family roles', () => {
    for (const role of FAMILY_ROLES) {
      expect(STAFF_ROLES).not.toContain(role)
    }
  })

  it('every role has a home route', () => {
    const allRoles: UserRole[] = [...FAMILY_ROLES, ...STAFF_ROLES]
    for (const role of allRoles) {
      expect(ROLE_HOME_MAP[role]).toBeDefined()
      expect(ROLE_HOME_MAP[role].startsWith('/')).toBe(true)
    }
  })

  it('route role map covers all app prefixes', () => {
    expect(ROUTE_ROLE_MAP['/family']).toBeDefined()
    expect(ROUTE_ROLE_MAP['/coordinator']).toBeDefined()
    expect(ROUTE_ROLE_MAP['/doctor']).toBeDefined()
    expect(ROUTE_ROLE_MAP['/admin']).toBeDefined()
  })
})

describe('KZ Vaccination Calendar', () => {
  it('has at least 10 entries', () => {
    expect(KZ_VACCINATION_CALENDAR.length).toBeGreaterThanOrEqual(10)
  })

  it('includes BCG for day 1', () => {
    const bcg = KZ_VACCINATION_CALENDAR.find(v => v.vaccine === 'BCG' && v.trigger_day === 1)
    expect(bcg).toBeDefined()
    expect(bcg!.name).toBe('БЦЖ')
  })

  it('all entries have required fields', () => {
    for (const entry of KZ_VACCINATION_CALENDAR) {
      expect(entry.vaccine).toBeTruthy()
      expect(typeof entry.dose).toBe('number')
      expect(typeof entry.trigger_day).toBe('number')
      expect(entry.name).toBeTruthy()
    }
  })
})

describe('EPDS Questions', () => {
  it('has exactly 10 questions', () => {
    expect(EPDS_QUESTIONS).toHaveLength(10)
  })

  it('each question is a non-empty string', () => {
    for (const q of EPDS_QUESTIONS) {
      expect(typeof q).toBe('string')
      expect(q.length).toBeGreaterThan(5)
    }
  })

  it('includes self-harm screening question', () => {
    const hasSelfHarm = EPDS_QUESTIONS.some(q => q.toLowerCase().includes('навредить'))
    expect(hasSelfHarm).toBe(true)
  })
})
