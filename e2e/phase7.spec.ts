import { mkdirSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { en } from '../src/i18n/en'
import { ms } from '../src/i18n/ms'
import { ta } from '../src/i18n/ta'
import { zh } from '../src/i18n/zh'

const dictionaries = { en, zh, ms, ta }

const SHOTS = 'reviews/screenshots/phase-7'
const LANGS = ['en', 'zh', 'ms', 'ta'] as const
const FONT: Partial<Record<(typeof LANGS)[number], string>> = { zh: 'Noto Sans SC', ta: 'Noto Sans Tamil' }

async function check(page: Page, lang: string, name: string) {
  await page.evaluate('document.fonts.ready')
  await page.waitForTimeout(150)
  const fits = await page.evaluate(
    'document.documentElement.scrollWidth <= window.innerWidth && document.body.scrollWidth <= window.innerWidth',
  )
  expect(fits, `${lang}/${name} scrolls horizontally`).toBe(true)
  // Nothing may be wider than the screen (catches clipped buttons and nav labels).
  const wide = await page.evaluate(
    `[...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1) && !e.closest('[aria-hidden="true"]') && getComputedStyle(e).position !== 'fixed' && !e.closest('video') }).map(e => e.tagName + '.' + e.className).slice(0, 5)`,
  )
  expect(wide, `${lang}/${name} has elements outside the screen`).toEqual([])
  await page.screenshot({ path: `${SHOTS}/${lang}-${name}.png`, fullPage: true })
}

for (const lang of LANGS) {
  test(`P7-2 every screen in ${lang}: no horizontal scroll, bundled fonts`, async ({ page }) => {
    test.setTimeout(120_000)
    mkdirSync(SHOTS, { recursive: true })
    const T = dictionaries[lang]
    await page.addInitScript((l) => {
      if (sessionStorage.getItem('p7init')) return
      sessionStorage.setItem('p7init', '1')
      localStorage.setItem('heartpay:lang', l)
    }, lang)

    // Login (logged out)
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await check(page, lang, '01-login')
    await page.getByRole('button', { name: T['login.singpass'] }).click()
    await expect(page).toHaveURL(/\/home/)
    await page.waitForTimeout(1200)
    await check(page, lang, '02-home')

    // Fonts: bundled Noto faces are actually used (no system fallback boxes)
    const want = FONT[lang]
    if (want) {
      await expect
        .poll(
          () => page.evaluate<string[]>("Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family)"),
          { message: 'bundled font in use', timeout: 8000 },
        )
        .toContain(want)
    }

    // Pay: explainer, then fallbacks, sheet, success
    await page.goto('/pay')
    await page.waitForTimeout(400)
    await check(page, lang, '03-pay-explainer')
    await page.getByRole('button', { name: T['pay.explain.notNow'] }).click()
    await page.waitForTimeout(300)
    await check(page, lang, '04-pay-fallback')
    const stamp = Date.now()
    await page.getByRole('button', { name: T['pay.fallback.manual'] }).click()
    await page.getByRole('textbox').fill(`CDC1|P7-${lang}-${stamp}-1,P7-${lang}-${stamp}-2,P7-${lang}-${stamp}-3|15|20261231|N${stamp}`)
    await check(page, lang, '05-pay-manual')
    await page.getByRole('button', { name: T['pay.manual.submit'] }).click()
    await page.waitForTimeout(500)
    await check(page, lang, '06-pay-sheet')
    await page.getByRole('button', { name: T['pay.sheet.confirm'] }).click()
    await expect(page).toHaveURL(/\/pay\/success\//)
    await page.waitForTimeout(500)
    await check(page, lang, '07-success')

    for (const [name, url] of [
      ['08-failed-expired', '/pay/failed?reason=expired'],
      ['09-failed-network', '/pay/failed?reason=network'],
      ['10-history', '/history'],
      ['12-payouts', '/payouts'],
      ['13-help', '/help'],
      ['15-book', '/help/book'],
      ['17-notifications', '/notifications'],
      ['18-stall', '/stall'],
      ['19-demo', '/demo'],
    ] as const) {
      await page.goto(url)
      await page.waitForTimeout(1100)
      await check(page, lang, name)
      if (name === '10-history') {
        const d = new Date()
        d.setDate(d.getDate() - 3)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        await page.goto(`/history/${key}`)
        await page.waitForTimeout(1100)
        await check(page, lang, '11-history-mismatch')
      }
      if (name === '13-help') {
        await page.getByRole('button', { name: T['help.more.show'] }).click()
        await check(page, lang, '14-help-more')
      }
    }

    // Booking done
    await page.goto('/help/book')
    await page.getByText(T['book.slot.pm1']).click()
    await page.getByRole('button', { name: T['book.submit'] }).click()
    await expect(page.getByTestId('booking-done')).toBeVisible()
    await check(page, lang, '16-book-done')
  })
}
