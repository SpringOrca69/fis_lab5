import { dateKey, addDays } from './dates'

export type DemoScenarioId = 'valid15' | 'valid10' | 'expired' | 'used' | 'wrong' | 'url' | 'text'

export interface DemoScenario {
  id: DemoScenarioId
  labelKey: 'demo.s.valid15' | 'demo.s.valid10' | 'demo.s.expired' | 'demo.s.used' | 'demo.s.wrong' | 'demo.s.url' | 'demo.s.text'
  explainKey: 'demo.e.valid15' | 'demo.e.valid10' | 'demo.e.expired' | 'demo.e.used' | 'demo.e.wrong' | 'demo.e.url' | 'demo.e.text'
  payload: string
}

/** Voucher id prefixes the Phase 4 redemption check will recognise. */
export const USED_PREFIX = 'CDC-USED-'
export const OTHER_SHOP_PREFIX = 'CDC-OTHER-'
export const VOUCHER_EXPIRY = '20261231'

const compact = (d: Date) => dateKey(d).replaceAll('-', '')

export function makeNonce(random: () => number = Math.random): string {
  return Array.from({ length: 8 }, () => Math.floor(random() * 36).toString(36)).join('').toUpperCase()
}

/** Builds the seven demo QR payloads. Valid ones get fresh ids and nonce on every call. */
export function buildDemoScenarios(now: Date = new Date(), random: () => number = Math.random): DemoScenario[] {
  const n = () => makeNonce(random)
  const ids = (prefix: string, count: number) => Array.from({ length: count }, (_, i) => `${prefix}${n()}-${i + 1}`).join(',')
  const cdc = (idList: string, amount: number, expiry: string) => `CDC1|${idList}|${amount}|${expiry}|${n()}`
  return [
    { id: 'valid15', labelKey: 'demo.s.valid15', explainKey: 'demo.e.valid15', payload: cdc(ids('CDC-', 3), 15, VOUCHER_EXPIRY) },
    { id: 'valid10', labelKey: 'demo.s.valid10', explainKey: 'demo.e.valid10', payload: cdc(ids('CDC-', 2), 10, VOUCHER_EXPIRY) },
    { id: 'expired', labelKey: 'demo.s.expired', explainKey: 'demo.e.expired', payload: cdc(ids('CDC-', 1), 5, compact(addDays(now, -1))) },
    { id: 'used', labelKey: 'demo.s.used', explainKey: 'demo.e.used', payload: cdc(ids(USED_PREFIX, 1), 5, VOUCHER_EXPIRY) },
    { id: 'wrong', labelKey: 'demo.s.wrong', explainKey: 'demo.e.wrong', payload: cdc(ids(OTHER_SHOP_PREFIX, 1), 5, VOUCHER_EXPIRY) },
    { id: 'url', labelKey: 'demo.s.url', explainKey: 'demo.e.url', payload: 'https://cdc-voucher-bonus.example.com/claim?id=1' },
    { id: 'text', labelKey: 'demo.s.text', explainKey: 'demo.e.text', payload: 'Fresh kopi, two for $3' },
  ]
}
