/**
 * Structural deep clone for JSON-shaped values. The document contains only
 * strings, numbers, booleans, null, arrays, and plain objects, so this is both
 * correct and free of any runtime or DOM dependency. Keeps core neutral.
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as unknown as T
  }
  const out: Record<string, unknown> = {}
  for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
    out[key] = deepClone(inner)
  }
  return out as T
}
