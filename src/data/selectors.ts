import { dateKey } from '@/lib/dates'
import type { AppState, Payout, Transaction } from './types'

const cents = (n: number) => Math.round(n * 100)
const byNewest = (a: Transaction, b: Transaction) => b.createdAt.localeCompare(a.createdAt)

export function transactionsForDate(state: AppState, key: string): Transaction[] {
  return state.transactions.filter((t) => dateKey(new Date(t.createdAt)) === key).sort(byNewest)
}

export function todayTransactions(state: AppState, now: Date = new Date()): Transaction[] {
  return transactionsForDate(state, dateKey(now))
}

export function todayTotal(state: AppState, now: Date = new Date()): number {
  return todayTransactions(state, now).reduce((s, t) => s + t.amount, 0)
}

/** Newest payment today, or undefined when there are none. */
export function lastTransaction(state: AppState, now: Date = new Date()): Transaction | undefined {
  return todayTransactions(state, now)[0]
}

export function payoutForDate(state: AppState, key: string): Payout | undefined {
  return state.payouts.find((p) => p.date === key)
}

export type ReconcileStatus = 'pending' | 'matched' | 'not_matched'

export interface Reconciliation {
  status: ReconcileStatus
  /** Sum of the payments HeartPay logged for the day. */
  expected: number
  /** What the bank received, if known. */
  received?: number
  /** expected - received, when not matched (positive = short). */
  gap: number
  /** Logged payments that look missing from the payout. */
  missing: Transaction[]
}

/**
 * "Matched" means the amount the bank received equals the sum of the
 * payments HeartPay logged that day. Missing payments are the newest
 * payment equal to the gap, if there is one.
 */
export function reconcile(payout: Payout | undefined, transactions: Transaction[]): Reconciliation {
  const expected = transactions.reduce((s, t) => s + t.amount, 0)
  if (!payout || payout.received === undefined) {
    return { status: 'pending', expected, gap: 0, missing: [] }
  }
  if (cents(payout.received) === cents(expected)) {
    return { status: 'matched', expected, received: payout.received, gap: 0, missing: [] }
  }
  const gap = Math.round((expected - payout.received) * 100) / 100
  const match = [...transactions].sort(byNewest).find((t) => cents(t.amount) === cents(gap))
  return { status: 'not_matched', expected, received: payout.received, gap, missing: match ? [match] : [] }
}

export function reportForDate(state: AppState, key: string) {
  const transactions = transactionsForDate(state, key)
  const payout = payoutForDate(state, key)
  return {
    date: key,
    transactions,
    total: transactions.reduce((s, t) => s + t.amount, 0),
    count: transactions.length,
    payout,
    reconciliation: reconcile(payout, transactions),
  }
}

export function unreadCount(state: AppState): number {
  return state.notifications.filter((n) => !n.read).length
}
