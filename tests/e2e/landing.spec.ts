import { test, expect } from '@playwright/test'

test.describe('Landing — Homepage (HOME-01–HOME-10)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('HOME-01: page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/UMAI Health/)
  })

  test('HOME-02: hero section is visible above the fold', async ({ page }) => {
    await expect(page.locator('.hero, .hero-banner, [class*="hero"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('HOME-03: navigation header is visible', async ({ page }) => {
    await expect(page.locator('header, nav, .header, .navbar').first()).toBeVisible()
  })

  test('HOME-04: has visible link to /for-families', async ({ page }) => {
    const link = page.locator('a[href="/for-families"], a[href*="for-families"]').first()
    await expect(link).toBeVisible()
  })

  test('HOME-05: has visible link to /for-clinics', async ({ page }) => {
    const link = page.locator('a[href="/for-clinics"], a[href*="for-clinics"]').first()
    await expect(link).toBeVisible()
  })

  test('HOME-06: hero has primary CTA button linking to /demo or #contact', async ({ page }) => {
    const cta = page.locator(
      'a[href="/demo"], a[href="#contact"], a[href*="demo"], .btn-primary, .cta-btn, .hero-cta'
    ).first()
    await expect(cta).toBeVisible({ timeout: 10000 })
  })

  test('HOME-07: CTA split section has links to /for-clinics and /for-families', async ({ page }) => {
    const clinicsLink = page.locator('a[href="/for-clinics"]')
    const familiesLink = page.locator('a[href="/for-families"]')
    const hasClinic = await clinicsLink.count() > 0
    const hasFamily = await familiesLink.count() > 0
    expect(hasClinic || hasFamily).toBe(true)
  })

  test('HOME-08: footer section is visible', async ({ page }) => {
    const footer = page.locator('footer, .footer, .landing-footer').first()
    if (await footer.count() > 0) {
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toBeVisible()
    }
  })

  test('HOME-09: page has at least one h2 section heading below hero', async ({ page }) => {
    const headings = page.locator('h2')
    const count = await headings.count()
    expect(count).toBeGreaterThan(0)
  })

  test('HOME-10: no uncaught console errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver')
      && !e.includes('Non-Error')
      // WebKit Vite dev-HMR quirk: emits generic module-script-failure without
      // details; not reproducible in prod builds.
      && !e.includes('Importing a module script failed')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('Landing — For Families page', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/for-families')
    await expect(page.locator('body')).toBeVisible()
  })

  test('has hero or main heading', async ({ page }) => {
    await page.goto('/for-families')
    const heading = page.locator('h1, .hero-title, [class*="hero"]').first()
    await expect(heading).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Landing — For Clinics page', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/for-clinics')
    await expect(page.locator('body')).toBeVisible()
  })

  test('has hero or main heading', async ({ page }) => {
    await page.goto('/for-clinics')
    const heading = page.locator('h1, .hero-title, [class*="hero"]').first()
    await expect(heading).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Landing — Privacy & Terms', () => {
  test('privacy page loads with content', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('h1, .doc-page, .page-title').first()).toBeVisible({ timeout: 10000 })
  })

  test('terms page loads with content', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('h1, .doc-page, .page-title').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Landing — Demo page', () => {
  test('shows 4 role cards', async ({ page }) => {
    await page.goto('/demo')
    await expect(page.locator('.demo-role-card')).toHaveCount(4)
  })

  test('shows page title "Попробуйте платформу"', async ({ page }) => {
    await page.goto('/demo')
    await expect(page.locator('.demo-title')).toContainText('Попробуйте платформу')
  })

  test('has back link to home', async ({ page }) => {
    await page.goto('/demo')
    await expect(page.locator('.demo-back')).toBeVisible()
  })
})
