import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/utils/**', 'app/composables/**', 'app/stores/**', 'app/components/app/**'],
      reporter: ['text', 'html', 'clover', 'json-summary'],
      thresholds: {
        lines: 20,
        functions: 20,
        statements: 20,
        branches: 10,
      },
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, 'app'),
      '#imports': resolve(__dirname, '.nuxt/imports.d.ts'),
    },
  },
})
