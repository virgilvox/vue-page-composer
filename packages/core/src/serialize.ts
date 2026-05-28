/**
 * Serialization and validation. A document round-trips through JSON without
 * loss, and a malformed document fails with a clear, collected error list
 * rather than a vague throw deep in the renderer.
 */

import type { ComposedDocument, PageNode } from './types.js'
import { deepClone } from './clone.js'

export interface ValidationError {
  path: string
  message: string
}

export class DocumentValidationError extends Error {
  readonly errors: ValidationError[]
  constructor(errors: ValidationError[]) {
    super(`Invalid document: ${errors.map((e) => `${e.path} ${e.message}`).join('; ')}`)
    this.name = 'DocumentValidationError'
    this.errors = errors
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Check a value's shape. Returns the collected errors, empty when valid.
 * Validates structure and referential integrity: every zone child id must
 * exist, and the root must be present.
 */
export function validateDocument(value: unknown): ValidationError[] {
  const errors: ValidationError[] = []
  if (!isRecord(value)) {
    return [{ path: '$', message: 'must be an object' }]
  }
  if (value['version'] !== '1') {
    errors.push({ path: '$.version', message: 'must be "1"' })
  }
  if (typeof value['root'] !== 'string') {
    errors.push({ path: '$.root', message: 'must be a string' })
  }
  const nodes = value['nodes']
  if (!isRecord(nodes)) {
    errors.push({ path: '$.nodes', message: 'must be an object' })
    return errors
  }

  const ids = new Set(Object.keys(nodes))
  const root = value['root']
  if (typeof root === 'string' && !ids.has(root)) {
    errors.push({ path: '$.root', message: `references missing node "${root}"` })
  }

  const seenChildren = new Map<string, string>()
  for (const [id, node] of Object.entries(nodes)) {
    const path = `$.nodes.${id}`
    if (!isRecord(node)) {
      errors.push({ path, message: 'must be an object' })
      continue
    }
    if (typeof node['type'] !== 'string') {
      errors.push({ path: `${path}.type`, message: 'must be a string' })
    }
    if ('props' in node && !isRecord(node['props'])) {
      errors.push({ path: `${path}.props`, message: 'must be an object' })
    }
    if ('zones' in node) {
      const zones = node['zones']
      if (!isRecord(zones)) {
        errors.push({ path: `${path}.zones`, message: 'must be an object' })
        continue
      }
      for (const [zone, children] of Object.entries(zones)) {
        const zonePath = `${path}.zones.${zone}`
        if (!Array.isArray(children)) {
          errors.push({ path: zonePath, message: 'must be an array of ids' })
          continue
        }
        children.forEach((childId, index) => {
          if (typeof childId !== 'string') {
            errors.push({ path: `${zonePath}[${index}]`, message: 'must be a string id' })
            return
          }
          if (!ids.has(childId)) {
            errors.push({
              path: `${zonePath}[${index}]`,
              message: `references missing node "${childId}"`,
            })
          }
          const existing = seenChildren.get(childId)
          if (existing) {
            errors.push({
              path: `${zonePath}[${index}]`,
              message: `node "${childId}" already placed at ${existing}`,
            })
          } else {
            seenChildren.set(childId, zonePath)
          }
        })
      }
    }
  }

  return errors
}

/** Validate and narrow an unknown value to a document, throwing on failure. */
export function assertDocument(value: unknown): asserts value is ComposedDocument {
  const errors = validateDocument(value)
  if (errors.length > 0) throw new DocumentValidationError(errors)
}

/** Serialize a document to JSON. Pass `pretty` for indented output. */
export function serialize(doc: ComposedDocument, pretty = false): string {
  return JSON.stringify(doc, null, pretty ? 2 : undefined)
}

/** Parse and validate a document from a JSON string. */
export function deserialize(json: string): ComposedDocument {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (cause) {
    throw new DocumentValidationError([
      { path: '$', message: `is not valid JSON: ${(cause as Error).message}` },
    ])
  }
  assertDocument(parsed)
  return parsed
}

/** Validate and return a structural clone of an in-memory document. */
export function normalize(value: unknown): ComposedDocument {
  assertDocument(value)
  return deepClone(value)
}

export type { PageNode }
