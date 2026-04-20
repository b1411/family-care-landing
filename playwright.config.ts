import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Desktop browsers
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'msedge', use: { ...devices['Desktop Edge'] } },

    // Mobile devices
    { name: 'mobile-iphone14', use: { ...devices['iPhone 14'] } },
    { name: 'mobile-iphonese', use: { ...devices['iPhone SE'] } },
    { name: 'mobile-pixel7', use: { ...devices['Pixel 7'] } },

    // Tablet
    { name: 'tablet-ipad', use: { ...devices['iPad Pro'] } },

    // Extra viewports for responsive testing
    { name: 'viewport-320', use: { viewport: { width: 320, height: 568 } } },
    { name: 'viewport-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'viewport-2560', use: { viewport: { width: 2560, height: 1440 } } },
  ],
  webServer: {
    command: 'npx nuxi dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
