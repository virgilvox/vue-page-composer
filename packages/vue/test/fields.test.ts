import { describe, it, expect } from 'vitest'
import { defineComponent, h, type Component } from 'vue'
import { mount } from '@vue/test-utils'
import type { ComposedDocument, Config } from '@page-composer/core'
import PageComposer from '../src/editor/PageComposer.vue'

const Box = defineComponent({ setup: () => () => h('div', { class: 'box' }, 'box') })

const StarsField = defineComponent({
  props: {
    modelValue: { type: Number, default: 0 },
    field: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue'],
  setup:
    (p, { emit }) =>
    () =>
      h(
        'div',
        { class: 'stars' },
        [1, 2, 3].map((n) =>
          h('button', { class: 'star', onClick: () => emit('update:modelValue', n) }, '*'),
        ),
      ),
})

const config: Config<Component> = {
  components: {
    Box: {
      label: 'Box',
      render: Box,
      fields: {
        tags: { type: 'array', label: 'Tags', of: { type: 'text' } },
        cta: {
          type: 'object',
          label: 'CTA',
          fields: {
            label: { type: 'text', label: 'Label' },
            href: { type: 'text', label: 'Href' },
          },
        },
        rating: { type: 'custom', label: 'Rating', component: 'stars' },
      },
    },
  },
}

function mountEditor() {
  return mount(PageComposer, { props: { config, fieldComponents: { stars: StarsField } } })
}

type Emitted = [ComposedDocument][]
function lastDoc(wrapper: ReturnType<typeof mountEditor>): ComposedDocument {
  return (wrapper.emitted('update:modelValue') as Emitted).at(-1)![0]
}
function boxProps(wrapper: ReturnType<typeof mountEditor>): Record<string, unknown> {
  const doc = lastDoc(wrapper)
  const id = Object.keys(doc.nodes).find((k) => doc.nodes[k]!.type === 'Box')!
  return (doc.nodes[id]!.props ?? {}) as Record<string, unknown>
}

describe('object, array, and custom fields', () => {
  it('adds and edits array items', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Box"]').trigger('click')
    expect(wrapper.find('.pc-array-item').exists()).toBe(false)
    await wrapper.find('.pc-array-add').trigger('click')
    const items = wrapper.findAll('.pc-array-item')
    expect(items).toHaveLength(1)
    await items[0]!.find('.pc-inp').setValue('alpha')
    expect(boxProps(wrapper).tags).toEqual(['alpha'])
  })

  it('removes array items', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Box"]').trigger('click')
    await wrapper.find('.pc-array-add').trigger('click')
    await wrapper.find('.pc-array-add').trigger('click')
    expect(wrapper.findAll('.pc-array-item')).toHaveLength(2)
    await wrapper.find('.pc-array-item .pc-array-remove').trigger('click')
    expect(wrapper.findAll('.pc-array-item')).toHaveLength(1)
  })

  it('renders object sub-fields and edits nested values', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Box"]').trigger('click')
    const subLabels = wrapper.findAll('.pc-sublabel').map((n) => n.text())
    expect(subLabels).toEqual(['Label', 'Href'])
    await wrapper.findAll('.pc-subfield .pc-inp')[0]!.setValue('Get started')
    expect(boxProps(wrapper).cta).toEqual({ label: 'Get started' })
  })

  it('renders a custom field component and writes its value', async () => {
    const wrapper = mountEditor()
    await wrapper.find('[aria-label="Add Box"]').trigger('click')
    expect(wrapper.find('.stars').exists()).toBe(true)
    await wrapper.findAll('.star')[1]!.trigger('click')
    expect(boxProps(wrapper).rating).toBe(2)
  })
})
