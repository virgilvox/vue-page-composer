import { describe, it, expect } from 'vitest'
import { History, createDocument, setProp, insertNode } from '../src/index.js'

describe('history', () => {
  it('starts with the initial state and no undo or redo', () => {
    const h = new History(createDocument())
    expect(h.canUndo).toBe(false)
    expect(h.canRedo).toBe(false)
  })

  it('pushes states and undoes them', () => {
    const doc = createDocument()
    const h = new History(doc)
    const a = insertNode(doc, { type: 'Hero' }, { parentId: 'page', zone: 'main' })
    h.push(a.doc)
    expect(h.canUndo).toBe(true)
    const restored = h.undo()
    expect(restored).toEqual(doc)
    expect(h.canRedo).toBe(true)
  })

  it('redoes an undone state', () => {
    const doc = createDocument()
    const h = new History(doc)
    const a = insertNode(doc, { type: 'Hero' }, { parentId: 'page', zone: 'main' })
    h.push(a.doc)
    h.undo()
    const redone = h.redo()
    expect(redone).toEqual(a.doc)
  })

  it('clears the redo stack on a new push', () => {
    const doc = createDocument()
    const h = new History(doc)
    const a = insertNode(doc, { type: 'Hero' }, { parentId: 'page', zone: 'main' })
    h.push(a.doc)
    h.undo()
    const b = setProp(doc, 'page', 'tag', 'x')
    h.push(b)
    expect(h.canRedo).toBe(false)
    expect(h.redo()).toBeNull()
  })

  it('respects the retention limit', () => {
    let doc = createDocument()
    const h = new History(doc, { limit: 2 })
    for (let i = 0; i < 5; i += 1) {
      doc = setProp(doc, 'page', 'n', i)
      h.push(doc)
    }
    // Only two undos are retained.
    expect(h.undo()).not.toBeNull()
    expect(h.undo()).not.toBeNull()
    expect(h.undo()).toBeNull()
  })

  it('ignores a push of the identical state', () => {
    const doc = createDocument()
    const h = new History(doc)
    h.push(doc)
    expect(h.canUndo).toBe(false)
  })
})
