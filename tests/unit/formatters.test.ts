import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatAge,
  formatGestationalWeek,
  calculateEDD,
  formatCurrency,
  formatPercent,
  formatPhone,
  truncate,
} from '~/utils/formatters'

describe('formatCurrency', () => {
  it('formats tenge by default', () => {
    const result = formatCurrency(12500)
    expect(result).toContain('12')
    expect(result).toContain('500')
    expect(result).toContain('₸')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('0')
    expect(formatCurrency(0)).toContain('₸')
  })

  it('supports custom currency', () => {
    expect(formatCurrency(100, '$')).toContain('100')
    expect(formatCurrency(100, '$')).toContain('$')
  })

  it('formats large numbers with grouping', () => {
    const result = formatCurrency(1234567)
    expect(result).toContain('₸')
    // Intl.NumberFormat uses locale-specific grouping separators
    expect(result.replace(/\s/g, '')).toBe('1234567₸')
  })
})

describe('formatPercent', () => {
  it('formats without decimals by default', () => {
    expect(formatPercent(85)).toBe('85%')
  })

  it('formats with decimals', () => {
    expect(formatPercent(85.678, 1)).toBe('85.7%')
  })
})

describe('formatPhone', () => {
  it('formats +7 phone numbers', () => {
    expect(formatPhone('+77001234567')).toBe('+7 (700) 123-45-67')
    expect(formatPhone('77001234567')).toBe('+7 (700) 123-45-67')
  })

  it('returns original for non-standard phones', () => {
    expect(formatPhone('12345')).toBe('12345')
  })
})

describe('truncate', () => {
  it('returns short strings unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates long strings with ellipsis', () => {
    expect(truncate('hello world foo bar', 10)).toBe('hello w...')
  })

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})

describe('formatAge', () => {
  it('formats age in days for newborns', () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    expect(formatAge(twoDaysAgo)).toBe('2 дн')
  })

  it('formats age in months', () => {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const result = formatAge(threeMonthsAgo)
    expect(result).toContain('3 мес')
  })

  it('formats age in years and months', () => {
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    twoYearsAgo.setMonth(twoYearsAgo.getMonth() - 3)
    const result = formatAge(twoYearsAgo)
    expect(result).toContain('г')
  })
})

describe('formatGestationalWeek', () => {
  it('calculates weeks and days from LMP', () => {
    const lmp = new Date()
    lmp.setDate(lmp.getDate() - 71) // 10 weeks 1 day
    expect(formatGestationalWeek(lmp)).toBe('10 нед 1 дн')
  })
})

describe('calculateEDD', () => {
  it('adds 280 days to LMP', () => {
    const result = calculateEDD('2025-01-01')
    expect(result).toBe('2025-10-08')
  })
})

describe('formatDate', () => {
  it('formats date in Russian', () => {
    const result = formatDate('2025-06-15')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })
})
