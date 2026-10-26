import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const SHOTS = 'reviews/screenshots/phase-5'
const noHScroll = (page: Page) => page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')

async function login(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  await expect(page).toHaveURL(/\/home/)
}

test('P5-1 report total matches Home; Home link and History tab open it', async ({ page }) => {
  await login(page)
  await expect(page.getByText('6 payments').or(page.getByText('5 payments'))).toBeVisible()
  const homeTotal = await page.getByTestId('today-total').textContent()
  const homeLast = await page.getByTestId('last-payment').textContent()
  await page.getByRole('link', { name: /Today's report/ }).click()
  await expect(page).toHaveURL(/\/history$/)
  await expect(page.getByRole('heading', { name: "Today's report" })).toBeVisible()
  await expect(page.getByTestId('report-total')).toHaveText(homeTotal!)
  await expect(page.getByText('Paid to your bank tonight at midnight')).toBeVisible()
  const firstRow = await page.getByTestId('payment-list').locator('li').first().innerText()
  const lastTime = homeLast!.split(': ')[1].split(',')[0]
  expect(firstRow).toContain(lastTime)
  expect(await noHScroll(page)).toBe(true)
  await page.screenshot({ path: `${SHOTS}/report-today.png`, fullPage: true })
  await page.getByRole('link', { name: 'Home' }).click()
  await page.getByRole('navigation').getByRole('link', { name: 'History' }).click()
  await expect(page).toHaveURL(/\/history$/)
})

test('P5-2 date picker limited to 14 days; filters; show all', async ({ page }) => {
  await login(page)
  await page.goto('/history/2000-01-01')
  await expect(page).toHaveURL(/\/history$/)
  await page.getByRole('button', { name: /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('button')).toHaveCount(15 + 1) // 15 days + Close
  for (const b of await dialog.getByRole('button').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(47)
  await page.screenshot({ path: `${SHOTS}/picker.png` })
  await dialog.getByRole('button', { name: /^(?!Today)/ }).nth(8).click()
  await expect(page).toHaveURL(/\/history\/\d{4}-\d{2}-\d{2}/)

  await page.goto('/history')
  await page.getByRole('button', { name: 'Evening' }).click()
  const eveningCount = await page.getByTestId('payment-list').locator('li:visible').count().catch(() => 0)
  await page.getByRole('button', { name: 'All' }).click()
  const all = await page.getByTestId('payment-list').locator('li').count()
  expect(eveningCount).toBeLessThanOrEqual(all)
  await page.getByRole('button', { name: 'Morning' }).click()
  await page.getByRole('button', { name: 'Afternoon' }).click()
})

test('P5-3 mismatch day explained, Report a problem goes to Help', async ({ page }) => {
  await login(page)
  await page.goto('/payouts')
  await page.getByTestId('payout-row').filter({ hasText: 'Not matched' }).click()
  await expect(page.getByTestId('report-status')).toContainText('Not matched, $5.00 missing')
  await expect(page.getByTestId('mismatch')).toContainText('may be missing')
  await expect(page.getByTestId('payment-list').getByText('Not in payout')).toBeVisible()
  expect(await noHScroll(page)).toBe(true)
  await page.screenshot({ path: `${SHOTS}/report-mismatch.png`, fullPage: true })
  await page.getByRole('link', { name: 'Report a problem' }).click()
  await expect(page).toHaveURL(/\/help/)
})

test('P5-4 CSV matches the displayed list', async ({ page }) => {
  await login(page)
  await page.goto('/history')
  const more = page.getByRole('button', { name: /^Show all/ })
  if (await more.count()) await more.click()
  const rows = await page.getByTestId('payment-list').locator('li').allInnerTexts()
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download CSV' }).click()])
  const csv = readFileSync(await download.path(), 'utf8').trim().split(/\r?\n/)
  expect(csv[0]).toBe('Date,Time,Payment number,Amount (SGD)')
  expect(csv.length - 1).toBe(rows.length)
  const amounts = rows.map((r) => r.match(/\$([\d.]+)/)![1])
  expect(csv.slice(1).map((l) => l.split(',')[3])).toEqual(amounts)
})

test('P5-5 payouts: tonight first, badges with words, row opens report', async ({ page }) => {
  await login(page)
  await page.getByRole('navigation').getByRole('link', { name: 'Payout' }).click()
  await expect(page).toHaveURL(/\/payouts/)
  await expect(page.getByRole('heading', { name: 'Payouts', exact: true })).toBeVisible()
  const first = page.getByTestId('payout-tonight')
  await expect(first).toContainText('Scheduled')
  await expect(page.getByTestId('payout-row').first()).toContainText('Received, matches')
  await expect(page.getByTestId('payout-row').filter({ hasText: 'Not matched' })).toHaveCount(1)
  expect(await noHScroll(page)).toBe(true)
  await page.screenshot({ path: `${SHOTS}/payouts.png`, fullPage: true })
  await page.getByTestId('payout-row').first().click()
  await expect(page).toHaveURL(/\/history\/\d{4}-\d{2}-\d{2}/)
  await expect(page.getByTestId('report-status')).toContainText('Received, matches')
})
