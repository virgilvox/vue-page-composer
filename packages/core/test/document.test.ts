import { describe, it, expect } from 'vitest'
import {
  createDocument,
  getNode,
  getZoneChildren,
  findParent,
  collectSubtree,
  isDescendant,
  cloneSubtree,
  insertNode,
} from '../src/index.js'
import type { ComposedDocument } from '../src/index.js'

function sample(): ComposedDocument {
  return {
    version: '1',
    root: 'page',
    nodes: {
      page: { type: 'Root', zones: { main: ['n_grid'] } },
      n_grid: { type: 'Grid', zones: { items: ['c_1', 'c_2'] } },
      c_1: { type: 'Card', props: { title: 'A' } },
      c_2: { type: 'Card', props: { title: 'B' } },
    },
  }
}

describe('document helpers', () => {
  it('creates an empty document with a default zone', () => {
    const doc = createDocument()
    expect(doc.root).toBe('page')
    expect(doc.nodes.page?.zones?.main).toEqual([])
  })

  it('creates a document with custom root zones', () => {
    const doc = createDocument(['header', 'main', 'footer'])
    expect(Object.keys(doc.nodes.page?.zones ?? {})).toEqual(['header', 'main', 'footer'])
  })

  it('reads nodes and zone children', () => {
    const doc = sample()
    expect(getNode(doc, 'c_1')?.props?.title).toBe('A')
    expect(getZoneChildren(doc, 'n_grid', 'items')).toEqual(['c_1', 'c_2'])
  })

  it('finds the parent location of a node', () => {
    const doc = sample()
    expect(findParent(doc, 'c_2')).toEqual({ parentId: 'n_grid', zone: 'items', index: 1 })
    expect(findParent(doc, 'page')).toBeNull()
  })

  it('collects a subtree depth first, self first', () => {
    const doc = sample()
    expect(collectSubtree(doc, 'n_grid')).toEqual(['n_grid', 'c_1', 'c_2'])
  })

  it('reports descendants', () => {
    const doc = sample()
    expect(isDescendant(doc, 'n_grid', 'c_1')).toBe(true)
    expect(isDescendant(doc, 'c_1', 'n_grid')).toBe(false)
    expect(isDescendant(doc, 'n_grid', 'n_grid')).toBe(true)
  })

  it('clones a subtree with fresh ids and remapped zones', () => {
    const doc = sample()
    const { rootId, nodes } = cloneSubtree(doc, 'n_grid', doc.nodes)
    expect(rootId).not.toBe('n_grid')
    const cloneRoot = nodes[rootId]
    const cloneChildren = cloneRoot?.zones?.items ?? []
    expect(cloneChildren).toHaveLength(2)
    // Cloned child ids are new and present in the returned map.
    for (const childId of cloneChildren) {
      expect(childId).not.toBe('c_1')
      expect(childId).not.toBe('c_2')
      expect(nodes[childId]?.type).toBe('Card')
    }
  })

  it('does not mutate the source document on insert', () => {
    const doc = createDocument()
    const before = JSON.stringify(doc)
    insertNode(doc, { type: 'Hero' }, { parentId: 'page', zone: 'main' })
    expect(JSON.stringify(doc)).toBe(before)
  })
})
