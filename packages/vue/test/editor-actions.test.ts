import { describe, it, expect } from 'vitest'
import { defineComponent, h, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import type { ComposedDocument, Config } from '@page-composer/core'
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
      fields: { title: { type: 'text', label: 'Title' } },
      defaultProps: { title: 'Hello' },
    },
    Grid: { label: 'Grid', category: 'layout', render: Grid, icon: 'grid', zones: ['items'] },
  },
}

function mountEditor() {
  return mount(PageComposer, { props: { config } })
}

type Emitted = [ComposedDocument][]
function lastDoc(wrapper: ReturnType<typeof mountEditor>): ComposedDocument {
  const emitted = wrapper.emitted('update:modelValue') as Emitted
  return emitted.at(-1)![0]
}

async function key(
  wrapper: ReturnType<typeof mountEditor>,
  k: string,
  mods: { metaKey?: boolean; shiftKey?: boolean } = {},
): Promise<void> {
  await wrapper.find('.pc-editor').trigger('keydown', { key: k, ...mods })
}

describe('editor actions and shortcuts', () => {
  it('duplicates the selection with Cmd+D', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    await key(wrapper, 'd', { metaKey: true })
    expect(wrapper.findAll('h1.hero')).toHaveLength(2)
  })

  it('copies and pastes a node with Cmd+C / Cmd+V', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    await key(wrapper, 'c', { metaKey: true })
    await key(wrapper, 'v', { metaKey: true })
    expect(wrapper.findAll('h1.hero')).toHaveLength(2)
  })

  it('deletes the selection with Backspace', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    expect(wrapper.find('h1.hero').exists()).toBe(true)
    await key(wrapper, 'Backspace')
    expect(wrapper.find('h1.hero').exists()).toBe(false)
  })

  it('deselects with Escape', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    expect(wrapper.find('.pc-ih-name').exists()).toBe(true)
    await key(wrapper, 'Escape')
    expect(wrapper.find('.pc-insp-empty').exists()).toBe(true)
  })

  it('reorders the selection with Cmd+Shift+ArrowDown', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    const before = lastDoc(wrapper).nodes.page!.zones!.main!.slice()
    expect(before).toHaveLength(2)
    await wrapper.findAll('.pc-cmp')[0]!.trigger('click')
    await key(wrapper, 'ArrowDown', { metaKey: true, shiftKey: true })
    const after = lastDoc(wrapper).nodes.page!.zones!.main!
    expect(after).toEqual([before[1], before[0]])
  })

  it('opens the keyboard shortcuts overlay', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Keyboard shortcuts"]').trigger('click')
    expect(wrapper.find('.pc-shortcuts').exists()).toBe(true)
    expect(wrapper.findAll('.pc-shortcuts li').length).toBeGreaterThan(4)
  })

  it('announces actions in a live region', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    expect(wrapper.find('[role="status"]').text()).toContain('Added Hero')
  })

  it('clears a stale selection after undo removes the selected node', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Hero"]').trigger('click')
    expect(wrapper.find('.pc-ih-name').exists()).toBe(true)
    await key(wrapper, 'z', { metaKey: true })
    // The added node is gone, so the inspector returns to its empty state.
    expect(wrapper.find('h1.hero').exists()).toBe(false)
    expect(wrapper.find('.pc-insp-empty').exists()).toBe(true)
  })

  it('renders the outline as an accessible tree', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Grid"]').trigger('click')
    // switch to the Outline tab
    await wrapper.findAll('.pc-tab')[1]!.trigger('click')
    expect(wrapper.find('[role="tree"]').exists()).toBe(true)
    const items = wrapper.findAll('[role="treeitem"]')
    expect(items.length).toBeGreaterThan(0)
    expect(items[0]!.attributes('aria-selected')).toBe('true')
  })
})
