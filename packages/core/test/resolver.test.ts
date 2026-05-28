import { describe, it, expect } from 'vitest'
import {
  isBinding,
  isDataSourceRef,
  getPath,
  defaultResolver,
  resolveValue,
  resolveProps,
} from '../src/index.js'

describe('resolver', () => {
  it('detects bindings and data source refs', () => {
    expect(isBinding({ $bind: 'a.b' })).toBe(true)
    expect(isBinding({ value: 1 })).toBe(false)
    expect(isDataSourceRef({ $source: 'collection:features' })).toBe(true)
  })

  it('reads dot paths', () => {
    const data = { feature: { title: 'Hi', meta: { tag: 'x' } } }
    expect(getPath(data, 'feature.title')).toBe('Hi')
    expect(getPath(data, 'feature.meta.tag')).toBe('x')
    expect(getPath(data, 'feature.missing')).toBeUndefined()
    expect(getPath(data, 'nothing.here')).toBeUndefined()
  })

  it('resolves against the data context', () => {
    const ctx = { data: { feature: { title: 'Realtime' } } }
    expect(defaultResolver.resolve('feature.title', ctx)).toBe('Realtime')
  })

  it('prefers the repeater scope', () => {
    const ctx = { data: { title: 'global' }, scope: { title: 'item' } }
    expect(defaultResolver.resolve('title', ctx)).toBe('item')
    expect(defaultResolver.resolve('item.title', ctx)).toBe('item')
  })

  it('resolves a single bound value', () => {
    const ctx = { data: { feature: { title: 'X' } } }
    expect(resolveValue({ $bind: 'feature.title' }, defaultResolver, ctx)).toBe('X')
    expect(resolveValue('literal', defaultResolver, ctx)).toBe('literal')
  })

  it('resolves bindings nested inside objects and arrays', () => {
    const ctx = { data: { a: 1, b: 2 } }
    const value = { list: [{ $bind: 'a' }, { $bind: 'b' }, 3], flag: true }
    expect(resolveValue(value, defaultResolver, ctx)).toEqual({ list: [1, 2, 3], flag: true })
  })

  it('resolves a whole prop map', () => {
    const ctx = { data: { feature: { title: 'Bound' } } }
    const props = { title: { $bind: 'feature.title' }, body: 'static', n: 4 }
    expect(resolveProps(props, defaultResolver, ctx)).toEqual({
      title: 'Bound',
      body: 'static',
      n: 4,
    })
  })

  it('returns an empty object for absent props', () => {
    expect(resolveProps(undefined, defaultResolver, { data: {} })).toEqual({})
  })
})
