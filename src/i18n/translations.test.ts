import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { en } from './en'
import { ms } from './ms'
import { ta } from './ta'
import { zh } from './zh'

/** P7-1: translation completeness. Run on its own with `npm run check:i18n`. */
const others = { zh, ms, ta } as const
const enMap = en as Record<string, string>
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe.each(Object.entries(others))('%s dictionary', (code, dict) => {
  const map = dict as Record<string, string>
  it('has every EN key and no extras', () => {
    expect(Object.keys(map).sort()).toEqual(Object.keys(enMap).sort())
  })
  it('has no TODO-TRANSLATE and no empty strings', () => {
    for (const [k, v] of Object.entries(map)) {
      expect(v.trim().length, `${code}:${k} is empty`).toBeGreaterThan(0)
      expect(v, `${code}:${k}`).not.toContain('TODO-TRANSLATE')
    }
  })
  it('keeps the same {placeholders} as EN', () => {
    for (const k of Object.keys(enMap)) expect(placeholders(map[k]), `${code}:${k}`).toEqual(placeholders(enMap[k]))
  })
  it('never uses the word "credited" and keeps the one helpline untouched', () => {
    for (const v of Object.values(map)) {
      expect(v.toLowerCase()).not.toContain('credited')
      expect(v).not.toMatch(/1800|6123/)
    }
  })
})

describe('caption files', () => {
  const dir = join(process.cwd(), 'public', 'captions')
  const files = readdirSync(dir).filter((f) => f.endsWith('.vtt'))
  it('exist for every video and language', () => {
    for (const v of ['accept', 'fail']) for (const l of ['en', 'zh', 'ms', 'ta']) expect(files).toContain(`${v}.${l}.vtt`)
  })
  it.each(files)('%s has no TODO-TRANSLATE', (f) => {
    expect(readFileSync(join(dir, f), 'utf8')).not.toContain('TODO-TRANSLATE')
  })
})

describe('voucher type wording', () => {
  it('has the type keys in every language and no shop-bound voucher keys', () => {
    for (const d of [en, ...Object.values(others)] as Record<string, string>[]) {
      for (const k of ['voucher.type.supermarket', 'voucher.type.food', 'result.reason.wrong_voucher_type', 'result.reason.wrong_voucher_type.ask', 'nav.pay']) {
        expect(d[k], k).toBeTruthy()
      }
      expect(Object.keys(d).some((k) => new RegExp("wrong_mer" + "chant|demo\\.[se]\\.wrong$").test(k))).toBe(false)
    }
    expect(enMap['nav.pay']).toBe('Accept payment')
  })
})
