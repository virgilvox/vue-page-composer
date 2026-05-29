/**
 * Valid drop slots for keyboard "pick up and move". A slot is a (parent, zone,
 * index) position the moving node may occupy: the zone must accept its type and
 * must not be inside the node's own subtree. Indices are expressed against the
 * zone with the moving node detached, so they feed straight into `moveNode`.
 */
import {
  findParent,
  isDescendant,
  zoneAccepts,
  type ComposedDocument,
  type Config,
  type DropTarget,
} from '@page-composer/core'
import type { Component } from 'vue'

export function validSlots(
  config: Config<Component>,
  doc: ComposedDocument,
  id: string,
): DropTarget[] {
  const slots: DropTarget[] = []
  const movingType = doc.nodes[id]?.type
  const location = findParent(doc, id)

  const visit = (nodeId: string): void => {
    const node = doc.nodes[nodeId]
    if (!node?.zones) return
    const isRoot = nodeId === doc.root
    const zones = isRoot ? Object.keys(node.zones) : (config.components[node.type]?.zones ?? [])
    for (const zone of zones) {
      const children = node.zones[zone] ?? []
      const intoOwnSubtree = isDescendant(doc, id, nodeId)
      const accepts = !movingType || zoneAccepts(config, node.type, zone, movingType)
      if (!intoOwnSubtree && accepts) {
        const sameZone = location?.parentId === nodeId && location.zone === zone
        const count = sameZone ? children.length - 1 : children.length
        for (let index = 0; index <= count; index += 1)
          slots.push({ parentId: nodeId, zone, index })
      }
      for (const childId of children) {
        if (childId !== id && !isDescendant(doc, id, childId)) visit(childId)
      }
    }
  }

  visit(doc.root)
  return slots
}

/** Index of the slot the node currently occupies, or 0. */
export function currentSlotIndex(doc: ComposedDocument, id: string, slots: DropTarget[]): number {
  const location = findParent(doc, id)
  if (!location) return 0
  const index = slots.findIndex(
    (slot) =>
      slot.parentId === location.parentId &&
      slot.zone === location.zone &&
      slot.index === location.index,
  )
  return index < 0 ? 0 : index
}
