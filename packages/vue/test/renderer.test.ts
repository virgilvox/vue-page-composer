import { describe, it, expect } from 'vitest'
import { defineComponent, h, type Component } from 'vue'
import { mount } from '@vue/test-utils'
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
    (_props, { slots }) =>
    () =>
      h('div', { class: 'grid' }, slots.items?.()),
})

const config: Config<Component> = {
  components: {
    Hero: { label: 'Hero', render: Hero, fields: { title: { type: 'text' } } },
    Card: { label: 'Card', render: Card, fields: { title: { type: 'text', bindable: true } } },
    Grid: { label: 'Grid', render: Grid, zones: ['items'] },
  },
}

function doc(): ComposedDocument {
  return {
    version: '1',
    root: 'page',
    nodes: {
      page: { type: 'Root', zones: { main: ['n_hero', 'n_grid'] } },
      n_hero: { type: 'Hero', props: { title: 'Welcome' } },
      n_grid: { type: 'Grid', zones: { items: ['c_1', 'c_2'] } },
      c_1: { type: 'Card', props: { title: { $bind: 'feature.title' } } },
      c_2: { type: 'Card', props: { title: 'Static card' } },
    },
  }
}

describe('ComposedPage renderer', () => {
  it('mounts registered components from the document', () => {
    const wrapper = mount(ComposedPage, { props: { config, model: doc() } })
    expect(wrapper.find('h1.hero').text()).toBe('Welcome')
    expect(wrapper.findAll('.card')).toHaveLength(2)
  })

  it('renders zone children into the matching slot', () => {
    const wrapper = mount(ComposedPage, { props: { config, model: doc() } })
    const grid = wrapper.find('.grid')
    expect(grid.findAll('.card')).toHaveLength(2)
  })

  it('resolves bound props from the data context', () => {
    const wrapper = mount(ComposedPage, {
      props: { config, model: doc(), data: { feature: { title: 'Bound value' } } },
    })
    const cards = wrapper.findAll('.card')
    expect(cards[0]?.text()).toBe('Bound value')
    expect(cards[1]?.text()).toBe('Static card')
  })

  it('reacts to a prop change in the model', async () => {
    const model = doc()
    const wrapper = mount(ComposedPage, { props: { config, model } })
    const next = structuredClone(model)
    next.nodes.n_hero!.props = { title: 'Updated' }
    await wrapper.setProps({ model: next })
    expect(wrapper.find('h1.hero').text()).toBe('Updated')
  })

  it('shows a fallback for an unregistered component type', () => {
    const model = doc()
    model.nodes.n_hero!.type = 'Mystery'
    const wrapper = mount(ComposedPage, { props: { config, model } })
    expect(wrapper.find('.pc-unknown').exists()).toBe(true)
    expect(wrapper.find('.pc-unknown').text()).toContain('Mystery')
  })

  it('produces no editor markup in production render', () => {
    const wrapper = mount(ComposedPage, { props: { config, model: doc() } })
    expect(wrapper.find('.pc-cmp').exists()).toBe(false)
    expect(wrapper.find('.pc-tag-float').exists()).toBe(false)
  })
})
