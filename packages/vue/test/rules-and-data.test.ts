import { describe, it, expect } from 'vitest'
import { defineComponent, h, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import type { ComposedDocument, Config } from '@page-composer/core'
import PageComposer from '../src/editor/PageComposer.vue'

const Hero = defineComponent({
  props: { title: { type: String, default: '' } },
  setup: (p) => () => h('h1', { class: 'hero' }, p.title),
})
const Card = defineComponent({ setup: () => () => h('div', { class: 'card' }, 'card') })
const Grid = defineComponent({
  setup:
    (_p, { slots }) =>
    () =>
      h('div', { class: 'grid' }, slots.items?.()),
})

const config: Config<Component> = {
  components: {
    Grid: {
      label: 'Grid',
      category: 'layout',
      render: Grid,
      icon: 'grid',
      zones: ['items'],
      accepts: { items: ['Card'] }, // only Cards may go in a Grid
    },
    Hero: {
      label: 'Hero',
      category: 'content',
      render: Hero,
      icon: 'hero',
      fields: { title: { type: 'text', label: 'Title', bindable: true } },
    },
    Card: { label: 'Card', category: 'content', render: Card, icon: 'card' },
  },
}

type Emitted = [ComposedDocument][]
function lastDoc(wrapper: ReturnType<typeof mount>): ComposedDocument {
  return (wrapper.emitted('update:modelValue') as Emitted).at(-1)![0]
}

describe('zone restrictions in the editor', () => {
  it('drops a rejected type at the root instead of the selected container', async () => {
    const wrapper = mount(PageComposer, { props: { config } })
    // Add a Grid (selected). Its `items` zone only accepts Card.
    await wrapper.find('[aria-label="Add Grid"]').trigger('click')
    const doc1 = lastDoc(wrapper)
    const gridId = Object.keys(doc1.nodes).find((k) => doc1.nodes[k]!.type === 'Grid')!
    // Adding a Hero while the Grid is selected must not nest it in the Grid.
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    const doc2 = lastDoc(wrapper)
    const heroId = Object.keys(doc2.nodes).find((k) => doc2.nodes[k]!.type === 'Hero')!
    expect(doc2.nodes[gridId]!.zones!.items).not.toContain(heroId)
    expect(doc2.nodes.page!.zones!.main).toContain(heroId)
  })

  it('still nests an accepted type in the selected container', async () => {
    const wrapper = mount(PageComposer, { props: { config } })
    await wrapper.find('[aria-label="Add Grid"]').trigger('click')
    const gridId = Object.keys(lastDoc(wrapper).nodes).find(
      (k) => lastDoc(wrapper).nodes[k]!.type === 'Grid',
    )!
    await wrapper.find('[aria-label="Add Card"]').trigger('click')
    const doc = lastDoc(wrapper)
    const cardId = Object.keys(doc.nodes).find((k) => doc.nodes[k]!.type === 'Card')!
    expect(doc.nodes[gridId]!.zones!.items).toContain(cardId)
  })
})

describe('editor data context', () => {
  it('resolves bound props on the canvas while authoring', async () => {
    const model: ComposedDocument = {
      version: '1',
      root: 'page',
      nodes: {
        page: { type: 'Root', zones: { main: ['n_hero'] } },
        n_hero: { type: 'Hero', props: { title: { $bind: 'feature.title' } } },
      },
    }
    const wrapper = mount(PageComposer, {
      props: { config, modelValue: model, data: { feature: { title: 'Bound in editor' } } },
    })
    expect(wrapper.find('h1.hero').text()).toBe('Bound in editor')
  })
})
