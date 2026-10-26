/// <reference lib="dom" />
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { en } from '../src/i18n/en'
import { ms } from '../src/i18n/ms'
import { ta } from '../src/i18n/ta'
import { zh } from '../src/i18n/zh'

const dictionaries = { en, zh, ms, ta }
const LANGS = ['en', 'zh', 'ms', 'ta'] as const
const DISCLAIMER = 'Concept prototype. Not affiliated with CDC or GovTech.'

async function login(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  await expect(page).toHaveURL(/\/home/)
  await page.waitForTimeout(700)
}

async function axe(page: Page, name: string) {
  await page.waitForTimeout(700)
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(
    bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    `axe on ${name}`,
  ).toEqual([])
}

const ROUTES = ['/', '/home', '/pay', '/history', '/payouts', '/help', '/help/book', '/stall', '/notifications', '/demo']

test('P8-1 axe: no serious or critical issues on every route', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/')
  await axe(page, '/ (logged out)')
  await login(page)
  for (const r of ROUTES.slice(1)) {
    await page.goto(r)
    await axe(page, r)
  }
  // Extra states
  await page.goto('/help')
  await page.getByRole('button', { name: en['help.more.show'] }).click()
  await axe(page, '/help (FAQ open)')
  for (const reason of ['expired', 'already_used', 'network']) {
    await page.goto(`/pay/failed?reason=${reason}`)
    await axe(page, `/pay/failed ${reason}`)
  }
  const d = new Date()
  d.setDate(d.getDate() - 3)
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  await page.goto(`/history/${key}`)
  await axe(page, '/history mismatch day')
  // Pay: fallbacks, manual, sheet, success
  await page.goto('/pay')
  await page.getByRole('button', { name: en['pay.explain.notNow'] }).click()
  await axe(page, '/pay fallback')
  await page.getByRole('button', { name: en['pay.fallback.manual'] }).click()
  await axe(page, '/pay manual')
  const s = Date.now()
  await page.getByRole('textbox').fill(`CDC1|SUPERMARKET|A8-${s}-1,A8-${s}-2|10|20261231|N${s}`)
  await page.getByRole('button', { name: en['pay.manual.submit'] }).click()
  await axe(page, '/pay sheet')
  await page.getByRole('button', { name: en['pay.sheet.confirm'] }).click()
  await expect(page).toHaveURL(/\/pay\/success\//)
  await axe(page, '/pay/success')
})

test('P8-2 keyboard only: login to pay (manual code) to success, focus visible', async ({ page }) => {
  await page.goto('/')
  // Focus ring check helper
  const ringOk = async () =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return false
      const cs = getComputedStyle(el)
      return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2
    })
  const tabTo = async (name: RegExp | string, max = 40) => {
    for (let i = 0; i < max; i++) {
      await page.keyboard.press('Tab')
      const label = await page.evaluate(() => {
        const e = document.activeElement as HTMLInputElement | null
        if (!e || !['A', 'BUTTON', 'INPUT', 'TEXTAREA'].includes(e.tagName)) return ''
        return (e.getAttribute('aria-label') ?? e.labels?.[0]?.textContent ?? e.textContent ?? '').trim()
      })
      if (typeof name === 'string' ? label.includes(name) : name.test(label)) {
        expect(await ringOk(), `focus ring on "${label}"`).toBe(true)
        return
      }
    }
    throw new Error(`could not tab to ${name} on ${page.url()} ${await page.locator('main').innerText()}`)
  }

  await tabTo('Log in with Singpass')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/home/)
  await page.waitForTimeout(700)
  await tabTo(/Accept CDC/)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/pay/)
  await expect(page.getByRole('button', { name: en['pay.explain.notNow'] })).toBeVisible()
  await tabTo(en['pay.explain.notNow'])
  await page.keyboard.press('Enter')
  await tabTo(en['pay.fallback.manual'])
  await page.keyboard.press('Enter')
  await tabTo('Voucher code')
  const s = Date.now()
  await page.keyboard.type(`CDC1|SUPERMARKET|K-${s}-1,K-${s}-2,K-${s}-3|15|20261231|N${s}`)
  await tabTo(en['pay.manual.submit'])
  await page.keyboard.press('Enter')

  // Focus moves into the sheet and stays trapped from the page behind (header is inert)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toBeFocused()
  await expect(dialog).toHaveAttribute('aria-live', 'assertive')
  await tabTo(en['pay.sheet.confirm'])
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/pay\/success\//)
  await expect(page.getByRole('heading', { name: 'Payment confirmed' })).toBeVisible()
})

test('P8-2b focus returns when the result sheet is cancelled', async ({ page }) => {
  await login(page)
  await page.goto('/pay')
  await page.getByRole('button', { name: en['pay.explain.notNow'] }).click()
  await page.getByRole('button', { name: en['pay.fallback.manual'] }).click()
  const s = Date.now()
  await page.getByRole('textbox').fill(`CDC1|SUPERMARKET|F-${s}-1|5|20261231|N${s}`)
  await page.getByRole('button', { name: en['pay.manual.submit'] }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeFocused()
  await page.getByRole('button', { name: en['pay.sheet.cancel'] }).click()
  await expect(dialog).toHaveCount(0)
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
  expect(focusedTag).not.toBe('BODY')
})

test('P8-3 offline: banner shows, Home/Report/Help readable, confirm blocked', async ({ page, context }) => {
  await login(page)
  await page.goto('/demo')
  await page.getByRole('switch').click()
  await expect(page.getByTestId('offline-banner')).toBeVisible()
  await expect(page.getByTestId('offline-banner')).toContainText(en['offline.banner'])
  for (const r of ['/home', '/history', '/help']) {
    await page.goto(r)
    await expect(page.getByTestId('offline-banner')).toBeVisible()
  }
  await page.goto('/help')
  await expect(page.getByText(en['help.video.needsInternet']).first()).toBeVisible()
  await page.goto('/pay')
  await page.getByRole('button', { name: en['pay.explain.notNow'] }).click()
  await page.getByRole('button', { name: en['pay.fallback.manual'] }).click()
  const s = Date.now()
  await page.getByRole('textbox').fill(`CDC1|SUPERMARKET|O-${s}-1|5|20261231|N${s}`)
  await page.getByRole('button', { name: en['pay.manual.submit'] }).click()
  await page.getByRole('button', { name: en['pay.sheet.confirm'] }).click()
  await expect(page).toHaveURL(/reason=network/)
  await expect(page.getByText(en['result.reason.network'])).toBeVisible()
  // Real browser offline flag drives the banner too
  await page.goto('/demo')
  await page.getByRole('switch').click()
  await expect(page.getByTestId('offline-banner')).toHaveCount(0)
  await context.setOffline(true)
  await page.evaluate(() => window.dispatchEvent(new Event('offline')))
  await expect(page.getByTestId('offline-banner')).toBeVisible()
  await context.setOffline(false)
})

test('P8-4 disclaimer in the footer of every screen (incl. camera)', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(DISCLAIMER)).toBeVisible()
  await login(page)
  for (const r of ['/home', '/pay', '/history', '/payouts', '/help', '/help/book', '/stall', '/notifications', '/demo', '/pay/failed?reason=expired']) {
    await page.goto(r)
    await expect(page.getByText(DISCLAIMER).first(), r).toBeVisible()
  }
})

test('P8-5 reduced motion: transitions and animations are effectively off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page)
  await page.goto('/pay/failed?reason=expired')
  const dur = await page.evaluate(() => {
    const out: number[] = []
    for (const e of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(e)
      out.push(parseFloat(cs.animationDuration), parseFloat(cs.transitionDuration))
    }
    return Math.max(...out.filter((n) => !Number.isNaN(n)))
  })
  expect(dur).toBeLessThan(0.01)
})

test('P8 safe areas: viewport-fit=cover and env() insets on nav and sheet', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('meta[name=viewport]')).toHaveAttribute('content', /viewport-fit=cover/)
  const css = await page.evaluate(async () => {
    const urls = [...document.styleSheets].map((s) => s.href).filter(Boolean) as string[]
    return (await Promise.all(urls.map((u) => fetch(u).then((r) => r.text())))).join('\n')
  })
  expect(css).toContain('safe-area-inset-bottom')
  expect(css).toContain('safe-area-inset-top')
})

for (const lang of LANGS) {
  test(`P8 no console errors/warnings or leftover placeholders in ${lang}`, async ({ page }) => {
    test.setTimeout(120_000)
    const T = dictionaries[lang]
    const problems: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`)
    })
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
    await page.addInitScript((l) => {
      if (sessionStorage.getItem('p8init')) return
      sessionStorage.setItem('p8init', '1')
      localStorage.setItem('heartpay:lang', l)
    }, lang)
    await page.goto('/')
    await page.getByRole('button', { name: T['login.singpass'] }).click()
    await expect(page).toHaveURL(/\/home/)
    const routes = ['/home', '/pay', '/history', '/payouts', '/help', '/help/book', '/stall', '/notifications', '/demo', '/pay/failed?reason=expired']
    for (const r of routes) {
      await page.goto(r)
      await page.waitForTimeout(700)
      const text = await page.locator('body').innerText()
      expect(text, `${lang} ${r} placeholder`).not.toMatch(/TODO|TRANSLATE|lorem|placeholder text(?!,)/i)
      if (lang !== 'en') expect(text, `${lang} ${r} has raw key`).not.toMatch(/(^|\s)(app|nav|home|pay|report|help|book|stall|notif|demo|login|result|header|offline|lang)\.[a-zA-Z]+/)
    }
    expect(problems).toEqual([])
  })
}
