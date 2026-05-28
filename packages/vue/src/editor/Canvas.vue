<script setup lang="ts">
/**
 * The authoring canvas. Renders the same ComposedPage the host ships, inside a
 * device frame for viewport preview. The editor bridge is provided by
 * PageComposer above, so the renderer draws selection chrome and drop targets.
 *
 * Drop handling is delegated here. One placement function reads the document
 * attributes the renderer stamps onto nodes and zones, and returns both the
 * resolved target and the on-screen indicator, so what you see is exactly where
 * the block lands. The indicator is axis-aware: a horizontal line in a stack, a
 * vertical line in a row or grid, a filled highlight over an empty zone.
 */
import { inject, ref } from 'vue'
import { findParent, zoneAccepts, type DropTarget } from '@page-composer/core'
import { editorStoreKey } from './store.js'
import ComposedPage from '../renderer/ComposedPage.vue'

defineProps<{
  viewport: 'desktop' | 'tablet' | 'mobile'
  route?: string
  data?: Record<string, unknown>
}>()

const injected = inject(editorStoreKey)
if (!injected) throw new Error('Canvas must be used inside PageComposer')
const store = injected

/** The type being dragged, from the palette or an existing node. */
function draggedType(): string | null {
  if (store.dragType.value) return store.dragType.value
  const movingId = store.dragNodeId.value
  if (movingId) return store.doc.value.nodes[movingId]?.type ?? null
  return null
}

/** Whether the dragged type may drop into a zone, per the config allow-list. */
function accepts(parentId: string, zone: string): boolean {
  const type = draggedType()
  if (!type) return true
  const parentType = store.doc.value.nodes[parentId]?.type
  if (!parentType) return true
  return zoneAccepts(store.config, parentType, zone, type)
}

const stageEl = ref<HTMLElement | null>(null)

interface Indicator {
  left: number
  top: number
  width: number
  height: number
  kind: 'line' | 'zone'
}
const indicator = ref<Indicator | null>(null)

interface Placement {
  target: DropTarget
  indicator: Indicator
}

function siblingsAreHorizontal(el: HTMLElement): boolean {
  const parent = el.parentElement
  if (!parent) return false
  const rect = el.getBoundingClientRect()
  for (const child of Array.from(parent.children)) {
    if (child === el) continue
    if (!(child instanceof HTMLElement) || child.dataset.pcNodeId === undefined) continue
    const sibling = child.getBoundingClientRect()
    if (Math.abs(sibling.top - rect.top) < rect.height / 2) return true
  }
  return false
}

function placementFromEvent(event: DragEvent): Placement | null {
  const stage = stageEl.value
  const targetEl = event.target as HTMLElement | null
  if (!stage || !targetEl) return null
  const stageRect = stage.getBoundingClientRect()
  const localX = (clientLeft: number): number => clientLeft - stageRect.left + stage.scrollLeft
  const localY = (clientTop: number): number => clientTop - stageRect.top + stage.scrollTop

  // Empty zone: highlight the whole drop area rather than draw a line.
  const emptyZone = targetEl.closest<HTMLElement>('.pc-zone-empty')
  if (emptyZone?.dataset.pcParent && emptyZone.dataset.pcZone) {
    if (!accepts(emptyZone.dataset.pcParent, emptyZone.dataset.pcZone)) return null
    const rect = emptyZone.getBoundingClientRect()
    return {
      target: { parentId: emptyZone.dataset.pcParent, zone: emptyZone.dataset.pcZone, index: 0 },
      indicator: {
        left: localX(rect.left),
        top: localY(rect.top),
        width: rect.width,
        height: rect.height,
        kind: 'zone',
      },
    }
  }

  // Over a node: insertion line before or after, oriented to the layout axis.
  const nodeEl = targetEl.closest<HTMLElement>('.pc-cmp')
  if (nodeEl?.dataset.pcNodeId) {
    const location = findParent(store.doc.value, nodeEl.dataset.pcNodeId)
    if (location) {
      if (!accepts(location.parentId, location.zone)) return null
      const rect = nodeEl.getBoundingClientRect()
      const horizontal = siblingsAreHorizontal(nodeEl)
      const after = horizontal
        ? event.clientX > rect.left + rect.width / 2
        : event.clientY > rect.top + rect.height / 2
      const line: Indicator = horizontal
        ? {
            left: localX(after ? rect.right : rect.left) - 1,
            top: localY(rect.top),
            width: 2,
            height: rect.height,
            kind: 'line',
          }
        : {
            left: localX(rect.left),
            top: localY(after ? rect.bottom : rect.top) - 1,
            width: rect.width,
            height: 2,
            kind: 'line',
          }
      return {
        target: {
          parentId: location.parentId,
          zone: location.zone,
          index: after ? location.index + 1 : location.index,
        },
        indicator: line,
      }
    }
  }

  // Over the open area of a root zone: append, line at the bottom edge.
  const rootZone = targetEl.closest<HTMLElement>('.pc-root-zone')
  if (rootZone?.dataset.pcParent && rootZone.dataset.pcZone) {
    if (!accepts(rootZone.dataset.pcParent, rootZone.dataset.pcZone)) return null
    const rect = rootZone.getBoundingClientRect()
    return {
      target: { parentId: rootZone.dataset.pcParent, zone: rootZone.dataset.pcZone },
      indicator: {
        left: localX(rect.left),
        top: localY(rect.bottom) - 2,
        width: rect.width,
        height: 2,
        kind: 'line',
      },
    }
  }

  return null
}

function autoScroll(event: DragEvent): void {
  const stage = stageEl.value
  if (!stage) return
  const rect = stage.getBoundingClientRect()
  const edge = 48
  if (event.clientY < rect.top + edge) stage.scrollTop -= 14
  else if (event.clientY > rect.bottom - edge) stage.scrollTop += 14
}

function onDragOver(event: DragEvent): void {
  event.preventDefault()
  const placement = placementFromEvent(event)
  if (event.dataTransfer) {
    // A rejected drop (zone restriction or no target) shows the no-drop cursor.
    event.dataTransfer.dropEffect = !placement ? 'none' : store.dragNodeId.value ? 'move' : 'copy'
  }
  indicator.value = placement?.indicator ?? null
  autoScroll(event)
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  const placement = placementFromEvent(event)
  const type = store.dragType.value
  const movingId = store.dragNodeId.value
  if (placement) {
    const { parentId, zone, index } = placement.target
    if (type) store.insert(type, parentId, zone, index)
    else if (movingId && movingId !== parentId) store.move(movingId, parentId, zone, index)
  }
  clearDrag()
}

function clearDrag(): void {
  indicator.value = null
  store.dragType.value = null
  store.dragNodeId.value = null
}

function onDragLeave(event: DragEvent): void {
  const related = event.relatedTarget as Node | null
  if (!stageEl.value || !related || !stageEl.value.contains(related)) {
    indicator.value = null
  }
}

function onCanvasClick(): void {
  store.select(null)
}
</script>

<template>
  <main
    ref="stageEl"
    class="pc-stage"
    @click.self="onCanvasClick"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @dragend="clearDrag"
  >
    <div class="pc-device" :class="`pc-${viewport}`">
      <div class="pc-url">
        <span class="pc-dot" style="background: #e07a5f" />
        <span class="pc-dot" style="background: #e0a049" />
        <span class="pc-dot" style="background: #54bdb6" />
        <span class="pc-pill">yoursite.dev {{ route ?? '/' }}</span>
      </div>
      <ComposedPage :config="store.config" :model="store.doc.value" :data="data" />
    </div>

    <div
      v-if="indicator"
      class="pc-drop-indicator"
      :class="indicator.kind === 'zone' ? 'pc-di-zone' : 'pc-di-line'"
      :style="{
        left: indicator.left + 'px',
        top: indicator.top + 'px',
        width: indicator.width + 'px',
        height: indicator.height + 'px',
      }"
    />
  </main>
</template>
