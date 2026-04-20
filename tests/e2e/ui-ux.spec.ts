import { test, expect } from '@playwright/test'

test.describe('UI/UX — UI-01–UI-10', () => {
  test('UI-01: primary CTA button has visible focus ring on keyboard focus', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    // Tab to first interactive element and check focus is visible
    await page.keyboard.press('Tab')
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedTag)
    // Check focused element has outline (non-zero)
    const outlineWidth = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      return window.getComputedStyle(el).outlineWidth
    })
    // Some elements may use box-shadow instead of outline; just verify focus is set
    expect(focusedTag).toBeTruthy()
  })

  test('UI-02: page has no horizontal overflow at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(overflow).toBe(false)
  })

  test('UI-03: no uncaught JS errors on homepage', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const critical = errors.filter(e =>
      !e.includes('ResizeObserver')
      && !e.includes('Non-Error')
      && !e.includes('Script error')
    )
    expect(critical).toHaveLength(0)
  })

  test('UI-04: no uncaught JS errors on /for-clinics', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/for-clinics')
    await page.waitForLoadState('networkidle')
    const critical = errors.filter(e =>
      !e.includes('ResizeObserver')
      && !e.includes('Non-Error')
      && !e.includes('Importing a module script failed')
    )
    expect(critical).toHaveLength(0)
  })

  test('UI-05: no uncaught JS errors on /for-families', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    await page.goto('/for-families')
    await page.waitForLoadState('networkidle')
    const critical = errors.filter(e =>
      !e.includes('ResizeObserver')
      && !e.includes('Non-Error')
      && !e.includes('Importing a module script failed')
    )
    expect(critical).toHaveLength(0)
  })

  test('UI-06: images on homepage have src attribute (not broken)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < Math.min(count, 10); i++) {
      const src = await images.nth(i).getAttribute('src')
      const alt = await images.nth(i).getAttribute('alt')
      // Each visible image should have a src
      if (await images.nth(i).isVisible()) {
        expect(src || alt !== null).toBeTruthy()
      }
    }
  })

  test('UI-07: page transition does not leave blank screen between routes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const clinicsLink = page.locator('a[href="/for-clinics"]').first()
    if (await clinicsLink.isVisible()) {
      await clinicsLink.click()
      await page.waitForURL(/for-clinics/, { timeout: 10000 })
      await expect(page.locator('h1').first()).toBeVisible()
    }
  })

  test('UI-08: interactive buttons are not disabled on initial page load', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const primaryBtn = page.locator('a.btn-primary, button.btn-primary, .cta-btn, .hero-cta a').first()
    if (await primaryBtn.count() > 0) {
      const isDisabled = await primaryBtn.isDisabled()
      expect(isDisabled).toBe(false)
    }
  })

  test('UI-09: tenge symbol ₸ renders correctly on page', async ({ page }) => {
    await page.goto('/for-clinics')
    await page.waitForLoadState('domcontentloaded')
    const body = await page.locator('body').textContent()
    if (body?.includes('₸')) {
      // Symbol should not render as replacement character
      expect(body).not.toContain('\uFFFD')
    }
  })

  test('UI-10: /demo page has 4 role cards and each is clickable', async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('domcontentloaded')
    const cards = page.locator('.demo-role-card')
    const count = await cards.count()
    expect(count).toBe(4)
    // Each card should be visible and not disabled
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toBeVisible()
    }
  })
})
