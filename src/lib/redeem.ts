import { dateKey } from './dates'
import { OTHER_SHOP_PREFIX, USED_PREFIX } from './demoQr'
import type { QrResult } from './parseQr'
import type { Transaction, Voucher } from '@/data/types'

export type Cdc = Extract<QrResult, { kind: 'cdc' }>
export type FailureReason = 'expired' | 'already_used' | 'wrong_merchant' | 'insufficient' | 'network'
export type RedeemOutcome = { ok: true } | { ok: false; reason: FailureReason }

/** No single CDC voucher is worth more than this, so a bigger total cannot be covered. */
export const MAX_VOUCHER_VALUE = 10

export interface RedeemInput {
  code: Cdc
  /** The mock redemption database: vouchers already used. */
  vouchers: Voucher[]
  online: boolean
  now?: Date
}

/**
 * Mock redemption API. Pure: it only decides; the caller stores the result.
 * Never queues anything: offline is a plain failure and nothing is charged.
 */
export function redeem({ code, vouchers, online, now = new Date() }: RedeemInput): RedeemOutcome {
  if (!online) return { ok: false, reason: 'network' }
  if (code.vouchers.some((id) => id.startsWith(OTHER_SHOP_PREFIX))) return { ok: false, reason: 'wrong_merchant' }
  if (code.expiry < dateKey(now)) return { ok: false, reason: 'expired' }
  const used = new Set(vouchers.filter((v) => v.usedAt).map((v) => v.id))
  if (code.vouchers.some((id) => id.startsWith(USED_PREFIX) || used.has(id))) return { ok: false, reason: 'already_used' }
  if (code.amount > code.vouchers.length * MAX_VOUCHER_VALUE) return { ok: false, reason: 'insufficient' }
  return { ok: true }
}

/** The one transaction and the used-voucher records for a successful redemption. */
export function buildRedemption(
  code: Cdc,
  merchantId: string,
  now: Date = new Date(),
): { transaction: Transaction; vouchers: Voucher[] } {
  const day = dateKey(now)
  const each = code.amount / code.vouchers.length
  return {
    transaction: {
      id: `TX-${day.replaceAll('-', '')}-${code.nonce}`,
      voucherIds: code.vouchers,
      amount: code.amount,
      createdAt: now.toISOString(),
      status: 'confirmed',
      payoutId: `PO-${day.replaceAll('-', '')}`,
    },
    vouchers: code.vouchers.map((id) => ({ id, value: each, expiry: code.expiry, usedAt: now.toISOString(), merchantId })),
  }
}
