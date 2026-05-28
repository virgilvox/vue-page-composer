/**
 * Resolver interface and prop resolution. Core defines the contract and ships
 * a default dot-path resolver. The host supplies fetching for data sources.
 */

import type { Binding, DataSourceRef, PropValue } from './types.js'

/** Data the resolver reads against. `scope` is the current item in a repeater. */
export interface ResolverContext {
  data: Record<string, unknown>
  scope?: Record<string, unknown>
}

export interface Resolver {
  /** Evaluate a binding expression against the context. */
  resolve(expression: string, context: ResolverContext): unknown
  /** Optionally turn a data source reference into its value. */
  resolveSource?(source: string, context: ResolverContext): unknown
}

export function isBinding(value: unknown): value is Binding {
  return typeof value === 'object' && value !== null && '$bind' in value
}

export function isDataSourceRef(value: unknown): value is DataSourceRef {
  return typeof value === 'object' && value !== null && '$source' in value
}

/** Read a dot path such as `feature.title` out of a nested object. */
export function getPath(root: unknown, path: string): unknown {
  if (path === '') return root
  let current: unknown = root
  for (const key of path.split('.')) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

/**
 * Default resolver. Looks the expression up first in the repeater scope, then
 * in the top-level data context. A leading `item.` always targets the scope.
 */
export const defaultResolver: Resolver = {
  resolve(expression, context) {
    if (expression.startsWith('item.') && context.scope) {
      return getPath(context.scope, expression.slice('item.'.length))
    }
    if (context.scope) {
      const fromScope = getPath(context.scope, expression)
      if (fromScope !== undefined) return fromScope
    }
    return getPath(context.data, expression)
  },
}

/** Resolve a single prop value, walking into nested objects and arrays. */
export function resolveValue(
  value: PropValue,
  resolver: Resolver,
  context: ResolverContext,
): unknown {
  if (isBinding(value)) return resolver.resolve(value.$bind, context)
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, resolver, context))
  }
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {}
    for (const [key, inner] of Object.entries(value)) {
      out[key] = resolveValue(inner as PropValue, resolver, context)
    }
    return out
  }
  return value
}

/** Resolve every prop on a node into plain values ready to pass to a component. */
export function resolveProps(
  props: Record<string, PropValue> | undefined,
  resolver: Resolver,
  context: ResolverContext,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (!props) return out
  for (const [key, value] of Object.entries(props)) {
    out[key] = resolveValue(value, resolver, context)
  }
  return out
}
