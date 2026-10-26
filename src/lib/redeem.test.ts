import { describe, expect, it } from 'vitest'
import { reducer } from '@/data/storeCore'
import { createSeed } from '@/data/seed'
import { todayTotal, lastTransaction } from '@/data/selectors'
import { buildDemoScenarios } from './demoQr'
import { parseQr } from './parseQr'
import { buildRedemption, redeem, type Cdc } from './redeem'

const NOW = new Date(2026, 9, 26, 14, 30)
const SEED_VOUCHERS = createSeed(NOW).vouchers
const ACCEPTED = createSeed(NOW).merchant.acceptedVoucherType
const code = (id: string): Cdc => {
  const sc = buildDemoScenarios(NOW).find((s) => s.id === id)!
  return parseQr(sc.payload) as Cdc
}

describe('redeem (P4-1)', () => {
  it('succeeds for a fresh valid code', () => {
    expect(redeem({ code: code('valid15'), vouchers: [], online: true, accepted: ACCEPTED, now: NOW })).toEqual({ ok: true })
    expect(redeem({ code: code('valid10'), vouchers: [], online: true, accepted: ACCEPTED, now: NOW })).toEqual({ ok: true })
  })
  it.each([
    ['expired', 'expired'],
    ['used', 'already_used'],
    ['wrongType', 'wrong_voucher_type'],
  ] as const)('demo %s code fails with %s', (id, reason) => {
    expect(redeem({ code: code(id), vouchers: SEED_VOUCHERS, online: true, accepted: ACCEPTED, now: NOW })).toEqual({ ok: false, reason })
  })
  it('Ah Seng Minimart accepts supermarket vouchers only', () => {
    expect(ACCEPTED).toBe('supermarket')
  })
  it('decides the type from the payload field, not the voucher id', () => {
    const food = { ...code('valid10'), voucherType: 'food' as const }
    expect(redeem({ code: food, vouchers: [], online: true, accepted: 'supermarket', now: NOW })).toEqual({ ok: false, reason: 'wrong_voucher_type' })
    expect(redeem({ code: food, vouchers: [], online: true, accepted: 'food', now: NOW })).toEqual({ ok: true })
  })
  it('decides already_used from the voucher store, not the id', () => {
    const c = code('used')
    expect(redeem({ code: c, vouchers: [], online: true, accepted: ACCEPTED, now: NOW }).ok).toBe(true)
    expect(redeem({ code: c, vouchers: SEED_VOUCHERS, online: true, accepted: ACCEPTED, now: NOW })).toEqual({ ok: false, reason: 'already_used' })
  })
  it('fails with network when offline, before any other check', () => {
    expect(redeem({ code: code('valid15'), vouchers: [], online: false, accepted: ACCEPTED, now: NOW })).toEqual({ ok: false, reason: 'network' })
  })
  it('fails with insufficient when the total is more than the vouchers can cover', () => {
    const c = { ...code('valid10'), amount: 50 }
    expect(redeem({ code: c, vouchers: [], online: true, accepted: ACCEPTED, now: NOW })).toEqual({ ok: false, reason: 'insufficient' })
  })
  it('treats a stored voucher as single-use (P4-3)', () => {
    const c = code('valid15')
    const { vouchers } = buildRedemption(c, 'HP-M-88392', NOW)
    expect(redeem({ code: c, vouchers, online: true, accepted: ACCEPTED, now: NOW })).toEqual({ ok: false, reason: 'already_used' })
  })
  it('accepts a code that expires today', () => {
    const c = { ...code('valid10'), expiry: '2026-10-26' }
    expect(redeem({ code: c, vouchers: [], online: true, accepted: ACCEPTED, now: NOW }).ok).toBe(true)
  })
})

describe('store redeem action (P4-2)', () => {
  it('adds exactly one transaction and marks vouchers used', () => {
    const s0 = createSeed(NOW)
    const c = code('valid15')
    const before = todayTotal(s0, NOW)
    const { transaction, vouchers } = buildRedemption(c, s0.merchant.id, NOW)
    const s1 = reducer(s0, { type: 'redeem', transaction, vouchers })
    expect(s1.transactions).toHaveLength(s0.transactions.length + 1)
    expect(todayTotal(s1, NOW)).toBe(before + 15)
    expect(lastTransaction(s1, NOW)?.id).toBe(transaction.id)
    expect(s1.vouchers).toHaveLength(s0.vouchers.length + 3)
    expect(s1.vouchers.every((v) => v.usedAt && v.merchantId === 'HP-M-88392')).toBe(true)
    const today = s1.payouts.find((p) => p.status === 'scheduled')!
    expect(today.expected).toBe(s0.payouts.find((p) => p.status === 'scheduled')!.expected + 15)
  })
})
