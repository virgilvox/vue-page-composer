import { describe, it, expect } from 'vitest'
import { defineComponent, h, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import type { ComposedDocument, Config } from '@page-composer/core'
import ComposedPage from '../src/renderer/ComposedPage.vue'
import PageComposer from '../src/editor/PageComposer.vue'

const Hero = defineComponent({
  props: { title: { type: String, default: '' } },
  setup: (p) => () => h('h1', { class: 'hero' }, p.title),
})
const Card = defineComponent({ setup: () => () => h('div', { class: 'card' }, 'card') })
const Repeater = defineComponent({
  setup:
    (_p, { slots }) =>
    () =>
      h('div', { class: 'rep' }, slots.item?.()),
})

const config: Config<Component> = {
  components: {
    Hero: { label: 'Hero', render: Hero, fields: { title: { type: 'text' } } },
    Card: { label: 'Card', render: Card },
    Repeater: {
      label: 'Repeater',
      render: Repeater,
      zones: ['item'],
      repeat: { zone: 'item', source: 'items' },
    },
  },
}

describe('conditional visibility (renderer)', () => {
  function doc(): ComposedDocument {
    return {
      version: '1',
      root: 'page',
      nodes: {
        page: { type: 'Root', zones: { main: ['n_hero'] } },
        n_hero: { type: 'Hero', props: { title: 'Hi' }, when: 'showHero' },
      },
    }
  }

  it('renders the node when the condition is truthy', () => {
    const wrapper = mount(ComposedPage, {
      props: { config, model: doc(), data: { showHero: true } },
    })
    expect(wrapper.find('h1.hero').exists()).toBe(true)
  })

  it('hides the node when the condition is falsy', () => {
    const wrapper = mount(ComposedPage, {
      props: { config, model: doc(), data: { showHero: false } },
    })
    expect(wrapper.find('h1.hero').exists()).toBe(false)
  })

  it('filters a repeater template per item with item scope', () => {
    const model: ComposedDocument = {
      version: '1',
      root: 'page',
      nodes: {
        page: { type: 'Root', zones: { main: ['rep'] } },
        rep: { type: 'Repeater', props: { items: { $bind: 'rows' } }, zones: { item: ['tpl'] } },
        tpl: { type: 'Card', when: 'item.featured' },
      },
    }
    const wrapper = mount(ComposedPage, {
      props: {
        config,
        model,
        data: { rows: [{ featured: true }, { featured: false }, { featured: true }] },
      },
    })
    // Only the two featured rows render their card.
    expect(wrapper.findAll('.card')).toHaveLength(2)
  })
})

describe('conditional visibility (editor)', () => {
  it('sets a node when expression from the inspector', async () => {
    const wrapper = mount(PageComposer, { props: { config } })
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    const input = wrapper.find('.pc-visibility .pc-inp')
    await input.setValue('user.isPro')
    const emitted = wrapper.emitted('update:modelValue') as [ComposedDocument][]
    const last = emitted.at(-1)![0]
    const heroId = Object.keys(last.nodes).find((k) => last.nodes[k]!.type === 'Hero')!
    expect(last.nodes[heroId]!.when).toBe('user.isPro')
  })

  it('still renders a hidden node in the editor so it stays editable', async () => {
    const wrapper = mount(PageComposer, { props: { config, data: { flag: false } } })
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    await wrapper.find('.pc-visibility .pc-inp').setValue('flag')
    // Editor keeps rendering it, marked conditional/hidden.
    expect(wrapper.find('.pc-cmp.pc-conditional').exists()).toBe(true)
    expect(wrapper.find('h1.hero').exists()).toBe(true)
  })
})
