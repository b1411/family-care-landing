import { test, expect } from '@playwright/test'

test.describe('Navigation — NAV-01–NAV-10', () => {
  test('NAV-01: logo click navigates to /', async ({ page }) => {
    await page.goto('/for-clinics')
    const logo = page.locator('a[href="/"], .logo, .navbar-logo, .nav-logo, .brand-logo').first()
    await logo.click()
    await page.waitForURL('/', { timeout: 10000 })
    expect(page.url()).toMatch(/\/$/)
  })

  test('NAV-02: /for-families link present in navigation', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('header a[href="/for-families"], nav a[href="/for-families"]').first()
    await expect(link).toBeVisible({ timeout: 10000 })
  })

  test('NAV-03: /for-clinics link present in navigation', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('header a[href="/for-clinics"], nav a[href="/for-clinics"]').first()
    await expect(link).toBeVisible({ timeout: 10000 })
  })

  test('NAV-04: /demo link present in navigation', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('header a[href="/demo"], nav a[href="/demo"]').first()
    await expect(link).toBeVisible({ timeout: 10000 })
  })

  test('NAV-05: header remains visible after scroll', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.evaluate(() => window.scrollTo(0, 800))
    await page.waitForTimeout(500)
    const header = page.locator('header, nav, .navbar, .nav-bar').first()
    await expect(header).toBeVisible()
  })

  test('NAV-06: burger/hamburger menu button visible at 767px width', async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 812 })
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const burger = page.locator(
      '.burger, .hamburger, .menu-toggle, button[aria-label*="меню"], button[aria-label*="menu"], .nav-burger, [class*="burger"], [class*="hamburger"]'
    ).first()
    await expect(burger).toBeVisible({ timeout: 10000 })
  })

  test('NAV-07: burger menu opens on click (aria-label toggles)', async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 812 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const burger = page.locator('.navbar-burger').first()
    await expect(burger).toBeVisible()

    const labelBefore = await burger.getAttribute('aria-label')
    await burger.click()
    await page.waitForTimeout(500)
    const labelAfter = await burger.getAttribute('aria-label')
    expect(labelBefore).not.toBe(labelAfter)

    // The mobile menu should now be visible
    await expect(page.locator('.mobile-menu').first()).toBeVisible()
  })

  test('NAV-08: Tab key can reach first nav link', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused)
  })

  test('NAV-09: #contact anchor section is reachable', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const contactSection = page.locator('#contact')
    await contactSection.scrollIntoViewIfNeeded()
    await expect(contactSection).toBeVisible({ timeout: 10000 })
  })

  test('NAV-10: clicking /for-clinics nav link navigates to page', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('header a[href="/for-clinics"], nav a[href="/for-clinics"]').first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/for-clinics/, { timeout: 10000 })
      expect(page.url()).toContain('/for-clinics')
    }
  })
})

test.describe('Footer — FOOT-01–FOOT-03', () => {
  const pages = ['/', '/for-clinics', '/for-families']

  for (const path of pages) {
    test(`FOOT-01: footer is visible on ${path}`, async ({ page }) => {
      await page.goto(path)
      const footer = page.locator('footer, .footer, .landing-footer, .site-footer').first()
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toBeVisible({ timeout: 10000 })
    })
  }

  test('FOOT-02: footer has mailto: or tel: contact link', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer, .footer, .landing-footer').first()
    await footer.scrollIntoViewIfNeeded()
    const contactLink = footer.locator('a[href^="mailto:"], a[href^="tel:"]').first()
    await expect(contactLink).toBeVisible({ timeout: 10000 })
  })

  test('FOOT-03: footer has links to /privacy and /terms', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer, .footer, .landing-footer').first()
    await footer.scrollIntoViewIfNeeded()
    await expect(footer.locator('a[href="/privacy"], a[href*="privacy"]').first()).toBeVisible({ timeout: 10000 })
    await expect(footer.locator('a[href="/terms"], a[href*="terms"]').first()).toBeVisible({ timeout: 10000 })
  })
})
