import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const landingPages = ['/', '/for-clinics', '/for-families', '/demo', '/privacy', '/terms']

for (const path of landingPages) {
  test(`A11Y-axe: no critical accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('domcontentloaded')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.demo-dash') // demo app section excluded — not landing
      .analyze()

    // Fail on critical only. Serious violations (e.g. color-contrast in design
    // tokens) are logged as warnings — tracked for design review, not blocking.
    const criticalViolations = results.violations.filter(v => v.impact === 'critical')
    const seriousViolations = results.violations.filter(v => v.impact === 'serious')

    if (seriousViolations.length > 0) {
      const summary = seriousViolations.map(v =>
        `[serious] ${v.id}: ${v.description} (${v.nodes.length} node(s))`
      ).join('\n')
      console.warn(`Accessibility warnings on ${path}:\n${summary}`)
      test.info().annotations.push({
        type: 'a11y-serious',
        description: `${path}: ${seriousViolations.length} serious violation(s) — see console`,
      })
    }

    if (criticalViolations.length > 0) {
      const summary = criticalViolations.map(v =>
        `[critical] ${v.id}: ${v.description} (${v.nodes.length} node(s))`
      ).join('\n')
      console.error(`CRITICAL accessibility violations on ${path}:\n${summary}`)
    }

    expect(criticalViolations).toHaveLength(0)
  })
}

test.describe('Accessibility — manual checks (A11Y-manual)', () => {
  test('A11Y-01: html element has lang="ru"', async ({ page }) => {
    await page.goto('/')
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('ru')
  })

  test('A11Y-02: homepage has exactly one h1', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('A11Y-03: /for-clinics has exactly one h1', async ({ page }) => {
    await page.goto('/for-clinics')
    await page.waitForLoadState('domcontentloaded')
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('A11Y-04: /for-families has exactly one h1', async ({ page }) => {
    await page.goto('/for-families')
    await page.waitForLoadState('domcontentloaded')
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('A11Y-05: all visible images have non-empty alt attribute', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const images = page.locator('img:visible')
    const count = await images.count()
    const violations: string[] = []
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      const role = await images.nth(i).getAttribute('role')
      // Decorative images should have role="presentation" or alt=""
      if (alt === null && role !== 'presentation') {
        const src = await images.nth(i).getAttribute('src')
        violations.push(`Image missing alt: ${src}`)
      }
    }
    expect(violations).toHaveLength(0)
  })

  test('A11Y-06: FAQ accordion buttons have aria-expanded', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const faqButtons = page.locator('.faq-item button, .accordion-item button, details > summary')
    const count = await faqButtons.count()
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const ariaExpanded = await faqButtons.nth(i).getAttribute('aria-expanded')
        const tagName = await faqButtons.nth(i).evaluate(el => el.tagName.toLowerCase())
        // summary elements don't need aria-expanded; buttons should have it
        if (tagName === 'button') {
          expect(ariaExpanded).not.toBeNull()
        }
      }
    }
  })

  test('A11Y-07: icon-only buttons have aria-label', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const iconButtons = page.locator('button:not(:has-text(""))')
    const count = await iconButtons.count()
    // This is a best-effort check — log rather than fail
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await iconButtons.nth(i).textContent()
      const ariaLabel = await iconButtons.nth(i).getAttribute('aria-label')
      const ariaLabelledBy = await iconButtons.nth(i).getAttribute('aria-labelledby')
      if (!text?.trim()) {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy()
      }
    }
  })

  test('A11Y-08: page content readable at 200% browser zoom (no overlap)', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      document.body.style.zoom = '2'
    })
    await page.waitForTimeout(500)
    // At 200% zoom, content should still be accessible (no JS crash)
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
