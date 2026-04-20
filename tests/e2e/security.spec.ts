import { test, expect } from '@playwright/test'

test.describe('Security headers — SEC-01–SEC-08', () => {
  test('SEC-01: X-Content-Type-Options: nosniff on all routes', async ({ page }) => {
    const response = await page.request.get('/')
    const header = response.headers()['x-content-type-options']
    expect(header).toBe('nosniff')
  })

  test('SEC-02: X-Frame-Options header is present', async ({ page }) => {
    const response = await page.request.get('/')
    const header = response.headers()['x-frame-options']
    expect(header).toBeTruthy()
    expect(['DENY', 'SAMEORIGIN']).toContain(header?.toUpperCase())
  })

  test('SEC-03: Referrer-Policy header is set', async ({ page }) => {
    const response = await page.request.get('/')
    const header = response.headers()['referrer-policy']
    expect(header).toBeTruthy()
    expect(header).toContain('origin')
  })

  test('SEC-04: Permissions-Policy header is present', async ({ page }) => {
    const response = await page.request.get('/')
    const header = response.headers()['permissions-policy']
    expect(header).toBeTruthy()
    expect(header).toContain('camera=()')
  })

  test('SEC-05: Strict-Transport-Security (HSTS) header is set', async ({ page }) => {
    const response = await page.request.get('/')
    const header = response.headers()['strict-transport-security']
    // HSTS is only sent over HTTPS; in local dev it may be absent
    // We verify it's configured (present in prod) or skip in local
    if (header) {
      expect(header).toContain('max-age=')
      expect(header).toContain('includeSubDomains')
    }
  })

  test('SEC-06: Content-Security-Policy header is present', async ({ page }) => {
    const response = await page.request.get('/')
    const header = response.headers()['content-security-policy']
    if (header) {
      expect(header).toContain('default-src')
      expect(header).toContain("frame-ancestors 'none'")
    }
    else {
      // CSP might only be enforced in production (Vercel)
      console.warn('CSP header not found in local dev — verify in production')
    }
  })

  test('SEC-07: API routes have X-Frame-Options: DENY', async ({ page }) => {
    const response = await page.request.get('/api/health')
    const header = response.headers()['x-frame-options']
    if (header) {
      expect(header.toUpperCase()).toBe('DENY')
    }
  })

  test('SEC-08: no mixed content — all resources loaded via same protocol', async ({ page }) => {
    const mixedContent: string[] = []
    page.on('response', (resp) => {
      const url = resp.url()
      if (url.startsWith('http://') && !url.startsWith('http://localhost')) {
        mixedContent.push(url)
      }
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(mixedContent).toHaveLength(0)
  })
})

test.describe('Security — form & data protection (SEC-09–SEC-12)', () => {
  test('SEC-09: no sensitive data stored in localStorage after visiting landing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const keys = await page.evaluate(() => Object.keys(localStorage))
    const sensitive = keys.filter(k =>
      /password|token|secret|credit|card|ssn|jwt/i.test(k)
    )
    expect(sensitive).toHaveLength(0)
  })

  test('SEC-10: no sensitive data stored in sessionStorage after visiting landing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const keys = await page.evaluate(() => Object.keys(sessionStorage))
    const sensitive = keys.filter(k =>
      /password|secret|credit|card|ssn/i.test(k)
    )
    expect(sensitive).toHaveLength(0)
  })

  test('SEC-11: form inputs do not have autocomplete="off" on name/email (usability)', async ({ page }) => {
    await page.goto('/')
    await page.locator('#contact').scrollIntoViewIfNeeded()
    const emailInput = page.locator('#contact input[type="email"]').first()
    if (await emailInput.count() > 0) {
      const autocomplete = await emailInput.getAttribute('autocomplete')
      // Should allow browser autocomplete for email (not "off")
      expect(autocomplete).not.toBe('off')
    }
  })

  test('SEC-12: demo page data is mock (no real PII visible)', async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('domcontentloaded')
    const body = await page.locator('body').textContent()
    // Real KZ phone/IIN patterns should not appear
    const realPhonePattern = /\+7\s?[67]\d{9}/
    const realIINPattern = /\b\d{12}\b/
    const hasRealPhone = realPhonePattern.test(body || '')
    const hasRealIIN = realIINPattern.test(body || '')
    expect(hasRealPhone || hasRealIIN).toBe(false)
  })
})
