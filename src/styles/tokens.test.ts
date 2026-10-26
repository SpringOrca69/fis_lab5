/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const tok = (name: string) => css.match(new RegExp(`--${name}:\\s*([^;]+);`))![1].trim()
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const c = (n: string) => tok(`color-${n}`)

const css = readFileSync(`${process.cwd()}/src/styles/index.css`, 'utf8')

describe('design tokens (Phase 1 extras)', () => {
  it('root font size is 18px and type/tap tokens are rem at expected px', () => {
    expect(css).toMatch(/html\s*{[^}]*font-size:\s*18px/)
    const px = (n: string) => Math.round(parseFloat(tok(n)) * 18)
    expect(tok('text-base')).toBe('1rem')
    expect(px('text-sm')).toBeGreaterThanOrEqual(16)
    expect(px('text-amount')).toBeGreaterThanOrEqual(36)
    expect(px('text-amount-xl')).toBeLessThanOrEqual(48)
    expect(px('text-amount-xl')).toBeGreaterThanOrEqual(36)
    expect(px('spacing-tap')).toBeGreaterThanOrEqual(48)
    expect(px('spacing-tap-pay')).toBeGreaterThanOrEqual(56)
    expect(px('spacing-tile')).toBeGreaterThanOrEqual(64)
    for (const n of ['text-sm', 'text-lg', 'text-title', 'text-amount', 'text-amount-xl', 'spacing-tap', 'spacing-tap-pay', 'spacing-tile']) expect(tok(n)).toMatch(/rem$/)
  })
  const pairs: [string, string][] = [
    ['surface', 'brand-700'], ['canvas', 'ink'], ['surface', 'ink'], ['surface', 'ink-muted'], ['canvas', 'ink-muted'],
    ['success-tint', 'success'], ['danger-tint', 'danger'], ['warning-tint', 'warning'], ['surface', 'success'], ['surface', 'danger'],
    ['brand-100', 'brand-900'], ['brand-700', 'surface'], ['canvas', 'brand-700'], ['surface', 'focus'], ['canvas', 'focus'],
  ]
  it.each(pairs)('AA contrast %s vs %s >= 4.5', (bg, fg) => {
    const r = ratio(c(bg), c(fg))
    console.log(`contrast ${bg} / ${fg} = ${r.toFixed(2)}`)
    expect(r).toBeGreaterThanOrEqual(4.5)
  })
})
