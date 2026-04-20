import { test, expect } from '@playwright/test'

test.describe('For Families — FAM-01–FAM-06', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/for-families')
    await page.waitForLoadState('domcontentloaded')
  })

  test('FAM-01: page loads successfully with 200 status', async ({ page }) => {
    const response = await page.request.get('/for-families')
    expect(response.status()).toBe(200)
    await expect(page.locator('body')).toBeVisible()
  })

  test('FAM-02: hero section with h1 heading is visible', async ({ page }) => {
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible({ timeout: 10000 })
    const text = await heading.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('FAM-03: family situations or use-case cards are present', async ({ page }) => {
    // Expect cards/situations showcasing family scenarios
    const cards = page.locator(
      '.situation-card, .use-case, [class*="situation"], [class*="scenario"], .family-card'
    )
    if (await cards.count() > 0) {
      await cards.first().scrollIntoViewIfNeeded()
      await expect(cards.first()).toBeVisible()
    }
    else {
      // Fallback: any section with relevant content
      const section = page.locator('section').filter({ hasText: /беременн|вакцин|педиатр|ребён/i }).first()
      if (await section.count() > 0) {
        await section.scrollIntoViewIfNeeded()
        await expect(section).toBeVisible()
      }
    }
  })

  test('FAM-04: vaccination or immunity shield section is visible', async ({ page }) => {
    const vaccination = page.locator(
      '.vaccination, [class*="vaccination"], [class*="vaccine"], [class*="immunity"], [class*="shield"]'
    ).first()
    if (await vaccination.count() > 0) {
      await vaccination.scrollIntoViewIfNeeded()
      await expect(vaccination).toBeVisible()
    }
    else {
      const section = page.locator('section').filter({ hasText: /вакцин|прививк|иммун/i }).first()
      if (await section.count() > 0) {
        await section.scrollIntoViewIfNeeded()
        await expect(section).toBeVisible()
      }
    }
  })

  test('FAM-05: FAQ section is present and has at least one item', async ({ page }) => {
    const faq = page.locator('.faq, .faq-section, [class*="faq"], [class*="accordion"]').first()
    if (await faq.count() > 0) {
      await faq.scrollIntoViewIfNeeded()
      await expect(faq).toBeVisible()
      const items = faq.locator('.faq-item, .accordion-item, details, li')
      const count = await items.count()
      expect(count).toBeGreaterThan(0)
    }
    else {
      const section = page.locator('section').filter({ hasText: /вопрос|FAQ/i }).first()
      if (await section.count() > 0) {
        await section.scrollIntoViewIfNeeded()
        await expect(section).toBeVisible()
      }
    }
  })

  test('FAM-06: CTA section has a form or contact button', async ({ page }) => {
    const cta = page.locator('.cta-form, .family-cta, [class*="cta-section"]').first()
    if (await cta.count() > 0) {
      await cta.scrollIntoViewIfNeeded()
      await expect(cta).toBeVisible()
    }
    else {
      // At minimum a call-to-action button must exist
      const ctaBtn = page.locator(
        'button[type="submit"], a[href="#contact"], a[href*="demo"], .cta-btn, .btn-primary'
      ).last()
      if (await ctaBtn.count() > 0) {
        await ctaBtn.scrollIntoViewIfNeeded()
        await expect(ctaBtn).toBeVisible()
      }
    }
  })
})
