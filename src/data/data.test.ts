import { beforeEach, describe, expect, it } from 'vitest'
import { addDays, dateKey } from '@/lib/dates'
import { createSeed, MISMATCH_DAYS_AGO } from './seed'
import { lastTransaction, payoutForDate, reconcile, reportForDate, todayTotal, todayTransactions, transactionsForDate } from './selectors'
import { loadState, reducer, saveState, STORAGE_KEY } from './storeCore'

const NOW = new Date(2026, 9, 26, 14, 30)

describe('seed', () => {
  it('is relative to the given date', () => {
    const a = createSeed(NOW)
    const later = new Date(2027, 2, 3, 14, 30)
    const b = createSeed(later)
    expect(a.seededOn).toBe('2026-10-26')
    expect(b.seededOn).toBe('2027-03-03')
    expect(todayTransactions(b, later).length).toBeGreaterThan(0)
    const oldest = a.transactions.map((t) => t.createdAt).sort()[0]
    expect(dateKey(new Date(oldest))).toBe(dateKey(addDays(NOW, -14)))
  })
  it('puts every payment today before now', () => {
    const early = new Date(2026, 9, 26, 0, 30)
    for (const n of [NOW, early]) {
      for (const t of todayTransactions(createSeed(n), n)) expect(new Date(t.createdAt).getTime()).toBeLessThanOrEqual(n.getTime())
    }
  })
  it('has exactly one mismatch day, 3 days ago, $5 short', () => {
    const s = createSeed(NOW)
    const bad = s.payouts.filter((p) => p.status === 'not_matched')
    expect(bad).toHaveLength(1)
    expect(bad[0].date).toBe(dateKey(addDays(NOW, -MISMATCH_DAYS_AGO)))
    expect(bad[0].expected - bad[0].received!).toBe(5)
  })
  it('uses the persona ids', () => {
    const m = createSeed(NOW).merchant
    expect([m.id, m.deviceId, m.name]).toEqual(['HP-M-88392', 'HP-D-0417', 'Ah Seng Minimart'])
  })
})

describe('selectors (P1-1)', () => {
  const s = createSeed(NOW)
  it('todayTotal and lastTransaction', () => {
    expect(todayTotal(s, NOW)).toBe(75)
    expect(lastTransaction(s, NOW)?.amount).toBe(15)
    expect(payoutForDate(s, dateKey(NOW))?.expected).toBe(75)
  })
  it('lists newest first and Home total equals report total', () => {
    const list = transactionsForDate(s, dateKey(NOW))
    expect(list[0].id).toBe(lastTransaction(s, NOW)!.id)
    expect(reportForDate(s, dateKey(NOW)).total).toBe(todayTotal(s, NOW))
  })
  it('has no last transaction when empty', () => {
    expect(lastTransaction({ ...s, transactions: [] }, NOW)).toBeUndefined()
  })
})

describe('reconcile (P1-2)', () => {
  const s = createSeed(NOW)
  it('matched on a normal day', () => {
    expect(reportForDate(s, dateKey(addDays(NOW, -1))).reconciliation.status).toBe('matched')
  })
  it('not matched with $5 gap and the missing payment', () => {
    const r = reportForDate(s, dateKey(addDays(NOW, -3))).reconciliation
    expect(r.status).toBe('not_matched')
    expect(r.gap).toBe(5)
    expect(r.missing.map((t) => t.amount)).toEqual([5])
  })
  it('pending for tonight', () => {
    expect(reportForDate(s, dateKey(NOW)).reconciliation.status).toBe('pending')
    expect(reconcile(undefined, []).status).toBe('pending')
  })
})

describe('store persistence (P1-5)', () => {
  beforeEach(() => localStorage.clear())
  it('saves to heartpay:v1 and loads it back', () => {
    const s = reducer(createSeed(NOW), { type: 'setSettings', settings: { soundOn: false } })
    saveState(s)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(loadState(NOW).settings.soundOn).toBe(false)
  })
  it('reset restores the seed', () => {
    const seed = createSeed(NOW)
    const changed = reducer(seed, { type: 'markAllRead' })
    expect(reducer(changed, { type: 'reset', state: seed })).toEqual(seed)
  })
  it('re-seeds on a new day and on corrupt data', () => {
    saveState(createSeed(NOW))
    expect(loadState(addDays(NOW, 1)).seededOn).toBe('2026-10-27')
    localStorage.setItem(STORAGE_KEY, '{nope')
    expect(loadState(NOW).seededOn).toBe('2026-10-26')
  })
  it('addTransaction updates the scheduled payout', () => {
    const s = createSeed(NOW)
    const tx = { ...s.transactions[0], id: 'TX-new', amount: 10 }
    const next = reducer(s, { type: 'addTransaction', transaction: tx })
    expect(todayTotal(next, NOW)).toBe(85)
    expect(payoutForDate(next, dateKey(NOW))?.expected).toBe(85)
  })
})
