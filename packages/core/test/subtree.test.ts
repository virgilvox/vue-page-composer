import { describe, it, expect } from 'vitest'
import {
  createDocument,
  insertNode,
  extractSubtree,
  insertSubtree,
  getZoneChildren,
  collectSubtree,
} from '../src/index.js'
import type { ComposedDocument } from '../src/index.js'

function withGrid(): { doc: ComposedDocument; gridId: string; cardIds: string[] } {
  let doc = createDocument()
  const grid = insertNode(
    doc,
    { type: 'Grid', zones: ['items'] },
    { parentId: 'page', zone: 'main' },
  )
  doc = grid.doc
  const cardIds: string[] = []
  for (const title of ['A', 'B']) {
    const card = insertNode(
      doc,
      { type: 'Card', props: { title } },
      { parentId: grid.id, zone: 'items' },
    )
    doc = card.doc
    cardIds.push(card.id)
  }
  return { doc, gridId: grid.id, cardIds }
}

describe('extractSubtree and insertSubtree', () => {
  it('extracts a detached fragment keeping original ids', () => {
    const { doc, gridId, cardIds } = withGrid()
    const fragment = extractSubtree(doc, gridId)
    expect(fragment.root).toBe(gridId)
    expect(Object.keys(fragment.nodes).sort()).toEqual([gridId, ...cardIds].sort())
  })

  it('does not share references with the source document', () => {
    const { doc, gridId } = withGrid()
    const fragment = extractSubtree(doc, gridId)
    fragment.nodes[gridId]!.props = { cols: 99 }
    expect(doc.nodes[gridId]?.props?.cols).toBeUndefined()
  })

  it('grafts a fragment with fresh ids', () => {
    const { doc, gridId, cardIds } = withGrid()
    const fragment = extractSubtree(doc, gridId)
    const pasted = insertSubtree(doc, fragment, { parentId: 'page', zone: 'main' })

    // New root id is fresh, not the original.
    expect(pasted.id).not.toBe(gridId)
    // Appended after the original in the root zone.
    expect(getZoneChildren(pasted.doc, 'page', 'main')).toEqual([gridId, pasted.id])
    // Every node in the pasted subtree has a brand-new id.
    const original = new Set([gridId, ...cardIds])
    for (const id of collectSubtree(pasted.doc, pasted.id)) {
      expect(original.has(id)).toBe(false)
    }
  })

  it('preserves structure and props on paste', () => {
    const { doc, gridId } = withGrid()
    const fragment = extractSubtree(doc, gridId)
    const pasted = insertSubtree(doc, fragment, { parentId: 'page', zone: 'main', index: 0 })
    const newGrid = pasted.doc.nodes[pasted.id]
    const childIds = newGrid?.zones?.items ?? []
    expect(childIds).toHaveLength(2)
    expect(pasted.doc.nodes[childIds[0] as string]?.props?.title).toBe('A')
  })

  it('pastes at a given index', () => {
    const { doc, gridId } = withGrid()
    const fragment = extractSubtree(doc, gridId)
    const pasted = insertSubtree(doc, fragment, { parentId: 'page', zone: 'main', index: 0 })
    expect(getZoneChildren(pasted.doc, 'page', 'main')[0]).toBe(pasted.id)
  })

  it('pastes across documents without id collisions', () => {
    const { doc, gridId } = withGrid()
    const fragment = extractSubtree(doc, gridId)
    const fresh = createDocument()
    const pasted = insertSubtree(fresh, fragment, { parentId: 'page', zone: 'main' })
    expect(getZoneChildren(pasted.doc, 'page', 'main')).toEqual([pasted.id])
    expect(Object.keys(pasted.doc.nodes)).toContain(pasted.id)
  })

  it('leaves the source document untouched', () => {
    const { doc, gridId } = withGrid()
    const before = JSON.stringify(doc)
    const fragment = extractSubtree(doc, gridId)
    insertSubtree(doc, fragment, { parentId: 'page', zone: 'main' })
    expect(JSON.stringify(doc)).toBe(before)
  })
})
