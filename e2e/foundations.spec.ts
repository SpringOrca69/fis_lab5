import { expect, test } from '@playwright/test'

test('stub page shows seeded totals, switches language, persists, no overflow', async ({ page }) => {
  await page.goto('/home')
  await expect(page.getByText('$75.00')).toBeVisible()
  await expect(page.getByText('5 payments')).toBeVisible()
  await expect(page.getByText('Paid to your bank tonight at midnight')).toBeVisible()
  await expect(page.getByText('Not matched, $5.00 missing')).toBeVisible()
  await expect(page.getByText('Concept prototype. Not affiliated with CDC or GovTech.')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.screenshot({ path: 'reviews/screenshots/phase-1/home-en.png', fullPage: true })

  for (const [lang, name] of [['zh', '中文'], ['ms', 'Bahasa Melayu'], ['ta', 'தமிழ்']] as const) {
    await page.getByRole('button', { name }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    expect(await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')).toBe(true)
    await page.screenshot({ path: `reviews/screenshots/phase-1/home-${lang}.png`, fullPage: true })
  }
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ta')
  await expect(page.getByRole('button', { name: 'தமிழ்' })).toHaveAttribute('aria-pressed', 'true')
  expect(await page.evaluate("localStorage.getItem('heartpay:v1')")).not.toBeNull()
})

test('tap targets: nav >=56px, language tiles >=64px, bell >=48px; deep links work', async ({ page }) => {
  await page.goto('/home')
  const h = async (loc: ReturnType<typeof page.locator>) => (await loc.boundingBox())!.height
  for (const a of await page.locator('nav a').all()) expect(await h(a)).toBeGreaterThanOrEqual(56)
  for (const b of await page.locator('section[aria-labelledby=lang-h] button').all()) expect(await h(b)).toBeGreaterThanOrEqual(64)
  const bell = page.getByRole('link', { name: /Notifications/ })
  const box = (await bell.boundingBox())!
  expect(box.width).toBeGreaterThanOrEqual(48)
  expect(box.height).toBeGreaterThanOrEqual(48)
  expect(await page.evaluate('getComputedStyle(document.documentElement).fontSize')).toBe('18px')
  for (const p of ['/pay', '/history', '/payouts', '/stall', '/notifications']) {
    await page.goto(p)
    await expect(page.locator('main')).toBeVisible()
  }
})
