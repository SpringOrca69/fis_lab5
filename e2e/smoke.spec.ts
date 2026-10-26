import { expect, test } from '@playwright/test'

test('app renders at / with no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()
  expect(errors).toEqual([])
})
