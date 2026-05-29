import { describe, it, expect, vi, beforeEach } from 'vitest'

// Capture what the module asks @nuxt/kit to do, without a Nuxt runtime.
interface ComponentReg {
  name: string
  export: string
  filePath: string
  mode?: string
}
const calls: { components: ComponentReg[]; imports: string[] } = { components: [], imports: [] }

vi.mock('@nuxt/kit', () => ({
  // Return the definition object so the test can call setup directly.
  defineNuxtModule: <T>(def: T): T => def,
  addComponent: (c: ComponentReg) => calls.components.push(c),
  addImportsDir: (dir: string) => calls.imports.push(dir),
  createResolver: () => ({ resolve: (p: string) => p }),
}))

// Imported after the mock so defineNuxtModule returns the raw definition.
const mod = (await import('../src/module')).default as unknown as {
  setup: (
    options: { editor: boolean; css: boolean; prefix: string },
    nuxt: { options: { css: string[] } },
  ) => void
}

function run(options: { editor: boolean; css: boolean; prefix: string }) {
  const nuxt = { options: { css: [] as string[] } }
  mod.setup(options, nuxt)
  return nuxt
}

beforeEach(() => {
  calls.components = []
  calls.imports = []
})

describe('nuxt module setup', () => {
  it('registers ComposedPage globally and injects the stylesheet', () => {
    const nuxt = run({ editor: false, css: true, prefix: '' })
    const composed = calls.components.find((c) => c.export === 'ComposedPage')
    expect(composed).toBeTruthy()
    expect(composed!.name).toBe('ComposedPage')
    expect(composed!.filePath).toBe('@page-composer/vue')
    expect(nuxt.options.css).toContain('@page-composer/vue/styles.css')
    expect(calls.imports).toHaveLength(1)
  })

  it('does not register the editor by default', () => {
    run({ editor: false, css: true, prefix: '' })
    expect(calls.components.some((c) => c.export === 'PageComposer')).toBe(false)
  })

  it('registers the editor client-only when enabled, with the prefix', () => {
    run({ editor: true, css: true, prefix: 'Pc' })
    const editor = calls.components.find((c) => c.export === 'PageComposer')
    expect(editor).toBeTruthy()
    expect(editor!.name).toBe('PcPageComposer')
    expect(editor!.mode).toBe('client')
  })

  it('skips the stylesheet when css is false', () => {
    const nuxt = run({ editor: false, css: false, prefix: '' })
    expect(nuxt.options.css).toHaveLength(0)
  })
})
