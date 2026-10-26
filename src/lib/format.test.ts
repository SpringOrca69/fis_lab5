import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatTime, LANGS } from './format'

describe('format (P1-3)', () => {
  it('formats SGD in every language', () => {
    for (const l of LANGS) expect(formatCurrency(1234.5, l)).toMatch(/\$\s?1,234\.50/)
  })
  it('formats time per locale', () => {
    const d = new Date(2026, 9, 26, 14, 5)
    expect(formatTime(d, 'en')).toMatch(/2:05\s?pm/i)
    for (const l of LANGS) expect(formatTime(d, l).length).toBeGreaterThan(3)
  })
  it('formats dates, including YYYY-MM-DD keys, differently per locale', () => {
    expect(formatDate('2026-10-26', 'en')).toMatch(/26 Oct 2026/)
    expect(formatDate('2026-10-26', 'zh')).toMatch(/2026/)
    expect(formatDate('2026-10-26', 'zh')).not.toBe(formatDate('2026-10-26', 'en'))
    expect(formatDate('2026-10-26', 'ta')).not.toBe(formatDate('2026-10-26', 'en'))
    expect(formatDate('2026-10-26', 'ms')).toMatch(/2026/)
  })
})
