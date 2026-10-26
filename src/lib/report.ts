import type { Payout, Transaction } from '@/data/types'
import { addDays, dateKey, startOfDay } from './dates'

export type Period = 'all' | 'morning' | 'afternoon' | 'evening'
export const PERIODS: readonly Period[] = ['all', 'morning', 'afternoon', 'evening']

/** Rows shown before "Show all". */
export const COLLAPSED_ROWS = 5
/** How many days back the report and date picker reach. */
export const REPORT_DAYS = 14

/** Morning is before 12:00, afternoon 12:00 to 16:59, evening from 17:00. */
export function periodOf(iso: string): Exclude<Period, 'all'> {
  const h = new Date(iso).getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export function filterByPeriod(txs: Transaction[], period: Period): Transaction[] {
  return period === 'all' ? txs : txs.filter((t) => periodOf(t.createdAt) === period)
}

/** Today first, then back REPORT_DAYS days. */
export function reportDateKeys(now: Date = new Date()): string[] {
  const today = startOfDay(now)
  return Array.from({ length: REPORT_DAYS + 1 }, (_, i) => dateKey(addDays(today, -i)))
}

export function isReportDate(key: string | undefined, now: Date = new Date()): key is string {
  return !!key && reportDateKeys(now).includes(key)
}

export type PayoutBadge = 'scheduled' | 'matched' | 'not_matched' | 'paid'
export const payoutBadge = (p: Payout): PayoutBadge => p.status

const csvCell = (v: string | number) => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}
const pad = (n: number) => String(n).padStart(2, '0')

/** Locale-neutral CSV (ISO date, 24h time, plain amounts) so spreadsheets and POS tools can read it. */
export function buildCsv(txs: Transaction[]): string {
  const rows = txs.map((t) => {
    const d = new Date(t.createdAt)
    return [dateKey(d), `${pad(d.getHours())}:${pad(d.getMinutes())}`, t.id, t.amount.toFixed(2)]
  })
  return [['Date', 'Time', 'Payment number', 'Amount (SGD)'], ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

export const csvFileName = (key: string) => `heartpay-report-${key}.csv`
