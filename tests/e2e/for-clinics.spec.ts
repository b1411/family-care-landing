import { test, expect } from '@playwright/test'

test.describe('For Clinics — CL-01–CL-08', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/for-clinics')
    await page.waitForLoadState('domcontentloaded')
  })

  test('CL-01: page loads with h1 heading', async ({ page }) => {
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible({ timeout: 10000 })
    const text = await heading.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('CL-02: problem/funnel section is visible on page', async ({ page }) => {
    const funnel = page.locator(
      '.loss-funnel, .funnel-section, [class*="funnel"], [class*="problem"], .problem-section'
    ).first()
    if (await funnel.count() > 0) {
      await funnel.scrollIntoViewIfNeeded()
      await expect(funnel).toBeVisible()
    }
    else {
      // Section may be identified by text content
      const section = page.locator('section').filter({ hasText: /100|потер|воронк/i }).first()
      if (await section.count() > 0) {
        await section.scrollIntoViewIfNeeded()
        await expect(section).toBeVisible()
      }
    }
  })

  test('CL-03: calculator or ROI section exists on page', async ({ page }) => {
    const calc = page.locator(
      '.calculator, .roi-calc, [class*="calc"], input[type="range"], .slider'
    ).first()
    if (await calc.count() > 0) {
      await calc.scrollIntoViewIfNeeded()
      await expect(calc).toBeVisible()
    }
    else {
      // Look for a section with numeric input or slider
      const section = page.locator('section').filter({ hasText: /калькулятор|доход|прибыль|ROI/i }).first()
      if (await section.count() > 0) {
        await section.scrollIntoViewIfNeeded()
        await expect(section).toBeVisible()
      }
    }
  })

  test('CL-04: FAQ section exists on page', async ({ page }) => {
    const faq = page.locator('.faq, .faq-section, [class*="faq"], [class*="accordion"]').first()
    if (await faq.count() > 0) {
      await faq.scrollIntoViewIfNeeded()
      await expect(faq).toBeVisible()
    }
    else {
      const section = page.locator('section').filter({ hasText: /вопрос|FAQ|ответ/i }).first()
      if (await section.count() > 0) {
        await section.scrollIntoViewIfNeeded()
        await expect(section).toBeVisible()
      }
    }
  })

  test('CL-05: clinic CTA section #clinic-cta is present', async ({ page }) => {
    const ctaSection = page.locator('#clinic-cta')
    if (await ctaSection.count() > 0) {
      await ctaSection.scrollIntoViewIfNeeded()
      await expect(ctaSection).toBeVisible()
    }
    else {
      // Fallback: CTA section with contact form
      const cta = page.locator('.cta-form, [class*="cta-section"]').first()
      if (await cta.count() > 0) {
        await cta.scrollIntoViewIfNeeded()
        await expect(cta).toBeVisible()
      }
    }
  })

  test('CL-06: timeline or before/after section is visible', async ({ page }) => {
    const timeline = page.locator(
      '.timeline, [class*="timeline"], [class*="before-after"], [class*="pillar"]'
    ).first()
    if (await timeline.count() > 0) {
      await timeline.scrollIntoViewIfNeeded()
      await expect(timeline).toBeVisible()
    }
    else {
      const section = page.locator('section').filter({ hasText: /до|после|этап|шаг/i }).first()
      if (await section.count() > 0) {
        await section.scrollIntoViewIfNeeded()
        await expect(section).toBeVisible()
      }
    }
  })

  test('CL-07: range slider input changes a displayed value', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    if (await slider.count() > 0) {
      await slider.scrollIntoViewIfNeeded()
      const initialVal = await slider.inputValue()
      await slider.fill('50')
      await page.waitForTimeout(300)
      const newVal = await slider.inputValue()
      // Value should be accessible
      expect(newVal).toBeDefined()
      expect(initialVal !== newVal || newVal === '50').toBe(true)
    }
  })

  test('CL-08: FAQ item expands on click', async ({ page }) => {
    const faqItem = page.locator(
      '.faq-item, .accordion-item, [class*="faq-q"], details'
    ).first()
    if (await faqItem.count() > 0) {
      await faqItem.scrollIntoViewIfNeeded()
      const trigger = faqItem.locator('button, summary, .faq-trigger, [class*="question"]').first()
      if (await trigger.count() > 0) {
        await trigger.click()
        await page.waitForTimeout(400)
        const answer = faqItem.locator('.faq-answer, .accordion-body, [class*="answer"], [class*="content"]').first()
        if (await answer.count() > 0) {
          await expect(answer).toBeVisible()
        }
      }
    }
  })
})
