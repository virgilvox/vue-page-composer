import { describe, it, expect } from 'vitest'
import { createSSRApp, defineComponent, h, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import type { ComposedDocument, Config } from '@page-composer/core'
import ComposedPage from '../src/renderer/ComposedPage.vue'

const Hero = defineComponent({
  props: { title: { type: String, default: '' } },
  setup: (p) => () => h('h1', { class: 'hero' }, p.title),
})
const Card = defineComponent({
  props: { title: { type: String, default: '' } },
  setup: (p) => () => h('div', { class: 'card' }, p.title),
})
const Grid = defineComponent({
  setup:
    (_p, { slots }) =>
    () =>
      h('div', { class: 'grid' }, slots.items?.()),
})

const config: Config<Component> = {
  components: {
    Hero: { label: 'Hero', render: Hero },
    Card: { label: 'Card', render: Card },
    Grid: { label: 'Grid', render: Grid, zones: ['items'] },
  },
}

const model: ComposedDocument = {
  version: '1',
  root: 'page',
  nodes: {
    page: { type: 'Root', zones: { main: ['n_hero', 'n_grid'] } },
    n_hero: { type: 'Hero', props: { title: { $bind: 'feature.title' } } },
    n_grid: { type: 'Grid', zones: { items: ['c_1'] } },
    c_1: { type: 'Card', props: { title: 'Static card' } },
  },
}

describe('ComposedPage SSR', () => {
  it('renders to an HTML string on the server with resolved bindings', async () => {
    const app = createSSRApp({
      render: () =>
        h(ComposedPage, { config, model, data: { feature: { title: 'Bound on server' } } }),
    })
    const html = await renderToString(app)
    expect(html).toContain('Bound on server')
    expect(html).toContain('Static card')
    expect(html).toContain('class="grid"')
  })

  it('emits no editor markup server-side', async () => {
    const app = createSSRApp({ render: () => h(ComposedPage, { config, model }) })
    const html = await renderToString(app)
    expect(html).not.toContain('pc-cmp')
    expect(html).not.toContain('pc-tag-float')
  })

  it('survives a null model without throwing', async () => {
    const app = createSSRApp({
      render: () => h(ComposedPage, { config, model: null as unknown as ComposedDocument }),
    })
    await expect(renderToString(app)).resolves.toContain('pc-page')
  })
})
