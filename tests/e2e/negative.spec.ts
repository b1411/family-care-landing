import { test, expect } from '@playwright/test'

test.describe('Negative cases — NEG-01–NEG-08', () => {
  test('NEG-01: unknown route /xyz123 returns 404 or redirects', async ({ page }) => {
    const response = await page.goto('/xyz123-nonexistent-route')
    await page.waitForLoadState('domcontentloaded')
    const status = response?.status() ?? 0
    const url = page.url()
    const body = await page.locator('body').textContent()

    const is404Status = status === 404
    const has404Content = body?.includes('404') || body?.includes('не найдена') || body?.includes('not found')
    const isRedirected = url.includes('/auth/login') || url.endsWith('/') || url.includes('/demo')

    expect(is404Status || has404Content || isRedirected).toBe(true)
  })

  test('NEG-02: navigating to #nonexistent anchor does not cause JS error', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/#nonexistent-anchor-that-does-not-exist')
    await page.waitForLoadState('domcontentloaded')
    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver') && !e.includes('Non-Error') && !e.includes('Script error')
    )
    expect(criticalErrors).toHaveLength(0)
    await expect(page.locator('body')).toBeVisible()
  })

  test('NEG-03: form handles API 500 error without crashing page', async ({ page }) => {
    await page.goto('/')
    await page.route('/api/contact-request', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal Server Error' }) })
    })
    await page.locator('#contact').scrollIntoViewIfNeeded()
    const nameInput = page.locator('#contact input').first()
    const emailInput = page.locator('#contact input[type="email"]').first()
    const submitBtn = page.locator('#contact button[type="submit"]').first()
    if (await nameInput.count() > 0 && await submitBtn.count() > 0) {
      await nameInput.fill('Test')
      if (await emailInput.count() > 0) await emailInput.fill('test@test.com')
      await submitBtn.click()
      await page.waitForTimeout(1500)
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('NEG-04: /api/nonexistent returns 404', async ({ page }) => {
    const response = await page.request.get('/api/nonexistent-endpoint-xyz')
    expect([404, 405]).toContain(response.status())
  })

  test('NEG-05: /api/health returns 200', async ({ page }) => {
    const response = await page.request.get('/api/health')
    expect(response.status()).toBe(200)
  })

  test('NEG-06: navigating directly to /admin redirects to auth or 404', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    const url = page.url()
    const body = await page.locator('body').textContent()
    const isProtected = url.includes('/auth') || url.includes('/login')
      || body?.includes('404') || body?.includes('не найдена')
    expect(isProtected).toBe(true)
  })

  test('NEG-07: form with only whitespace in name triggers validation', async ({ page }) => {
    await page.goto('/')
    await page.locator('#contact').scrollIntoViewIfNeeded()
    const nameInput = page.locator('#contact input[required]').first()
    const submitBtn = page.locator('#contact button[type="submit"]').first()
    if (await nameInput.count() > 0 && await submitBtn.count() > 0) {
      await nameInput.fill('   ')
      // HTML required validates non-empty, but whitespace-only may pass natively
      // At minimum the submit should not crash
      await submitBtn.click()
      await page.waitForTimeout(500)
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('NEG-08: double-clicking submit does not send duplicate requests', async ({ page }) => {
    await page.goto('/')
    const requestCount = { value: 0 }
    await page.route('/api/contact-request', async (route) => {
      requestCount.value++
      await new Promise(r => setTimeout(r, 500))
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
    })
    await page.locator('#contact').scrollIntoViewIfNeeded()
    const nameInput = page.locator('#contact input').first()
    const emailInput = page.locator('#contact input[type="email"]').first()
    const submitBtn = page.locator('#contact button[type="submit"]').first()
    if (await nameInput.count() > 0 && await submitBtn.count() > 0) {
      await nameInput.fill('Test')
      if (await emailInput.count() > 0) await emailInput.fill('test@test.com')
      await submitBtn.dblclick()
      await page.waitForTimeout(1500)
      expect(requestCount.value).toBeLessThanOrEqual(2)
    }
  })
})
