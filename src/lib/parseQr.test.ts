import { describe, expect, it } from 'vitest'
import { buildDemoScenarios } from './demoQr'
import { parseQr } from './parseQr'

describe('parseQr', () => {
  it('parses a valid CDC payload', () => {
    expect(parseQr('CDC1|A-1,A-2,A-3|15|20261231|N0NCE')).toEqual({
      kind: 'cdc',
      vouchers: ['A-1', 'A-2', 'A-3'],
      amount: 15,
      expiry: '2026-12-31',
      nonce: 'N0NCE',
    })
  })
  it('trims whitespace', () => {
    expect(parseQr('  CDC1|A|5|20261231|X1 \n').kind).toBe('cdc')
  })
  it('returns the domain for URLs', () => {
    expect(parseQr('https://evil.example.com/pay?x=1')).toEqual({ kind: 'url', domain: 'evil.example.com' })
  })
  it('rejects random text and empty input', () => {
    expect(parseQr('hello')).toEqual({ kind: 'not_cdc' })
    expect(parseQr('')).toEqual({ kind: 'not_cdc' })
    expect(parseQr(null)).toEqual({ kind: 'not_cdc' })
    expect(parseQr(undefined)).toEqual({ kind: 'not_cdc' })
  })
  it.each([
    'CDC1|A|5|20261231',
    'CDC1|A|5|20261231|N|extra',
    'CDC1||5|20261231|N',
    'CDC1|A,,B|5|20261231|N',
    'CDC1|A|abc|20261231|N',
    'CDC1|A|0|20261231|N',
    'CDC1|A|5|20261331|N',
    'CDC1|A|5|2026-12-31|N',
    'CDC1|A B|5|20261231|N',
    'CDC1|A|5|20261231|',
    'ftp://example.com',
    'https://',
  ])('treats malformed %s as not CDC', (s) => {
    expect(parseQr(s)).toEqual({ kind: 'not_cdc' })
  })
})

describe('demo scenarios', () => {
  it('covers 7 scenarios that parse as intended, with fresh nonces per build', () => {
    const a = buildDemoScenarios(new Date(2026, 9, 26))
    const b = buildDemoScenarios(new Date(2026, 9, 26))
    expect(a).toHaveLength(7)
    const kinds = a.map((s) => parseQr(s.payload).kind)
    expect(kinds).toEqual(['cdc', 'cdc', 'cdc', 'cdc', 'cdc', 'url', 'not_cdc'])
    const v = parseQr(a[0].payload)
    expect(v.kind === 'cdc' && v.amount).toBe(15)
    expect(v.kind === 'cdc' && v.vouchers.length).toBe(3)
    expect(a[0].payload).not.toBe(b[0].payload)
    const expired = parseQr(a[2].payload)
    expect(expired.kind === 'cdc' && expired.expiry).toBe('2026-10-25')
  })
})
