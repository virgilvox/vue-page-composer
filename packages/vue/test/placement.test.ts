import { describe, it, expect } from 'vitest'
import { adjustForDetach } from '../src/editor/placement.js'
import type { NodeLocation } from '@page-composer/core'

const at = (parentId: string, zone: string, index: number): NodeLocation => ({
  parentId,
  zone,
  index,
})

describe('adjustForDetach', () => {
  it('decrements when moving forward within the same zone', () => {
    // [A,B,C], drag A (index 0), drop after B (raw index 2) -> post-detach index 1 -> [B,A,C]
    const result = adjustForDetach({ parentId: 'g', zone: 'items', index: 2 }, at('g', 'items', 0))
    expect(result.index).toBe(1)
  })

  it('does not change when moving backward within the same zone', () => {
    // drag C (index 2) to before A (raw index 0) -> stays 0
    const result = adjustForDetach({ parentId: 'g', zone: 'items', index: 0 }, at('g', 'items', 2))
    expect(result.index).toBe(0)
  })

  it('does not change for a different zone', () => {
    const result = adjustForDetach({ parentId: 'g', zone: 'items', index: 2 }, at('h', 'items', 0))
    expect(result.index).toBe(2)
  })

  it('does not change when there is no source location', () => {
    const result = adjustForDetach({ parentId: 'g', zone: 'items', index: 2 }, null)
    expect(result.index).toBe(2)
  })

  it('leaves an append (no index) alone', () => {
    const result = adjustForDetach({ parentId: 'g', zone: 'items' }, at('g', 'items', 0))
    expect(result.index).toBeUndefined()
  })
})
