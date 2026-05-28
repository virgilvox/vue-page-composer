/**
 * Pure mutations over the document. Every function returns a new document and
 * never touches the input. Because the node map is flat, moves, copies, and
 * deletes are id operations rather than tree surgery.
 */

import type { ComposedDocument, PageNode, PropValue } from './types.js'
import { CHILD_PREFIX, createId } from './ids.js'
import { cloneSubtree, collectSubtree, findParent, isDescendant } from './document.js'
import { deepClone } from './clone.js'

function cloneDoc(doc: ComposedDocument): ComposedDocument {
  return deepClone(doc)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Where a new or moved node should land. */
export interface DropTarget {
  parentId: string
  zone: string
  /** Insertion index in the target zone. Appends when omitted. */
  index?: number
}

export interface NewNode {
  type: string
  props?: Record<string, PropValue>
  /** Initialize empty zones for a container component. */
  zones?: string[]
}

/** Insert a fresh node into a zone. Returns the new document and the new id. */
export function insertNode(
  doc: ComposedDocument,
  node: NewNode,
  target: DropTarget,
): { doc: ComposedDocument; id: string } {
  const next = cloneDoc(doc)
  const parent = next.nodes[target.parentId]
  if (!parent) throw new Error(`insertNode: parent "${target.parentId}" not found`)

  const id = createId(CHILD_PREFIX, next.nodes)
  const created: PageNode = { type: node.type }
  if (node.props) created.props = deepClone(node.props)
  if (node.zones && node.zones.length > 0) {
    const zones: Record<string, string[]> = {}
    for (const zone of node.zones) zones[zone] = []
    created.zones = zones
  }
  next.nodes[id] = created

  if (!parent.zones) parent.zones = {}
  const children = parent.zones[target.zone] ?? (parent.zones[target.zone] = [])
  const at = target.index === undefined ? children.length : clamp(target.index, 0, children.length)
  children.splice(at, 0, id)

  return { doc: next, id }
}

/**
 * Move an existing node to a new location. The index is interpreted against
 * the target zone after the node has been detached from its current spot, so
 * the result is predictable whether or not the move stays in the same zone.
 * Moving a node into its own subtree is rejected.
 */
export function moveNode(doc: ComposedDocument, id: string, target: DropTarget): ComposedDocument {
  if (id === doc.root) throw new Error('moveNode: cannot move the root')
  if (isDescendant(doc, id, target.parentId)) {
    throw new Error('moveNode: cannot move a node into its own subtree')
  }
  const next = cloneDoc(doc)
  const from = findParent(next, id)
  if (!from) throw new Error(`moveNode: node "${id}" has no parent`)

  // Detach from current location.
  const fromChildren = next.nodes[from.parentId]?.zones?.[from.zone]
  if (fromChildren) fromChildren.splice(from.index, 1)

  // Attach to target.
  const parent = next.nodes[target.parentId]
  if (!parent) throw new Error(`moveNode: parent "${target.parentId}" not found`)
  if (!parent.zones) parent.zones = {}
  const toChildren = parent.zones[target.zone] ?? (parent.zones[target.zone] = [])
  const at =
    target.index === undefined ? toChildren.length : clamp(target.index, 0, toChildren.length)
  toChildren.splice(at, 0, id)

  return next
}

/** Remove a node and its whole subtree. The root cannot be removed. */
export function removeNode(doc: ComposedDocument, id: string): ComposedDocument {
  if (id === doc.root) throw new Error('removeNode: cannot remove the root')
  const next = cloneDoc(doc)
  const location = findParent(next, id)
  if (location) {
    const children = next.nodes[location.parentId]?.zones?.[location.zone]
    if (children) children.splice(location.index, 1)
  }
  for (const descendantId of collectSubtree(doc, id)) {
    delete next.nodes[descendantId]
  }
  return next
}

/**
 * Duplicate a node and its subtree, inserting the copy directly after the
 * original in the same zone. Returns the new document and the clone's id.
 */
export function duplicateNode(
  doc: ComposedDocument,
  id: string,
): { doc: ComposedDocument; id: string } {
  if (id === doc.root) throw new Error('duplicateNode: cannot duplicate the root')
  const location = findParent(doc, id)
  if (!location) throw new Error(`duplicateNode: node "${id}" has no parent`)

  const { rootId, nodes } = cloneSubtree(doc, id, doc.nodes)
  const next = cloneDoc(doc)
  Object.assign(next.nodes, nodes)
  const children = next.nodes[location.parentId]?.zones?.[location.zone]
  if (children) children.splice(location.index + 1, 0, rootId)

  return { doc: next, id: rootId }
}

/** Set one prop on a node to a literal or binding value. */
export function setProp(
  doc: ComposedDocument,
  id: string,
  key: string,
  value: PropValue,
): ComposedDocument {
  const next = cloneDoc(doc)
  const node = next.nodes[id]
  if (!node) throw new Error(`setProp: node "${id}" not found`)
  if (!node.props) node.props = {}
  node.props[key] = value
  return next
}

/** Remove one prop from a node. */
export function removeProp(doc: ComposedDocument, id: string, key: string): ComposedDocument {
  const next = cloneDoc(doc)
  const node = next.nodes[id]
  if (!node?.props) return next
  delete node.props[key]
  return next
}

/** Bind a prop to a data expression. */
export function setBinding(
  doc: ComposedDocument,
  id: string,
  key: string,
  expression: string,
): ComposedDocument {
  return setProp(doc, id, key, { $bind: expression })
}

/** Replace a bound prop with a literal value, clearing the binding. */
export function clearBinding(
  doc: ComposedDocument,
  id: string,
  key: string,
  value: PropValue = '',
): ComposedDocument {
  return setProp(doc, id, key, value)
}
