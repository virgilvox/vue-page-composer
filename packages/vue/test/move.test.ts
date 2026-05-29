import { describe, it, expect } from 'vitest'
import { defineComponent, type Component } from 'vue'
import {
  createDocument,
  insertNode,
  moveNode,
  type ComposedDocument,
  type Config,
} from '@page-composer/core'
import { validSlots, currentSlotIndex } from '../src/editor/move.js'

const Stub = defineComponent({ setup: () => () => null })

const config: Config<Component> = {
  components: {
    Grid: { label: 'Grid', render: Stub, zones: ['items'], accepts: { items: ['Card'] } },
    Section: { label: 'Section', render: Stub, zones: ['content'] },
    Card: { label: 'Card', render: Stub },
    Hero: { label: 'Hero', render: Stub },
  },
}

// Root.main -> [Hero, Grid(items -> [Card]), Section(content -> [])]
function build(): { doc: ComposedDocument; ids: Record<string, string> } {
  let doc = createDocument()
  const hero = insertNode(doc, { type: 'Hero' }, { parentId: 'page', zone: 'main' })
  doc = hero.doc
  const grid = insertNode(
    doc,
    { type: 'Grid', zones: ['items'] },
    { parentId: 'page', zone: 'main' },
  )
  doc = grid.doc
  const card = insertNode(doc, { type: 'Card' }, { parentId: grid.id, zone: 'items' })
  doc = card.doc
  const section = insertNode(
    doc,
    { type: 'Section', zones: ['content'] },
    { parentId: 'page', zone: 'main' },
  )
  doc = section.doc
  return { doc, ids: { hero: hero.id, grid: grid.id, card: card.id, section: section.id } }
}

describe('validSlots', () => {
  it('lists root and accepting nested zones for a Card', () => {
    const { doc, ids } = build()
    const slots = validSlots(config, doc, ids.card!)
    // Grid.items accepts Card; Section.content has no allow-list so accepts any.
    expect(slots.some((s) => s.parentId === 'page' && s.zone === 'main')).toBe(true)
    expect(slots.some((s) => s.parentId === ids.grid && s.zone === 'items')).toBe(true)
    expect(slots.some((s) => s.parentId === ids.section && s.zone === 'content')).toBe(true)
  })

  it('excludes zones that reject the type', () => {
    const { doc, ids } = build()
    const slots = validSlots(config, doc, ids.hero!)
    // Grid.items only accepts Card, so a Hero may not target it.
    expect(slots.some((s) => s.parentId === ids.grid && s.zone === 'items')).toBe(false)
  })

  it('never targets the moving node’s own subtree', () => {
    const { doc, ids } = build()
    const slots = validSlots(config, doc, ids.grid!)
    expect(slots.some((s) => s.parentId === ids.grid)).toBe(false)
  })

  it('produces indices that feed moveNode without error', () => {
    const { doc, ids } = build()
    const slots = validSlots(config, doc, ids.hero!)
    for (const slot of slots) {
      expect(() => moveNode(doc, ids.hero!, slot)).not.toThrow()
    }
  })

  it('finds the current slot index', () => {
    const { doc, ids } = build()
    const slots = validSlots(config, doc, ids.hero!)
    const idx = currentSlotIndex(doc, ids.hero!, slots)
    expect(slots[idx]).toEqual({ parentId: 'page', zone: 'main', index: 0 })
  })
})
