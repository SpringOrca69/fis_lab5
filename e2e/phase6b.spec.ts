import { expect, test, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log in with Singpass (demo)' }).click()
  await expect(page).toHaveURL(/\/home/)
}

test('P6-6 video cards: duration, caption track follows app language', async ({ page }) => {
  await login(page)
  await page.goto('/help')
  await page.getByTestId('video-accept').getByRole('button', { name: /Play/ }).click()
  await expect(page.locator('video track')).toHaveAttribute('src', '/captions/accept.en.vtt')
  await page.getByRole('button', { name: /中文|简体/ }).first().click()
  await expect(page.locator('video track')).toHaveAttribute('src', '/captions/accept.zh.vtt')
  await expect(page.locator('video track')).toHaveAttribute('srclang', 'zh')
})

test('P6-6 offline: videos show "Needs internet" and are disabled', async ({ page }) => {
  await login(page)
  await page.evaluate(() => localStorage.setItem('heartpay:simOffline', '1'))
  await page.goto('/help')
  for (const id of ['accept', 'fail']) {
    const card = page.getByTestId(`video-${id}`)
    await expect(card).toContainText(/\d:\d\d/)
    await expect(card.getByRole('button', { name: 'Needs internet' })).toBeDisabled()
  }
})

test('help entry points all land on /help', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Trouble logging in?' }).click()
  await expect(page).toHaveURL(/\/help$/)
  await login(page)
  await page.getByRole('link', { name: /Get help/ }).click()
  await expect(page).toHaveURL(/\/help$/)
})

test('vibration off: success screen does not vibrate; on: it does', async ({ page }) => {
  await page.addInitScript('Object.defineProperty(navigator, "userActivation", { value: { hasBeenActive: true } }); window.__v = 0; navigator.vibrate = () => { window.__v++; return true }')
  await login(page)
  const id = await page.evaluate(() => JSON.parse(localStorage.getItem('heartpay:v1')!).transactions[0].id)
  for (const on of [false, true]) {
    await page.evaluate((v) => {
      const s = JSON.parse(localStorage.getItem('heartpay:v1')!)
      s.settings.hapticsOn = v
      localStorage.setItem('heartpay:v1', JSON.stringify(s))
    }, on)
    await page.goto(`/pay/success/${id}`)
    await page.waitForTimeout(500)
    const n = await page.evaluate('window.__v')
    if (on) expect(n).toBeGreaterThan(0)
    else expect(n).toBe(0)
  }
})
