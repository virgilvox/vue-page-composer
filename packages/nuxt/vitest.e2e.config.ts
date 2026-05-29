import { defineConfig } from 'vitest/config'

// Heavy Nuxt SSR e2e, kept separate from the fast unit suite. Run with
// `pnpm --filter @page-composer/nuxt test:e2e`. It builds the playground app.
export default defineConfig({
  test: {
    name: 'nuxt-e2e',
    include: ['test-e2e/**/*.test.ts'],
    testTimeout: 120_000,
    hookTimeout: 240_000,
  },
})
