/**
 * Read-only helpers over the flat node map. Traversal, parent lookup, and
 * subtree collection. None of these mutate the document.
 */

import type { ComposedDocument, PageNode } from './types.js'
import { CHILD_PREFIX, createId } from './ids.js'
import { deepClone } from './clone.js'

export const ROOT_TYPE = 'Root'
export const DEFAULT_ROOT_ZONE = 'main'

/** Build an empty document with a single root and one default zone. */
export function createDocument(rootZones: string[] = [DEFAULT_ROOT_ZONE]): ComposedDocument {
  const zones: Record<string, string[]> = {}
  for (const zone of rootZones) zones[zone] = []
  return {
    version: '1',
    root: 'page',
    nodes: {
      page: { type: ROOT_TYPE, zones },
    },
  }
}

/** Get a node by id, or undefined if it is not in the map. */
export function getNode(doc: ComposedDocument, id: string): PageNode | undefined {
  return doc.nodes[id]
}

/** Get the zone child lists for a node, or an empty object. */
export function getZones(doc: ComposedDocument, id: string): Record<string, string[]> {
  return doc.nodes[id]?.zones ?? {}
}

/** Ordered child ids in one zone of a node. */
export function getZoneChildren(doc: ComposedDocument, id: string, zone: string): string[] {
  return doc.nodes[id]?.zones?.[zone] ?? []
}

/** Where a node sits: its parent id, zone name, and index. Null for the root. */
export interface NodeLocation {
  parentId: string
  zone: string
  index: number
}

/** Find the parent location of a node id, or null if it is the root or absent. */
export function findParent(doc: ComposedDocument, id: string): NodeLocation | null {
  for (const [parentId, node] of Object.entries(doc.nodes)) {
    if (!node.zones) continue
    for (const [zone, children] of Object.entries(node.zones)) {
      const index = children.indexOf(id)
      if (index !== -1) return { parentId, zone, index }
    }
  }
  return null
}

/**
 * Collect a node id and all of its descendants, depth first. The node's own id
 * comes first. Useful for delete and duplicate.
 */
export function collectSubtree(doc: ComposedDocument, id: string): string[] {
  const out: string[] = []
  const stack: string[] = [id]
  while (stack.length > 0) {
    const current = stack.pop() as string
    out.push(current)
    const node = doc.nodes[current]
    if (!node?.zones) continue
    // Push children so they pop in document order.
    const childIds: string[] = []
    for (const children of Object.values(node.zones)) childIds.push(...children)
    for (let i = childIds.length - 1; i >= 0; i -= 1) stack.push(childIds[i] as string)
  }
  return out
}

/** Visit every node id reachable from the root, depth first, parents first. */
export function walk(doc: ComposedDocument, visit: (id: string, node: PageNode) => void): void {
  for (const id of collectSubtree(doc, doc.root)) {
    const node = doc.nodes[id]
    if (node) visit(id, node)
  }
}

/** True when `ancestorId` is `id` or contains `id` somewhere below it. */
export function isDescendant(doc: ComposedDocument, ancestorId: string, id: string): boolean {
  return collectSubtree(doc, ancestorId).includes(id)
}

/**
 * Deep clone a node and the subtree under it, assigning fresh ids to every
 * cloned node. Returns the new root id and the map of new nodes to merge in.
 */
export function cloneSubtree(
  doc: ComposedDocument,
  id: string,
  taken: Record<string, unknown>,
): { rootId: string; nodes: Record<string, PageNode> } {
  const idMap = new Map<string, string>()
  const pool: Record<string, unknown> = { ...taken }

  // First pass: allocate new ids for every node in the subtree.
  for (const oldId of collectSubtree(doc, id)) {
    const newId = createId(CHILD_PREFIX, pool)
    pool[newId] = true
    idMap.set(oldId, newId)
  }

  // Second pass: clone each node, remapping zone child ids.
  const nodes: Record<string, PageNode> = {}
  for (const [oldId, newId] of idMap) {
    const source = doc.nodes[oldId]
    if (!source) continue
    const clone: PageNode = { type: source.type }
    if (source.props) clone.props = deepClone(source.props)
    if (source.zones) {
      const zones: Record<string, string[]> = {}
      for (const [zone, children] of Object.entries(source.zones)) {
        zones[zone] = children.map((childId) => idMap.get(childId) ?? childId)
      }
      clone.zones = zones
    }
    nodes[newId] = clone
  }

  return { rootId: idMap.get(id) as string, nodes }
}
