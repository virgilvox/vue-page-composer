import { describe, it, expect } from 'vitest'
import {
  createDocument,
  insertNode,
  moveNode,
  removeNode,
  duplicateNode,
  setProp,
  removeProp,
  setBinding,
  clearBinding,
  getZoneChildren,
  findParent,
} from '../src/index.js'
import type { ComposedDocument } from '../src/index.js'

function withGrid(): { doc: ComposedDocument; gridId: string; cardIds: string[] } {
  let doc = createDocument()
  const ins = insertNode(
    doc,
    { type: 'Grid', zones: ['items'] },
    { parentId: 'page', zone: 'main' },
  )
  doc = ins.doc
  const gridId = ins.id
  const cardIds: string[] = []
  for (const title of ['A', 'B', 'C']) {
    const r = insertNode(
      doc,
      { type: 'Card', props: { title } },
      { parentId: gridId, zone: 'items' },
    )
    doc = r.doc
    cardIds.push(r.id)
  }
  return { doc, gridId, cardIds }
}

describe('mutations', () => {
  it('inserts a node at an index', () => {
    const { doc, gridId, cardIds } = withGrid()
    const r = insertNode(
      doc,
      { type: 'Card', props: { title: 'X' } },
      { parentId: gridId, zone: 'items', index: 1 },
    )
    const children = getZoneChildren(r.doc, gridId, 'items')
    expect(children).toEqual([cardIds[0], r.id, cardIds[1], cardIds[2]])
  })

  it('initializes container zones empty', () => {
    const doc = createDocument()
    const r = insertNode(
      doc,
      { type: 'Grid', zones: ['items'] },
      { parentId: 'page', zone: 'main' },
    )
    expect(r.doc.nodes[r.id]?.zones?.items).toEqual([])
  })

  it('moves a node within a zone with a predictable index', () => {
    const { doc, gridId, cardIds } = withGrid()
    // Move the first card to the end.
    const moved = moveNode(doc, cardIds[0] as string, { parentId: gridId, zone: 'items', index: 2 })
    expect(getZoneChildren(moved, gridId, 'items')).toEqual([cardIds[1], cardIds[2], cardIds[0]])
  })

  it('moves a node across zones', () => {
    let doc = createDocument(['main', 'aside'])
    const a = insertNode(doc, { type: 'Card' }, { parentId: 'page', zone: 'main' })
    doc = a.doc
    const moved = moveNode(doc, a.id, { parentId: 'page', zone: 'aside' })
    expect(getZoneChildren(moved, 'page', 'main')).toEqual([])
    expect(getZoneChildren(moved, 'page', 'aside')).toEqual([a.id])
  })

  it('rejects moving a node into its own subtree', () => {
    const { doc, gridId } = withGrid()
    expect(() => moveNode(doc, gridId, { parentId: gridId, zone: 'items' })).toThrow()
  })

  it('removes a node and its whole subtree', () => {
    const { doc, gridId, cardIds } = withGrid()
    const removed = removeNode(doc, gridId)
    expect(removed.nodes[gridId]).toBeUndefined()
    for (const id of cardIds) expect(removed.nodes[id]).toBeUndefined()
    expect(getZoneChildren(removed, 'page', 'main')).toEqual([])
  })

  it('refuses to remove the root', () => {
    const doc = createDocument()
    expect(() => removeNode(doc, 'page')).toThrow()
  })

  it('duplicates a node right after the original', () => {
    const { doc, gridId, cardIds } = withGrid()
    const dup = duplicateNode(doc, cardIds[0] as string)
    const children = getZoneChildren(dup.doc, gridId, 'items')
    expect(children).toEqual([cardIds[0], dup.id, cardIds[1], cardIds[2]])
    expect(dup.doc.nodes[dup.id]?.props?.title).toBe('A')
  })

  it('duplicates a container with fresh child ids', () => {
    const { doc, gridId } = withGrid()
    const dup = duplicateNode(doc, gridId)
    const original = getZoneChildren(doc, gridId, 'items')
    const cloneChildren = getZoneChildren(dup.doc, dup.id, 'items')
    expect(cloneChildren).toHaveLength(3)
    for (const id of cloneChildren) expect(original).not.toContain(id)
  })

  it('sets and removes props', () => {
    const { doc, cardIds } = withGrid()
    const id = cardIds[0] as string
    const withProp = setProp(doc, id, 'variant', 'filled')
    expect(withProp.nodes[id]?.props?.variant).toBe('filled')
    const without = removeProp(withProp, id, 'variant')
    expect(without.nodes[id]?.props?.variant).toBeUndefined()
  })

  it('sets and clears bindings', () => {
    const { doc, cardIds } = withGrid()
    const id = cardIds[0] as string
    const bound = setBinding(doc, id, 'title', 'feature.title')
    expect(bound.nodes[id]?.props?.title).toEqual({ $bind: 'feature.title' })
    const cleared = clearBinding(bound, id, 'title', 'Static')
    expect(cleared.nodes[id]?.props?.title).toBe('Static')
  })

  it('keeps the original document untouched after a mutation', () => {
    const { doc, cardIds } = withGrid()
    const snapshot = JSON.stringify(doc)
    setProp(doc, cardIds[0] as string, 'title', 'changed')
    moveNode(doc, cardIds[0] as string, { parentId: 'page', zone: 'main' })
    expect(JSON.stringify(doc)).toBe(snapshot)
  })

  it('places duplicated subtree ids that round-trip parent lookup', () => {
    const { doc, gridId } = withGrid()
    const dup = duplicateNode(doc, gridId)
    const loc = findParent(dup.doc, dup.id)
    expect(loc?.parentId).toBe('page')
  })
})
