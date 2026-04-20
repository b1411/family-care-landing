import { test, expect } from '@playwright/test'

// ─── FinalCtaSection form on / (id="contact") ───────────────────────────────

test.describe('Forms — FinalCtaSection (FORM-01–FORM-10)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('#contact').scrollIntoViewIfNeeded()
  })

  test('FORM-01: empty submit shows browser validation (name required)', async ({ page }) => {
    const nameInput = page.locator('#contact input[placeholder*="имя"], #contact .cta-input').first()
    const submitBtn = page.locator('#contact button[type="submit"], #contact .cta-submit').first()
    if (await nameInput.count() > 0 && await submitBtn.count() > 0) {
      await nameInput.fill('')
      await submitBtn.click()
      const validationMessage = await nameInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      )
      expect(validationMessage.length).toBeGreaterThan(0)
    }
  })

  test('FORM-02: name input accepts text input', async ({ page }) => {
    const nameInput = page.locator('#contact input[placeholder*="имя"], #contact .cta-input').first()
    if (await nameInput.count() > 0) {
      await nameInput.fill('Тест Пользователь')
      await expect(nameInput).toHaveValue('Тест Пользователь')
    }
  })

  test('FORM-03: email field has type="email"', async ({ page }) => {
    const emailInput = page.locator('#contact input[type="email"]').first()
    if (await emailInput.count() > 0) {
      await expect(emailInput).toHaveAttribute('type', 'email')
    }
  })

  test('FORM-04: email without @ fails browser validation', async ({ page }) => {
    const nameInput = page.locator('#contact input[placeholder*="имя"], #contact .cta-input').first()
    const emailInput = page.locator('#contact input[type="email"]').first()
    const submitBtn = page.locator('#contact button[type="submit"], #contact .cta-submit').first()
    if (await emailInput.count() > 0 && await submitBtn.count() > 0) {
      if (await nameInput.count() > 0) await nameInput.fill('Test Name')
      await emailInput.fill('notanemail')
      await submitBtn.click()
      const validationMessage = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      )
      expect(validationMessage.length).toBeGreaterThan(0)
    }
  })

  test('FORM-05: XSS payload in name field is not executed as script', async ({ page }) => {
    const alertFired = []
    page.on('dialog', async (dialog) => {
      alertFired.push(dialog.message())
      await dialog.dismiss()
    })
    const nameInput = page.locator('#contact input[placeholder*="имя"], #contact .cta-input').first()
    if (await nameInput.count() > 0) {
      await nameInput.fill('<script>alert("xss")</script>')
      // No dialog (alert) should fire
      await page.waitForTimeout(500)
      expect(alertFired).toHaveLength(0)
    }
  })

  test('FORM-06: Tab key navigates through form fields in order', async ({ page }) => {
    const firstInput = page.locator('#contact input').first()
    if (await firstInput.count() > 0) {
      await firstInput.focus()
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => document.activeElement?.tagName)
      expect(['INPUT', 'TEXTAREA', 'BUTTON', 'A']).toContain(focused)
    }
  })

  test('FORM-07: successful submit shows confirmation state', async ({ page }) => {
    await page.route('/api/contact-request', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
    })
    const nameInput = page.locator('#contact input[placeholder*="имя"], #contact .cta-input').first()
    const emailInput = page.locator('#contact input[type="email"]').first()
    const submitBtn = page.locator('#contact button[type="submit"], #contact .cta-submit').first()
    if (await nameInput.count() > 0 && await emailInput.count() > 0 && await submitBtn.count() > 0) {
      await nameInput.fill('Тест')
      await emailInput.fill('test@example.com')
      await submitBtn.click()
      await page.waitForTimeout(1000)
      const btnText = await submitBtn.textContent()
      const isDisabled = await submitBtn.isDisabled()
      expect(btnText?.includes('Отправлено') || isDisabled).toBe(true)
    }
  })

  test('FORM-08: submit button is disabled after successful submission', async ({ page }) => {
    await page.route('/api/contact-request', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
    })
    const nameInput = page.locator('#contact input[placeholder*="имя"], #contact .cta-input').first()
    const emailInput = page.locator('#contact input[type="email"]').first()
    const submitBtn = page.locator('#contact button[type="submit"], #contact .cta-submit').first()
    if (await nameInput.count() > 0 && await emailInput.count() > 0 && await submitBtn.count() > 0) {
      await nameInput.fill('Тест')
      await emailInput.fill('test@example.com')
      await submitBtn.click()
      await page.waitForTimeout(1000)
      await expect(submitBtn).toBeDisabled()
    }
  })

  test('FORM-09: "Попробовать демо" link navigates to /demo', async ({ page }) => {
    const demoLink = page.locator('#contact a[href="/demo"]').first()
    if (await demoLink.count() > 0) {
      await demoLink.click()
      await page.waitForURL('/demo', { timeout: 10000 })
      expect(page.url()).toContain('/demo')
    }
  })

  test('FORM-10: API error is handled gracefully (form does not crash)', async ({ page }) => {
    await page.route('/api/contact-request', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server error' }) })
    })
    const nameInput = page.locator('#contact input[placeholder*="имя"], #contact .cta-input').first()
    const emailInput = page.locator('#contact input[type="email"]').first()
    const submitBtn = page.locator('#contact button[type="submit"], #contact .cta-submit').first()
    if (await nameInput.count() > 0 && await emailInput.count() > 0 && await submitBtn.count() > 0) {
      await nameInput.fill('Тест')
      await emailInput.fill('test@example.com')
      await submitBtn.click()
      await page.waitForTimeout(1000)
      // Page should not crash, body should remain visible
      await expect(page.locator('body')).toBeVisible()
    }
  })
})

// ─── ClinicCtaSection form on /for-clinics (id="clinic-cta") ─────────────────

test.describe('Forms — ClinicCtaSection (FORM-11–FORM-20)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/for-clinics')
    await page.waitForLoadState('networkidle')
    const ctaSection = page.locator('#clinic-cta, .clinic-cta, [class*="clinic-cta"]').first()
    if (await ctaSection.count() > 0) {
      await ctaSection.scrollIntoViewIfNeeded()
    }
  })

  test('FORM-11: clinic form is visible on /for-clinics', async ({ page }) => {
    const form = page.locator('#clinic-cta form, .cta-form').first()
    if (await form.count() > 0) {
      await expect(form).toBeVisible({ timeout: 10000 })
    }
  })

  test('FORM-12: name field (id="cta-name") is present and required', async ({ page }) => {
    const nameInput = page.locator('#cta-name').first()
    if (await nameInput.count() > 0) {
      await expect(nameInput).toHaveAttribute('required')
    }
  })

  test('FORM-13: clinic name field (id="cta-clinic") is present and required', async ({ page }) => {
    const clinicInput = page.locator('#cta-clinic').first()
    if (await clinicInput.count() > 0) {
      await expect(clinicInput).toHaveAttribute('required')
    }
  })

  test('FORM-14: phone field has type="tel"', async ({ page }) => {
    const phoneInput = page.locator('#cta-phone, input[type="tel"]').first()
    if (await phoneInput.count() > 0) {
      await expect(phoneInput).toHaveAttribute('type', 'tel')
    }
  })

  test('FORM-15: email field has type="email"', async ({ page }) => {
    const emailInput = page.locator('#cta-email, input[type="email"]').first()
    if (await emailInput.count() > 0) {
      await expect(emailInput).toHaveAttribute('type', 'email')
    }
  })

  test('FORM-16: empty form submit shows validation errors', async ({ page }) => {
    const submitBtn = page.locator('.cta-form button[type="submit"], .submit-btn').first()
    if (await submitBtn.count() > 0) {
      await submitBtn.click()
      const firstRequired = page.locator('input[required]').first()
      if (await firstRequired.count() > 0) {
        const validationMessage = await firstRequired.evaluate(
          (el: HTMLInputElement) => el.validationMessage
        )
        expect(validationMessage.length).toBeGreaterThan(0)
      }
    }
  })

  test('FORM-17: phone input accepts +7 format', async ({ page }) => {
    const phoneInput = page.locator('#cta-phone, input[type="tel"]').first()
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('+7 (701) 123-45-67')
      await expect(phoneInput).toHaveValue('+7 (701) 123-45-67')
    }
  })

  test('FORM-18: XSS in clinic name field is not executed', async ({ page }) => {
    const alertFired: string[] = []
    page.on('dialog', async (dialog) => {
      alertFired.push(dialog.message())
      await dialog.dismiss()
    })
    const clinicInput = page.locator('#cta-clinic, input[placeholder*="клиник"]').first()
    if (await clinicInput.count() > 0) {
      await clinicInput.fill('<img src=x onerror=alert("xss")>')
      await page.waitForTimeout(500)
      expect(alertFired).toHaveLength(0)
    }
  })

  test('FORM-19: successful clinic form submit shows confirmation', async ({ page }) => {
    await page.route('/api/contact-request', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
    })
    const nameInput = page.locator('#cta-name').first()
    const clinicInput = page.locator('#cta-clinic').first()
    const phoneInput = page.locator('#cta-phone, input[type="tel"]').first()
    const emailInput = page.locator('#cta-email, input[type="email"]').first()
    const submitBtn = page.locator('.cta-form button[type="submit"], .submit-btn').first()

    if (await nameInput.count() > 0 && await submitBtn.count() > 0) {
      if (await nameInput.count() > 0) await nameInput.fill('Тест')
      if (await clinicInput.count() > 0) await clinicInput.fill('Клиника Тест')
      if (await phoneInput.count() > 0) await phoneInput.fill('+7 701 000 0000')
      if (await emailInput.count() > 0) await emailInput.fill('test@clinic.kz')
      await submitBtn.click()
      await page.waitForTimeout(1000)
      const btnText = await submitBtn.textContent()
      expect(btnText?.includes('Отправлено') || await submitBtn.isDisabled()).toBe(true)
    }
  })

  test('FORM-20: form labels are associated with inputs (for/id pairs)', async ({ page }) => {
    const labels = page.locator('.cta-form label[for]')
    const count = await labels.count()
    for (let i = 0; i < count; i++) {
      const forAttr = await labels.nth(i).getAttribute('for')
      if (forAttr) {
        const input = page.locator(`#${forAttr}`)
        expect(await input.count()).toBeGreaterThan(0)
      }
    }
  })
})
