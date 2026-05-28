import { describe, it, expect } from 'vitest'
import { zoneAccepts, type Config } from '../src/index.js'

const config: Config = {
  components: {
    Grid: { label: 'Grid', render: null, zones: ['items'], accepts: { items: ['Card'] } },
    Section: { label: 'Section', render: null, zones: ['content'] },
    Card: { label: 'Card', render: null },
    Hero: { label: 'Hero', render: null },
  },
}

describe('zoneAccepts', () => {
  it('allows a type in a zone that lists it', () => {
    expect(zoneAccepts(config, 'Grid', 'items', 'Card')).toBe(true)
  })

  it('rejects a type a zone does not list', () => {
    expect(zoneAccepts(config, 'Grid', 'items', 'Hero')).toBe(false)
  })

  it('accepts any type when a zone declares no allow-list', () => {
    expect(zoneAccepts(config, 'Section', 'content', 'Hero')).toBe(true)
  })

  it('accepts any type for an unknown parent (such as the root)', () => {
    expect(zoneAccepts(config, 'Root', 'main', 'Hero')).toBe(true)
  })
})
