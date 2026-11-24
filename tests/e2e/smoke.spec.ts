import { test, expect } from '@playwright/test'

// These tests need no database or API key: they only cover pages and
// redirects that work for signed-out users.

test('landing page links to evaluation and sign-in', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('link', { name: 'Start Evaluating' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in' }).first()).toBeVisible()
})

for (const path of ['/evaluate', '/history', '/dashboard']) {
  test(`signed-out users are redirected from ${path} to /sign-in`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveURL(/\/sign-in$/)
  })
}

test('evaluate API rejects unauthenticated requests', async ({ request }) => {
  const res = await request.post('/api/evaluate', {
    data: { userPrompt: 'Write an email to my boss' },
  })
  expect(res.status()).toBe(401)
})
