/// <reference lib="dom" />
import { expect, test, type Page } from '@playwright/test'
import { en } from '../src/i18n/en'
import { ms } from '../src/i18n/ms'
import { ta } from '../src/i18n/ta'
import { zh } from '../src/i18n/zh'

const dictionaries = { en, zh, ms, ta }
const LANGS = ['en', 'zh', 'ms', 'ta'] as const

test('P8-3 skeletons: Home and Report show a loading state on first load', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: en['login.singpass'] }).click()
  await expect(page).toHaveURL(/\/home/)
  await expect(page.getByText(en['home.loading'])).toBeAttached()
  await expect(page.getByRole('heading', { name: en['home.todaySales'] })).toBeVisible()
  // Report skeleton: first report of the session (module state), reached in-app
  await page.getByRole('link', { name: new RegExp(en['home.report']) }).first().click()
  await expect(page).toHaveURL(/\/history/)
  await expect(page.getByText(en['report.loading'])).toBeAttached()
})

test('P8-3 empty states: Home no payments, Report empty day, Notifications empty', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: en['login.singpass'] }).click()
  await expect(page).toHaveURL(/\/home/)
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('heartpay:v1')!)
    s.transactions = []
    s.notifications = []
    localStorage.setItem('heartpay:v1', JSON.stringify(s))
  })
  await page.goto('/home')
  await expect(page.getByText(en['home.noPayments'])).toBeVisible()
  await page.goto('/history')
  await expect(page.getByText(en['report.empty'])).toBeVisible()
  await page.goto('/notifications')
  await expect(page.getByText(en['notif.empty'])).toBeVisible()
})

async function clickNav(page: Page, name: string) {
  await page.getByRole('link', { name }).first().click()
}

test('P8-3 true offline browser context: Home, Report, Help readable; confirm blocked', async ({ page, context }) => {
  await page.goto('/')
  await page.getByRole('button', { name: en['login.singpass'] }).click()
  await expect(page).toHaveURL(/\/home/)
  await page.waitForTimeout(800)
  // visit Report once online so its first-load skeleton has passed
  await page.goto('/history')
  await page.waitForTimeout(800)
  await page.goto('/home')
  await page.waitForTimeout(800)

  await context.setOffline(true)
  await expect(page.getByTestId('offline-banner')).toBeVisible()
  await expect(page.getByText(en['home.todaySales'])).toBeVisible()
  expect(await page.evaluate(() => navigator.onLine)).toBe(false)

  // client-side navigation only (no service worker in this phase)
  await clickNav(page, en['nav.history'])
  await expect(page).toHaveURL(/\/history/)
  await expect(page.getByTestId('offline-banner')).toBeVisible()
  await expect(page.getByRole('heading', { name: en['report.today'] }).first()).toBeVisible()

  await page.goBack()
  await page.getByRole('link', { name: en['home.help'], exact: false }).first().click()
  await expect(page).toHaveURL(/\/help/)
  await expect(page.getByTestId('offline-banner')).toBeVisible()
  await expect(page.getByText(en['help.video.needsInternet']).first()).toBeVisible()
  await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()

  // Confirm blocked while truly offline
  await page.goBack()
  await clickNav(page, en['nav.pay'])
  await page.getByRole('button', { name: en['pay.explain.notNow'] }).click()
  await page.getByRole('button', { name: en['pay.fallback.manual'] }).click()
  const s = Date.now()
  await page.getByRole('textbox').fill(`CDC1|SUPERMARKET|TO-${s}-1|5|20261231|N${s}`)
  await page.getByRole('button', { name: en['pay.manual.submit'] }).click()
  await page.getByRole('button', { name: en['pay.sheet.confirm'] }).click()
  await expect(page).toHaveURL(/reason=network/)
  await expect(page.getByText(en['result.reason.network'])).toBeVisible()
  await context.setOffline(false)
})

for (const lang of LANGS) {
  test(`P8 banned copy sweep in ${lang}`, async ({ page }) => {
    test.setTimeout(120_000)
    const T = dictionaries[lang]
    await page.addInitScript((l) => {
      if (sessionStorage.getItem('p8binit')) return
      sessionStorage.setItem('p8binit', '1')
      localStorage.setItem('heartpay:lang', l)
    }, lang)
    await page.goto('/')
    await page.getByRole('button', { name: T['login.singpass'] }).click()
    await expect(page).toHaveURL(/\/home/)
    const routes = ['/', '/home', '/pay', '/history', '/payouts', '/help', '/help/book', '/stall', '/notifications', '/demo', '/pay/failed?reason=expired']
    for (const r of routes) {
      await page.goto(r)
      await page.waitForTimeout(600)
      if (r === '/help') await page.getByRole('button', { name: T['help.more.show'] }).click()
      const text = await page.locator('body').innerText()
      expect(text, `${lang} ${r} banned`).not.toMatch(/credited|official|IRAS|hawker|stall 01-42|\b1800\b|\b6123\b|GovTech approved/i)
      const nums = (text.match(/(?<![|\-\d])[689]\d{3}\s?\d{4}(?![|\-\d])/g) ?? []).map((x) => x.replace(/\s/g, ''))
      for (const n of nums) expect(n, `${lang} ${r} other number`).toBe('60000000')
    }
  })
}

test('P8 checklist matches tests.md final checklist', async () => {
  const fs = await import('node:fs')
  const tests = fs.readFileSync('tests.md', 'utf8')
  const list = fs.readFileSync('reviews/final-device-checklist.md', 'utf8')
  const items = tests.split('## Final device checklist (Phase 8, H)')[1].match(/^\d+\. .+$/gm) ?? []
  expect(items.length).toBe(11)
  for (const i of items) {
    const n = i.match(/^(\d+)\./)![1]
    expect(list).toMatch(new RegExp(`- \\[ \\] ${n}\\. `))
  }
})
