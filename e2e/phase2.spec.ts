import { expect, test, type Page } from '@playwright/test'

const h = async (loc: ReturnType<Page['locator']>) => (await loc.boundingBox())!.height

async function logIn(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  await expect(page).toHaveURL(/\/home$/)
}

test('P2-1 language tiles >=64px; choosing one changes text and persists', async ({ page }) => {
  await page.goto('/')
  const tiles = page.locator('section[aria-labelledby=lang-h] button')
  expect(await tiles.count()).toBe(4)
  for (const b of await tiles.all()) expect(await h(b)).toBeGreaterThanOrEqual(64)
  await expect(page.getByRole('heading', { name: 'Choose your language' })).toBeVisible()
  await page.getByRole('button', { name: 'தமிழ்' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta')
  await expect(page.getByRole('button', { name: 'தமிழ்' })).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta')
  // footer: single helpline, hours, existing-only note, disclaimer
  await page.getByRole('button', { name: 'English' }).click()
  const footer = page.locator('footer')
  await expect(footer).toContainText('6000 0000 (demo)')
  await expect(footer).toContainText('Daily 8am–10pm')
  await expect(footer).toContainText('existing HeartPay shops only')
  await expect(footer).toContainText('Concept prototype. Not affiliated with CDC or GovTech.')
  expect(await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')).toBe(true)
  await page.screenshot({ path: 'reviews/screenshots/phase-2/login-en.png', fullPage: true })
})

test('P2-2 Singpass demo: spinner ~1.2s then /home', async ({ page }) => {
  await page.goto('/')
  const btn = page.getByRole('button', { name: 'Log in with Singpass (demo)' })
  expect(await h(btn)).toBeGreaterThanOrEqual(56)
  const t0 = Date.now()
  await btn.click()
  await expect(page.getByRole('button', { name: 'Logging in…' })).toBeVisible()
  await expect(page).toHaveURL(/\/home$/)
  const ms = Date.now() - t0
  expect(ms).toBeGreaterThanOrEqual(1100)
  expect(ms).toBeLessThan(3000)
})

test('P2-2 failure path shows trouble message with icon + words and links to Help', async ({ page }) => {
  await page.goto('/?singpass=fail')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('Singpass login trouble')
  await page.screenshot({ path: 'reviews/screenshots/phase-2/login-fail.png', fullPage: true })
  await expect(alert.getByRole('link', { name: 'Get help' })).toHaveAttribute('href', '/help')
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page).toHaveURL(/\/home$/)
})

test('P2-2 Get help from the failure path opens Help', async ({ page }) => {
  await page.goto('/?singpass=fail')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  await page.getByRole('alert').getByRole('link', { name: 'Get help' }).click()
  await expect(page).toHaveURL(/\/help$/)
})

test('P2-3 unauthenticated routes redirect to /; /demo stays open', async ({ page }) => {
  for (const p of ['/home', '/pay', '/history', '/payouts', '/stall', '/notifications']) {
    await page.goto(p)
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Choose your language' })).toBeVisible()
  }
  await page.goto('/demo')
  await expect(page).toHaveURL(/\/demo$/)
})

test('P2-4 Home shows store totals, four blocks, midnight line; deep link works after login', async ({ page }) => {
  await logIn(page)
  await expect(page.getByTestId('today-total')).toHaveText('$75.00')
  await expect(page.getByTestId('today-count')).toHaveText('5 payments')
  await expect(page.getByTestId('last-payment')).toContainText('$15.00')
  await expect(page.getByText('Paid to your bank tonight at midnight')).toBeVisible()
  const main = page.locator('main')
  await expect(main.getByRole('link')).toHaveCount(3) // Accept, Today's report, Get help
  await expect(main.getByRole('link', { name: /Accept CDC Payment/ })).toBeVisible()
  expect(await h(main.getByRole('link', { name: /Accept CDC Payment/ }))).toBeGreaterThanOrEqual(56)
  for (const l of await main.getByRole('link').all()) expect(await h(l)).toBeGreaterThanOrEqual(56)
  await expect(main.getByRole('link', { name: /Today's report/ })).toHaveAttribute('href', '/history')
  await expect(main.getByRole('link', { name: /Get help/ })).toHaveAttribute('href', '/help')
  await page.screenshot({ path: 'reviews/screenshots/phase-2/home-en.png', fullPage: true })
  await page.reload()
  await expect(page).toHaveURL(/\/home$/)
  await page.goto('/')
  await expect(page).toHaveURL(/\/home$/) // already logged in
})

test('P2-4 skeleton shows first, then content', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  await expect(page.getByRole('status')).toBeVisible()
  await expect(page.getByTestId('today-total')).toBeVisible()
})

test('P2-4 singular plural and empty state', async ({ page }) => {
  await logIn(page)
  const keep = async (n: number) => {
    await page.evaluate((count) => {
      const s = JSON.parse(localStorage.getItem('heartpay:v1')!)
      const today = new Date().toDateString()
      const isToday = (t: { createdAt: string }) => new Date(t.createdAt).toDateString() === today
      let kept = 0
      s.transactions = s.transactions.filter((t: { createdAt: string }) => !isToday(t) || kept++ < count)
      localStorage.setItem('heartpay:v1', JSON.stringify(s))
    }, n)
    await page.reload()
  }
  await keep(1)
  await expect(page.getByTestId('today-count')).toHaveText('1 payment')
  await keep(0)
  await expect(page.getByTestId('today-count')).toHaveText('0 payments')
  await expect(page.getByTestId('empty-state')).toContainText('No payments yet today')
  await page.screenshot({ path: 'reviews/screenshots/phase-2/home-empty.png', fullPage: true })
})

test('plural forms in all languages on Home; no horizontal scroll', async ({ page }) => {
  await logIn(page)
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('heartpay:v1')!)
    const today = new Date().toDateString()
    let kept = 0
    s.transactions = s.transactions.filter((t: { createdAt: string }) => new Date(t.createdAt).toDateString() !== today || kept++ < 1)
    localStorage.setItem('heartpay:v1', JSON.stringify(s))
  })
  for (const [lang, text] of [['en', '1 payment'], ['zh', '1 笔付款'], ['ms', '1 bayaran'], ['ta', '1 கட்டணம்']] as const) {
    await page.evaluate((l) => localStorage.setItem('heartpay:lang', l), lang)
    await page.reload()
    await expect(page.getByTestId('today-count')).toHaveText(text)
    expect(await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')).toBe(true)
  }
})
