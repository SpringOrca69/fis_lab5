import { mkdirSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { en } from '../src/i18n/en'
import { ms } from '../src/i18n/ms'
import { ta } from '../src/i18n/ta'
import { zh } from '../src/i18n/zh'

const dictionaries = { en, zh, ms, ta }
const SHOTS = 'reviews/screenshots/fix-voucher-type'
const LANGS = ['en', 'zh', 'ms', 'ta'] as const

async function shot(page: Page, lang: string, name: string) {
  await page.evaluate('document.fonts.ready')
  await page.waitForTimeout(150)
  const fits = await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
  expect(fits, `${lang}/${name} scrolls horizontally`).toBe(true)
  await page.screenshot({ path: `${SHOTS}/${lang}-${name}.png`, fullPage: true })
}

async function typeCode(page: Page, T: Record<string, string>, code: string) {
  await page.goto('/pay')
  await page.getByRole('button', { name: T['pay.explain.notNow'] }).click()
  await page.getByRole('button', { name: T['pay.fallback.manual'] }).click()
  await page.getByRole('textbox').fill(code)
  await page.getByRole('button', { name: T['pay.manual.submit'] }).click()
}

for (const lang of LANGS) {
  test(`voucher type and nav label in ${lang}`, async ({ page }) => {
    test.setTimeout(90_000)
    mkdirSync(SHOTS, { recursive: true })
    const T = dictionaries[lang]
    await page.addInitScript((l) => {
      if (sessionStorage.getItem('fvt')) return
      sessionStorage.setItem('fvt', '1')
      localStorage.setItem('heartpay:lang', l)
    }, lang)
    await page.goto('/')
    await page.getByRole('button', { name: T['login.singpass'] }).click()
    await expect(page).toHaveURL(/\/home/)
    await page.waitForTimeout(1200)

    // Bottom nav: five tabs, icon + text, >=48px, inside the screen.
    const nav = page.getByRole('navigation', { name: T['nav.label'] })
    const links = nav.getByRole('link')
    await expect(links).toHaveCount(5)
    await expect(nav.getByRole('link', { name: T['nav.pay'] })).toBeVisible()
    for (const l of await links.all()) {
      const box = (await l.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(48)
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(390)
      expect(((await l.textContent()) ?? '').trim().length).toBeGreaterThan(0)
      await expect(l.locator('svg')).toBeVisible()
    }
    await nav.screenshot({ path: `${SHOTS}/${lang}-nav.png` })

    await page.goto('/demo')
    await page.waitForTimeout(500)
    await expect(page.getByTestId('demo-wrongType')).toBeVisible()
    await expect(page.getByTestId('demo-wrongType')).toContainText('CDC1|FOOD|')
    await expect(page.getByTestId('demo-valid15')).toContainText('CDC1|SUPERMARKET|')
    await shot(page, lang, 'demo')

    // Supermarket voucher sheet shows the type next to the amount.
    const s = Date.now()
    await typeCode(page, T, `CDC1|SUPERMARKET|V-${lang}-${s}-1,V-${lang}-${s}-2,V-${lang}-${s}-3|15|20261231|N${s}`)
    const typeLabel = T['pay.sheet.type'].replace('{type}', T['voucher.type.supermarket'])
    await expect(page.getByText(typeLabel).first()).toBeVisible()
    await page.waitForTimeout(400)
    await shot(page, lang, 'sheet')

    // Food voucher fails with the new message and the accepted type.
    await typeCode(page, T, `CDC1|FOOD|W-${lang}-${s}-1|5|20261231|M${s}`)
    await page.getByRole('button', { name: T['pay.sheet.confirm'] }).click()
    await expect(page).toHaveURL(/reason=wrong_voucher_type/)
    await expect(page.getByText(T['result.fail.noMoney'])).toBeVisible()
    await expect(page.getByText(T['result.reason.wrong_voucher_type'], { exact: true })).toBeVisible()
    await expect(page.getByText(T['result.reason.wrong_voucher_type.ask'].replace('{type}', T['voucher.type.supermarket']))).toBeVisible()
    await page.waitForTimeout(400)
    await shot(page, lang, 'failed')
  })
}

test('the demo "Already used" code fails from the voucher store', async ({ page }) => {
  await page.goto('/demo')
  const used = (await page.getByTestId('demo-used').locator('p.select-all').textContent())!
  await page.goto('/')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  await expect(page).toHaveURL(/\/home/)
  await typeCode(page, en, used)
  await page.getByRole('button', { name: 'Confirm payment' }).click()
  await expect(page).toHaveURL(/reason=already_used/)
})
