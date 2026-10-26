import { describe, expect, it } from 'vitest'
import { bookableDays, validatePhone } from './booking'

describe('booking helpers', () => {
  it('offers the next 7 days, starting tomorrow', () => {
    const days = bookableDays(new Date(2026, 9, 26))
    expect(days).toHaveLength(7)
    expect(days[0]).toBe('2026-10-27')
    expect(days[6]).toBe('2026-11-02')
  })
  it('validates 8 digit phone numbers', () => {
    expect(validatePhone('9000 0000')).toBe(true)
    expect(validatePhone('+65 9000 0000')).toBe(true)
    expect(validatePhone('900')).toBe(false)
    expect(validatePhone('')).toBe(false)
  })
})
