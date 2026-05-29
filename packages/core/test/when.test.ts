import { describe, it, expect } from 'vitest'
import { createDocument, insertNode, setWhen, serialize, deserialize } from '../src/index.js'

describe('setWhen', () => {
  it('sets a conditional expression on a node', () => {
    const doc = createDocument()
    const { doc: withNode, id } = insertNode(
      doc,
      { type: 'Hero' },
      { parentId: 'page', zone: 'main' },
    )
    const next = setWhen(withNode, id, 'user.isPro')
    expect(next.nodes[id]?.when).toBe('user.isPro')
  })

  it('clears the expression when given an empty value', () => {
    const doc = createDocument()
    const { doc: withNode, id } = insertNode(
      doc,
      { type: 'Hero' },
      { parentId: 'page', zone: 'main' },
    )
    const set = setWhen(withNode, id, 'flag')
    const cleared = setWhen(set, id, undefined)
    expect('when' in (cleared.nodes[id] ?? {})).toBe(false)
  })

  it('does not mutate the input document', () => {
    const doc = createDocument()
    const { doc: withNode, id } = insertNode(
      doc,
      { type: 'Hero' },
      { parentId: 'page', zone: 'main' },
    )
    const snapshot = JSON.stringify(withNode)
    setWhen(withNode, id, 'flag')
    expect(JSON.stringify(withNode)).toBe(snapshot)
  })

  it('round-trips through serialization', () => {
    const doc = createDocument()
    const { doc: withNode, id } = insertNode(
      doc,
      { type: 'Hero' },
      { parentId: 'page', zone: 'main' },
    )
    const next = setWhen(withNode, id, 'item.featured')
    expect(deserialize(serialize(next)).nodes[id]?.when).toBe('item.featured')
  })
})
