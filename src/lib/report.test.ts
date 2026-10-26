import { describe, expect, it } from 'vitest'
import { createSeed } from '@/data/seed'
import { transactionsForDate } from '@/data/selectors'
import type { Transaction } from '@/data/types'
import { dateKey } from './dates'
import { buildCsv, csvFileName, filterByPeriod, isReportDate, periodOf, reportDateKeys } from './report'

const NOW = new Date(2026, 9, 26, 15, 0, 0)
const tx = (id: string, h: number, m: number, amount: number): Transaction => ({
  id,
  voucherIds: [],
  amount,
  createdAt: new Date(2026, 9, 20, h, m).toISOString(),
  status: 'confirmed',
  payoutId: 'P',
})

describe('periods', () => {
  it('splits at 12:00 and 17:00', () => {
    expect(periodOf(tx('a', 11, 59, 1).createdAt)).toBe('morning')
    expect(periodOf(tx('a', 12, 0, 1).createdAt)).toBe('afternoon')
    expect(periodOf(tx('a', 16, 59, 1).createdAt)).toBe('afternoon')
    expect(periodOf(tx('a', 17, 0, 1).createdAt)).toBe('evening')
  })
  it('filters and keeps order', () => {
    const list = [tx('c', 18, 0, 5), tx('b', 13, 0, 5), tx('a', 9, 0, 5)]
    expect(filterByPeriod(list, 'all')).toHaveLength(3)
    expect(filterByPeriod(list, 'morning').map((t) => t.id)).toEqual(['a'])
    expect(filterByPeriod(list, 'evening').map((t) => t.id)).toEqual(['c'])
  })
})

describe('report dates', () => {
  it('allows today and 14 days back only', () => {
    const keys = reportDateKeys(NOW)
    expect(keys).toHaveLength(15)
    expect(keys[0]).toBe(dateKey(NOW))
    expect(isReportDate(keys[14], NOW)).toBe(true)
    expect(isReportDate('2026-10-11', NOW)).toBe(false)
    expect(isReportDate('2026-10-27', NOW)).toBe(false)
    expect(isReportDate(undefined, NOW)).toBe(false)
  })
})

describe('buildCsv', () => {
  it('has a header and one row per displayed payment', () => {
    const csv = buildCsv([tx('TX-1', 9, 5, 15), tx('TX-2', 14, 30, 7.5)])
    expect(csv.trim().split('\r\n')).toEqual([
      'Date,Time,Payment number,Amount (SGD)',
      '2026-10-20,09:05,TX-1,15.00',
      '2026-10-20,14:30,TX-2,7.50',
    ])
  })
  it('matches the seeded day list', () => {
    const seed = createSeed(NOW)
    const list = transactionsForDate(seed, dateKey(NOW))
    expect(buildCsv(list).trim().split('\r\n')).toHaveLength(list.length + 1)
  })
  it('names the file by date', () => expect(csvFileName('2026-10-26')).toBe('heartpay-report-2026-10-26.csv'))
})
