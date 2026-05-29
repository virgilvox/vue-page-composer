import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('nuxt module SSR', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
    server: true,
    build: true,
    browser: false,
  })

  it('server-renders ComposedPage with resolved bindings', async () => {
    const html = await $fetch('/')
    expect(html).toContain('SSR works')
    expect(html).toContain('class="hero"')
  })
})
