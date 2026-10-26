import { addDays, dateKey, startOfDay } from '@/lib/dates'
import type { AppState, Payout, Transaction } from './types'

export const MISMATCH_DAYS_AGO = 3
export const MISMATCH_GAP = 5
export const HISTORY_DAYS = 14
/** Already used in the mock redemption store; the "Already used" demo QR points at it. */
export const DEMO_USED_VOUCHER_ID = 'CDC-DEMO-SPENT-0001'

/** Minutes before "now" for today's payments, newest first. */
const TODAY: { minsAgo: number; amount: number }[] = [
  { minsAgo: 22, amount: 15 },
  { minsAgo: 55, amount: 10 },
  { minsAgo: 105, amount: 25 },
  { minsAgo: 150, amount: 5 },
  { minsAgo: 200, amount: 20 },
]

/** Past-day payment amounts, indexed by days ago (1..14). Day 3 is the mismatch day. */
const PAST: Record<number, number[]> = {
  1: [15, 10, 25],
  2: [5, 20, 10, 15],
  3: [20, 5, 15, 10],
  4: [10, 10],
  5: [25, 5, 15, 10],
  6: [20, 15],
  7: [10, 5, 5, 20, 15],
  8: [15, 15, 10],
  9: [5, 25],
  10: [10, 20, 5, 10],
  11: [15, 5],
  12: [30, 10, 5],
  13: [10, 10, 20],
  14: [5, 15, 10, 25],
}
const PAST_TIMES: [number, number][] = [
  [9, 40],
  [11, 15],
  [13, 5],
  [15, 30],
  [18, 20],
]

function splitVouchers(amount: number): number[] {
  const tens = Math.floor(amount / 10)
  const out = Array<number>(tens).fill(10)
  if (amount % 10) out.push(5)
  return out
}

function makeTx(createdAt: Date, amount: number, key: string, n: number): Transaction {
  const stamp = key.replaceAll('-', '')
  return {
    id: `TX-${stamp}-${n + 1}`,
    voucherIds: splitVouchers(amount).map((_, k) => `CDC-${stamp}-${n + 1}${k + 1}`),
    amount,
    createdAt: createdAt.toISOString(),
    status: 'confirmed',
    payoutId: `PO-${stamp}`,
  }
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** Build the demo data set relative to `now`, so dates never go stale. */
export function createSeed(now: Date = new Date()): AppState {
  const today = startOfDay(now)
  const todayKey = dateKey(now)
  const transactions: Transaction[] = []
  const payouts: Payout[] = []

  // Today: clamp so everything falls on today, before now, and stays newest-first.
  TODAY.forEach((p, i) => {
    const floor = new Date(today.getTime() + (TODAY.length - i) * 60_000)
    const at = new Date(Math.min(now.getTime(), Math.max(now.getTime() - p.minsAgo * 60_000, floor.getTime())))
    transactions.push(makeTx(at, p.amount, todayKey, TODAY.length - 1 - i))
  })
  payouts.push({
    id: `PO-${todayKey.replaceAll('-', '')}`,
    date: todayKey,
    expected: sum(TODAY.map((p) => p.amount)),
    status: 'scheduled',
  })

  for (let d = 1; d <= HISTORY_DAYS; d++) {
    const day = addDays(today, -d)
    const key = dateKey(day)
    const amounts = PAST[d]
    amounts.forEach((amount, i) => {
      const [h, m] = PAST_TIMES[i]
      transactions.push(makeTx(new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m), amount, key, i))
    })
    const total = sum(amounts)
    const mismatch = d === MISMATCH_DAYS_AGO
    payouts.push({
      id: `PO-${key.replaceAll('-', '')}`,
      date: key,
      expected: total,
      received: mismatch ? total - MISMATCH_GAP : total,
      status: mismatch ? 'not_matched' : 'matched',
    })
  }

  const yesterdayKey = dateKey(addDays(today, -1))
  const mismatchKey = dateKey(addDays(today, -MISMATCH_DAYS_AGO))
  return {
    version: 1,
    seededOn: todayKey,
    merchant: {
      id: 'HP-M-88392',
      deviceId: 'HP-D-0417',
      name: 'Ah Seng Minimart',
      address: 'Blk 123 Toa Payoh Lor 4',
      bankLast4: '1234',
      acceptedVoucherType: 'supermarket',
    },
    transactions,
    payouts,
    // One voucher already used, so the "Already used" demo code is decided by the store.
    vouchers: [
      {
        id: DEMO_USED_VOUCHER_ID,
        type: 'supermarket',
        value: 5,
        expiry: '2026-12-31',
        usedAt: addDays(today, -1).toISOString(),
        merchantId: 'HP-M-88392',
      },
    ],
    notifications: [
      {
        id: 'N-1',
        type: 'mismatch',
        createdAt: new Date(addDays(today, -MISMATCH_DAYS_AGO + 1).getTime() + 8 * 3600_000).toISOString(),
        read: false,
        i18nKey: 'notif.mismatch',
        params: { date: mismatchKey, amount: MISMATCH_GAP },
      },
      {
        id: 'N-2',
        type: 'payout',
        createdAt: new Date(today.getTime() + 8 * 3600_000).toISOString(),
        read: false,
        i18nKey: 'notif.payout',
        params: { date: yesterdayKey, amount: sum(PAST[1]) },
      },
    ],
    bookings: [],
    settings: { soundOn: true, hapticsOn: true },
  }
}
