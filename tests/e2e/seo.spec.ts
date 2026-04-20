import { test, expect } from '@playwright/test'

test.describe('SEO — Homepage (SEO-01–SEO-06)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  test('SEO-01: homepage has non-empty <title> tag', async ({ page }) => {
    const title = await page.title()
    expect(title.trim().length).toBeGreaterThan(0)
    expect(title).toContain('UMAI Health')
  })

  test('SEO-02: homepage has meta description', async ({ page }) => {
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.trim().length).toBeGreaterThan(10)
  })

  test('SEO-03: homepage has og:title Open Graph tag', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()
    expect(ogTitle!.trim().length).toBeGreaterThan(0)
  })

  test('SEO-04: homepage has og:description Open Graph tag', async ({ page }) => {
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content')
    expect(ogDesc).toBeTruthy()
    expect(ogDesc!.trim().length).toBeGreaterThan(0)
  })

  test('SEO-05: homepage has og:type Open Graph tag', async ({ page }) => {
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content')
    expect(ogType).toBeTruthy()
  })

  test('SEO-06: favicon is linked in <head>', async ({ page }) => {
    const favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]').first()
    await expect(favicon).toHaveCount(1)
    const href = await favicon.getAttribute('href')
    expect(href).toBeTruthy()
  })
})

test.describe('SEO — /for-clinics and /for-families (SEO-07–SEO-08)', () => {
  test('SEO-07: /for-clinics has title and meta description', async ({ page }) => {
    await page.goto('/for-clinics')
    await page.waitForLoadState('domcontentloaded')
    const title = await page.title()
    expect(title.trim().length).toBeGreaterThan(0)
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
  })

  test('SEO-08: /for-families has title and meta description', async ({ page }) => {
    await page.goto('/for-families')
    await page.waitForLoadState('domcontentloaded')
    const title = await page.title()
    expect(title.trim().length).toBeGreaterThan(0)
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
  })
})

test.describe('SEO — robots.txt and sitemap.xml (SEO-09–SEO-10)', () => {
  test('SEO-09: robots.txt is accessible and not empty', async ({ page }) => {
    const response = await page.request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body.trim().length).toBeGreaterThan(0)
    expect(body).toContain('User-agent')
  })

  test('SEO-10: sitemap.xml is accessible and valid XML', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('<?xml')
    expect(body).toContain('<urlset')
    expect(body).toContain('umai-health.kz')
  })
})

test.describe('SEO — structural (SEO-11)', () => {
  test('SEO-11: homepage has structured heading hierarchy (h1 → h2)', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const h1Count = await page.locator('h1').count()
    const h2Count = await page.locator('h2').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    expect(h2Count).toBeGreaterThan(0)
    // h2 should not appear before h1
    const firstH1 = page.locator('h1').first()
    const firstH2 = page.locator('h2').first()
    const h1Box = await firstH1.boundingBox()
    const h2Box = await firstH2.boundingBox()
    if (h1Box && h2Box) {
      expect(h1Box.y).toBeLessThan(h2Box.y)
    }
  })

  test('SEO-12: /privacy page has h1 and is indexable content', async ({ page }) => {
    await page.goto('/privacy')
    await page.waitForLoadState('domcontentloaded')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible({ timeout: 10000 })
    const text = await page.locator('body').textContent()
    expect(text?.trim().length).toBeGreaterThan(100)
  })

  test('SEO-13: /terms page has h1 and is indexable content', async ({ page }) => {
    await page.goto('/terms')
    await page.waitForLoadState('domcontentloaded')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible({ timeout: 10000 })
    const text = await page.locator('body').textContent()
    expect(text?.trim().length).toBeGreaterThan(100)
  })
})
