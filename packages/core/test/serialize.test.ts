import { describe, it, expect } from 'vitest'
import {
  createDocument,
  insertNode,
  serialize,
  deserialize,
  validateDocument,
  DocumentValidationError,
} from '../src/index.js'

describe('serialize and validate', () => {
  it('round-trips a document without loss', () => {
    let doc = createDocument()
    const r = insertNode(
      doc,
      { type: 'Card', props: { title: { $bind: 'f.title' }, n: 3 } },
      { parentId: 'page', zone: 'main' },
    )
    doc = r.doc
    const json = serialize(doc)
    const back = deserialize(json)
    expect(back).toEqual(doc)
  })

  it('pretty prints when asked', () => {
    const doc = createDocument()
    expect(serialize(doc, true)).toContain('\n')
    expect(serialize(doc)).not.toContain('\n')
  })

  it('accepts a valid document', () => {
    expect(validateDocument(createDocument())).toEqual([])
  })

  it('flags a wrong version', () => {
    const errors = validateDocument({
      version: '2',
      root: 'page',
      nodes: { page: { type: 'Root' } },
    })
    expect(errors.some((e) => e.path === '$.version')).toBe(true)
  })

  it('flags a missing root node', () => {
    const errors = validateDocument({ version: '1', root: 'ghost', nodes: {} })
    expect(errors.some((e) => e.message.includes('missing node'))).toBe(true)
  })

  it('flags a zone child that does not exist', () => {
    const errors = validateDocument({
      version: '1',
      root: 'page',
      nodes: { page: { type: 'Root', zones: { main: ['nope'] } } },
    })
    expect(errors.some((e) => e.message.includes('missing node "nope"'))).toBe(true)
  })

  it('flags a node placed in two zones', () => {
    const errors = validateDocument({
      version: '1',
      root: 'page',
      nodes: {
        page: { type: 'Root', zones: { a: ['c'], b: ['c'] } },
        c: { type: 'Card' },
      },
    })
    expect(errors.some((e) => e.message.includes('already placed'))).toBe(true)
  })

  it('throws a typed error on malformed JSON', () => {
    expect(() => deserialize('{ not json')).toThrow(DocumentValidationError)
  })

  it('throws a typed error on an invalid document', () => {
    expect(() => deserialize(JSON.stringify({ version: '1' }))).toThrow(DocumentValidationError)
  })
})
