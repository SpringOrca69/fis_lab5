import { expect, test, type Page } from '@playwright/test'

const SHOTS = 'reviews/screenshots/phase-4'
const noHScroll = (page: Page) => page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')

async function toSheet(page: Page, code: string) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  await page.getByRole('link', { name: /Accept CDC/ }).first().click()
  await page.getByRole('button', { name: 'Not now' }).click()
  await page.getByRole('button', { name: 'Type the code' }).click()
  await page.getByRole('textbox', { name: 'Voucher code' }).fill(code)
  await page.getByRole('button', { name: 'Check code' }).click()
}

test('P4 pay, then the same code again fails; Home updates', async ({ page }) => {
  const code = `CDC1|SUPERMARKET|E-${Date.now()}-1,E-${Date.now()}-2,E-${Date.now()}-3|15|20261231|NONCE1`
  await toSheet(page, code)
  await page.getByRole('button', { name: 'Confirm payment' }).click()
  await expect(page).toHaveURL(/\/pay\/success\//)
  await expect(page.getByRole('heading', { name: 'Payment confirmed' })).toBeVisible()
  for (const b of await page.getByRole('link').all()) if ((await b.textContent())?.match(/Next|Back/)) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(56)
  expect(await noHScroll(page)).toBe(true)
  await page.screenshot({ path: `${SHOTS}/success.png`, fullPage: true })
  await page.getByRole('button', { name: 'View details' }).click()
  await page.screenshot({ path: `${SHOTS}/success-details.png`, fullPage: true })
  await page.getByRole('link', { name: 'Back to home' }).click()
  await expect(page.getByText('6 payments')).toBeVisible()

  await toSheetAgain(page, code)
  await page.getByRole('button', { name: 'Confirm payment' }).click()
  await expect(page).toHaveURL(/reason=already_used/)
  await expect(page.getByText('No money was taken')).toBeVisible()
  expect(await noHScroll(page)).toBe(true)
  await page.screenshot({ path: `${SHOTS}/failed.png`, fullPage: true })
})

async function toSheetAgain(page: Page, code: string) {
  await page.getByRole('link', { name: /Accept CDC/ }).first().click()
  await page.getByRole('button', { name: 'Not now' }).click()
  await page.getByRole('button', { name: 'Type the code' }).click()
  await page.getByRole('textbox', { name: 'Voucher code' }).fill(code)
  await page.getByRole('button', { name: 'Check code' }).click()
}

test('P4-4 offline toggle blocks confirm', async ({ page }) => {
  await page.goto('/demo')
  await page.getByRole('switch', { name: /Simulate offline/ }).click()
  await toSheet(page, `CDC1|SUPERMARKET|O-1|5|20261231|OFF1`)
  await page.getByRole('button', { name: 'Confirm payment' }).click()
  await expect(page).toHaveURL(/reason=network/)
  await expect(page.getByText(/Nothing was charged/)).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/failed-network.png`, fullPage: true })
})
