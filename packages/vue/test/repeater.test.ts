import { describe, it, expect } from 'vitest'
import { defineComponent, h, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import type { ComposedDocument, Config } from '@page-composer/core'
import ComposedPage from '../src/renderer/ComposedPage.vue'

const Card = defineComponent({
  props: { title: { type: String, default: '' } },
  setup: (p) => () => h('div', { class: 'card' }, p.title),
})
const Repeater = defineComponent({
  setup:
    (_p, { slots }) =>
    () =>
      h('div', { class: 'rep' }, slots.item?.()),
})

const config: Config<Component> = {
  components: {
    Repeater: {
      label: 'Repeater',
      render: Repeater,
      zones: ['item'],
      repeat: { zone: 'item', source: 'items' },
    },
    Card: { label: 'Card', render: Card, fields: { title: { type: 'text', bindable: true } } },
  },
}

function doc(): ComposedDocument {
  return {
    version: '1',
    root: 'page',
    nodes: {
      page: { type: 'Root', zones: { main: ['rep'] } },
      rep: { type: 'Repeater', props: { items: { $bind: 'features' } }, zones: { item: ['tpl'] } },
      tpl: { type: 'Card', props: { title: { $bind: 'item.title' } } },
    },
  }
}

describe('repeater', () => {
  it('clones the template once per item with item scope', () => {
    const wrapper = mount(ComposedPage, {
      props: {
        config,
        model: doc(),
        data: { features: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] },
      },
    })
    const cards = wrapper.findAll('.card')
    expect(cards).toHaveLength(3)
    expect(cards.map((c) => c.text())).toEqual(['A', 'B', 'C'])
  })

  it('renders nothing when the bound list is empty or missing', () => {
    const wrapper = mount(ComposedPage, { props: { config, model: doc(), data: {} } })
    expect(wrapper.findAll('.card')).toHaveLength(0)
  })

  it('reacts when the bound list changes', async () => {
    const wrapper = mount(ComposedPage, {
      props: { config, model: doc(), data: { features: [{ title: 'A' }] } },
    })
    expect(wrapper.findAll('.card')).toHaveLength(1)
    await wrapper.setProps({ data: { features: [{ title: 'A' }, { title: 'B' }] } })
    expect(wrapper.findAll('.card')).toHaveLength(2)
  })
})
