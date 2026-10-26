import { expect, test, type Page } from '@playwright/test'

test.use({ launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } })

const SHOTS = 'reviews/screenshots/phase-3'
const h = async (loc: ReturnType<Page['locator']>) => (await loc.boundingBox())!.height
const noHScroll = (page: Page) => page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')

async function logIn(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  await expect(page).toHaveURL(/\/home$/)
}
async function toPay(page: Page) {
  await page.getByRole('link', { name: /Accept CDC/ }).first().click()
  await expect(page).toHaveURL(/\/pay$/)
}

test.describe('no camera permission yet', () => {
  test('P3-2 /demo renders 7 QR codes, public, no overflow', async ({ page }) => {
    await page.goto('/demo')
    for (const id of ['valid15', 'valid10', 'expired', 'used', 'wrong', 'url', 'text']) {
      await expect(page.getByTestId(`demo-${id}`).locator('svg').first()).toBeVisible()
    }
    expect(await page.locator('[data-testid^=demo-] svg').count()).toBe(7)
    expect(await noHScroll(page)).toBe(true)
    for (const b of await page.getByRole('button').all()) expect(await h(b)).toBeGreaterThanOrEqual(48)
    await page.screenshot({ path: `${SHOTS}/demo.png`, fullPage: true })
  })

  test('P3-3 explainer, Not now fallbacks, manual entry -> sheet, cancel', async ({ page }) => {
    await logIn(page)
    await toPay(page)
    await expect(page.getByRole('heading', { name: 'We need your camera to scan QR codes' })).toBeVisible()
    await expect(page.getByText('No photos are saved.')).toBeVisible()
    expect(await h(page.getByRole('button', { name: 'Allow camera' }))).toBeGreaterThanOrEqual(56)
    expect(await h(page.getByRole('button', { name: 'Not now' }))).toBeGreaterThanOrEqual(48)
    expect(await noHScroll(page)).toBe(true)
    await page.screenshot({ path: `${SHOTS}/explainer.png` })

    await page.getByRole('button', { name: 'Not now' }).click()
    await expect(page.getByRole('heading', { name: 'No camera found on this device' })).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/fallbacks.png` })
    await page.getByRole('button', { name: 'Type the code' }).click()
    await expect(page.getByRole('heading', { name: 'Type the voucher code' })).toBeVisible()

    // empty submit
    await page.getByRole('button', { name: 'Check code' }).click()
    await expect(page.getByText('Type the code first.')).toBeVisible()

    // random text -> not CDC
    await page.getByRole('textbox', { name: 'Voucher code' }).fill('hello')
    await page.getByRole('button', { name: 'Check code' }).click()
    await expect(page.getByText('This is not a CDC voucher code')).toBeVisible()
    await page.screenshot({ path: `${SHOTS}/not-cdc.png` })
    await page.getByRole('button', { name: 'Scan again' }).click()

    // URL
    await page.getByRole('textbox', { name: 'Voucher code' }).fill('https://cdc-voucher-bonus.example.com/claim?id=1')
    await page.getByRole('button', { name: 'Check code' }).click()
    await expect(page.getByText('cdc-voucher-bonus.example.com')).toBeVisible()
    await expect(page.getByRole('link', { name: /open link/i })).toHaveCount(0)
    await page.getByRole('button', { name: 'Scan again' }).click()

    // valid
    await page.getByRole('textbox', { name: 'Voucher code' }).fill('CDC1|CDC-A-1,CDC-A-2,CDC-A-3|15|20261231|NONCE1')
    await page.getByRole('button', { name: 'Check code' }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
    await expect(sheet).toContainText('$15.00')
    await expect(sheet).toContainText('3 vouchers × $5')
    await expect(sheet).toContainText('Valid until 31 Dec 2026')
    await expect(sheet).toContainText('Check the amount with the customer before you confirm.')
    const confirm = page.getByRole('button', { name: 'Confirm payment' })
    const cancel = page.getByRole('button', { name: 'Cancel, no money taken' })
    expect(await h(confirm)).toBeGreaterThanOrEqual(56)
    expect(await h(cancel)).toBeGreaterThanOrEqual(56)
    const cb = (await confirm.boundingBox())!, xb = (await cancel.boundingBox())!
    expect(xb.y - (cb.y + cb.height)).toBeGreaterThanOrEqual(16)
    // focus moved into the sheet
    expect(await page.evaluate("!!document.activeElement?.closest('[role=dialog]')")).toBe(true)
    await page.getByRole('button', { name: 'Details' }).click()
    await expect(sheet).toContainText('CDC-A-1, CDC-A-2, CDC-A-3')
    await expect(sheet).toContainText('CDC Vouchers 2026')
    expect(await noHScroll(page)).toBe(true)
    await page.screenshot({ path: `${SHOTS}/sheet.png` })

    // Confirm is a placeholder: no money, no transaction
    await confirm.click()
    await expect(page.getByText(/No money was taken/)).toBeVisible()
    await expect(page).toHaveURL(/\/pay$/)
  })

  test('P3-5 image upload of a /demo QR reaches the sheet; bad image fails kindly', async ({ page, browser }) => {
    // screenshot a real demo QR, then upload it
    const demo = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await demo.goto('http://localhost:4173/demo')
    const png = await demo.getByTestId('demo-valid10').locator('svg').first().screenshot()
    await demo.close()

    await logIn(page)
    await toPay(page)
    await page.getByRole('button', { name: 'Not now' }).click()
    await page.getByRole('button', { name: 'Choose a screenshot' }).click()
    await page.getByTestId('upload-input').setInputFiles({ name: 'qr.png', mimeType: 'image/png', buffer: Buffer.from(png) })
    await expect(page.getByRole('dialog')).toContainText('$10.00', { timeout: 15000 })
    await page.getByRole('button', { name: 'Cancel, no money taken' }).click()
    await expect(page.getByRole('heading', { name: 'Choose a screenshot' })).toBeVisible()

    const blank = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
    await page.getByTestId('upload-input').setInputFiles({ name: 'b.png', mimeType: 'image/png', buffer: blank })
    await expect(page.getByText("We couldn't find a QR code in that picture.")).toBeVisible({ timeout: 15000 })
    await page.screenshot({ path: `${SHOTS}/upload-fail.png` })
  })
})

test.describe('fake camera, permission granted', () => {
  test.use({
    permissions: ['camera'],
  })
  test('P3-3 granted: skips explainer, full-screen camera, no bottom nav, controls at bottom', async ({ page }) => {
    await logIn(page)
    await toPay(page)
    await expect(page.getByText('Point at the customer\'s QR code')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'We need your camera to scan QR codes' })).toHaveCount(0)
    await expect(page.getByRole('navigation')).toHaveCount(0)
    for (const n of ['Type code', 'Help', 'Cancel']) {
      const b = page.getByRole('button', { name: n })
      expect(await h(b)).toBeGreaterThanOrEqual(56)
      expect((await b.boundingBox())!.y).toBeGreaterThan(844 * 0.7)
    }
    await expect(page.getByText('Scanning…')).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: `${SHOTS}/scanning.png` })
    await page.getByRole('button', { name: 'Type code' }).click()
    await expect(page.getByRole('heading', { name: 'Type the voucher code' })).toBeVisible()
    await page.getByRole('button', { name: 'Use camera' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page).toHaveURL(/\/home$/)
  })
})

test.describe('permission denied', () => {
  test('P3-3 blocked screen has 3 browser tabs and fallbacks; Try again stays blocked', async ({ page }) => {
    await page.addInitScript(`
      const q = navigator.permissions.query.bind(navigator.permissions)
      navigator.permissions.query = (d) => d.name === 'camera' ? Promise.resolve({ state: 'denied', onchange: null }) : q(d)
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('no', 'NotAllowedError'))
    `)
    await logIn(page)
    await toPay(page)
    await expect(page.getByRole('heading', { name: 'Camera is blocked' })).toBeVisible()
    for (const n of ['Chrome (Android)', 'Safari (iPhone)', 'Samsung Internet']) {
      const tab = page.getByRole('tab', { name: n })
      await expect(tab).toBeVisible()
      expect(await h(tab)).toBeGreaterThanOrEqual(48)
    }
    await page.getByRole('tab', { name: 'Safari (iPhone)' }).click()
    await expect(page.getByText('Website Settings')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Type the code' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Choose a screenshot' })).toBeVisible()
    expect(await noHScroll(page)).toBe(true)
    await page.screenshot({ path: `${SHOTS}/blocked.png`, fullPage: true })
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByText('The camera is still blocked.')).toBeVisible()
  })
})

test('P3 phase boundary: no Phase 4 routes or redeem screens', async ({ page }) => {
  await logIn(page)
  await page.goto('/pay/success/x')
  await expect(page.getByText('Payment confirmed')).toHaveCount(0)
})
