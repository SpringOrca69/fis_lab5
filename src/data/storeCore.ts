import { dateKey } from '@/lib/dates'
import { createSeed } from './seed'
import type { AmbassadorBooking, AppState, Notification, Settings, Transaction, Voucher } from './types'

export const STORAGE_KEY = 'heartpay:v1'

export type Action =
  | { type: 'reset'; state: AppState }
  | { type: 'addTransaction'; transaction: Transaction }
  | { type: 'redeem'; transaction: Transaction; vouchers: Voucher[] }
  | { type: 'addBooking'; booking: AmbassadorBooking; notification: Notification }
  | { type: 'markAllRead' }
  | { type: 'setSettings'; settings: Partial<Settings> }

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'reset':
      return action.state
    case 'addTransaction': {
      const tx = action.transaction
      return {
        ...state,
        transactions: [...state.transactions, tx],
        // Keep a still-scheduled payout in step with what was logged.
        payouts: state.payouts.map((p) =>
          p.id === tx.payoutId && p.status === 'scheduled' ? { ...p, expected: p.expected + tx.amount } : p,
        ),
      }
    }
    case 'redeem': {
      const next = reducer(state, { type: 'addTransaction', transaction: action.transaction })
      const ids = new Set(action.vouchers.map((v) => v.id))
      return { ...next, vouchers: [...next.vouchers.filter((v) => !ids.has(v.id)), ...action.vouchers] }
    }
    case 'addBooking':
      return {
        ...state,
        bookings: [...state.bookings, action.booking],
        notifications: [action.notification, ...state.notifications],
      }
    case 'markAllRead':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'setSettings':
      return { ...state, settings: { ...state.settings, ...action.settings } }
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage full or blocked: keep running in memory */
  }
}

/** Load saved state; fall back to a fresh seed if missing, corrupt, or from an earlier day. */
export function loadState(now: Date = new Date()): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (
        parsed.version === 1 &&
        parsed.merchant?.acceptedVoucherType && // older saves without a voucher type are re-seeded
        parsed.seededOn === dateKey(now) &&
        Array.isArray(parsed.transactions)
      ) {
        return parsed
      }
    }
  } catch {
    /* fall through to seed */
  }
  return createSeed(now)
}
