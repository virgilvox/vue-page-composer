/**
 * Drop-index math for the canvas. The canvas computes an insertion index
 * against the zone as it currently looks, including the node being dragged.
 * When that node is detached from earlier in the same zone, every later index
 * shifts left by one, so the raw index is one too high. This corrects for it.
 */
import type { DropTarget, NodeLocation } from '@page-composer/core'

export function adjustForDetach(target: DropTarget, from: NodeLocation | null): DropTarget {
  if (!from || target.index === undefined) return target
  const sameZone = from.parentId === target.parentId && from.zone === target.zone
  if (sameZone && from.index < target.index) {
    return { ...target, index: target.index - 1 }
  }
  return target
}
