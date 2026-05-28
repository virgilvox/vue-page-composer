import { describe, it, expect } from 'vitest'
import { defineComponent, h, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import type { Config } from '@page-composer/core'
import PageComposer from '../src/editor/PageComposer.vue'

const Hero = defineComponent({
  props: { title: { type: String, default: '' } },
  setup: (p) => () => h('h1', { class: 'hero' }, p.title),
})
const Grid = defineComponent({
  setup:
    (_p, { slots }) =>
    () =>
      h('div', { class: 'grid' }, slots.items?.()),
})

const config: Config<Component> = {
  components: {
    Hero: {
      label: 'Hero',
      category: 'content',
      render: Hero,
      icon: 'hero',
      fields: { title: { type: 'text', label: 'Title', bindable: true } },
      defaultProps: { title: 'Hello' },
    },
    Grid: {
      label: 'Grid',
      category: 'layout',
      render: Grid,
      icon: 'grid',
      zones: ['items'],
      fields: { cols: { type: 'number', label: 'Columns', default: 3 } },
    },
  },
  categories: { layout: { title: 'Layout', order: 0 }, content: { title: 'Content', order: 1 } },
}

function mountEditor() {
  // Uncontrolled: PageComposer manages its own document internally.
  return mount(PageComposer, { props: { config } })
}

describe('PageComposer editor', () => {
  it('renders the toolbar and palette blocks', () => {
    const wrapper = mountEditor()
    expect(wrapper.find('.pc-brand-word').text()).toBe('Page Composer')
    expect(wrapper.find('[aria-label="Add Hero"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Add Grid"]').exists()).toBe(true)
  })

  it('groups palette blocks by category in order', () => {
    const wrapper = mountEditor()
    const labels = wrapper.findAll('.pc-cat-label').map((n) => n.text())
    expect(labels[0]).toContain('Layout')
    expect(labels[1]).toContain('Content')
  })

  it('adds a block to the canvas on click and emits change', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    expect(wrapper.find('.grid, h1.hero').exists()).toBe(true)
    expect(wrapper.find('h1.hero').text()).toBe('Hello')
    expect(wrapper.find('.pc-cmp').exists()).toBe(true)
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('selects the added node and shows its fields in the inspector', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    expect(wrapper.find('.pc-ih-name').text()).toBe('Hero')
    const labels = wrapper.findAll('.pc-field label').map((n) => n.text())
    expect(labels).toContain('Title')
  })

  it('edits a prop through the inspector and updates the canvas', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    const input = wrapper.find('.pc-field .pc-inp')
    await input.setValue('Changed title')
    expect(wrapper.find('h1.hero').text()).toBe('Changed title')
  })

  it('toggles a field to a binding and back', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    const bindToggle = wrapper.find('.pc-bind')
    expect(bindToggle.exists()).toBe(true)
    await bindToggle.trigger('click')
    expect(wrapper.find('.pc-inp.pc-bound').exists()).toBe(true)
  })

  it('undoes the last change', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    expect(wrapper.find('h1.hero').exists()).toBe(true)
    await wrapper.find('[title="Undo"]').trigger('click')
    expect(wrapper.find('h1.hero').exists()).toBe(false)
  })

  it('opens the model overlay showing serialized JSON', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    const modelButtons = wrapper.findAll('.pc-btn.pc-ghost')
    await modelButtons[0]!.trigger('click')
    expect(wrapper.find('.pc-json-card').exists()).toBe(true)
    expect(wrapper.find('.pc-json-card pre').text()).toContain('"Hero"')
  })

  it('selects a node when its canvas wrapper is clicked', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Grid"]').trigger('click')
    // deselect, then click the wrapper
    const cmp = wrapper.find('.pc-cmp')
    await cmp.trigger('click')
    expect(wrapper.find('.pc-ih-name').text()).toBe('Grid')
  })
})
