<script setup lang="ts">
/**
 * The authoring canvas. Renders the same ComposedPage the host ships, inside a
 * device frame for viewport preview. The editor bridge is provided by
 * PageComposer above, so the renderer draws selection chrome and drop targets.
 * Drop handling is delegated here from the document attributes the renderer
 * stamps onto nodes and empty zones.
 */
import { inject } from 'vue'
import { findParent } from '@page-composer/core'
import { editorStoreKey } from './store.js'
import ComposedPage from '../renderer/ComposedPage.vue'
import type { DropTarget } from '@page-composer/core'

defineProps<{ viewport: 'desktop' | 'tablet' | 'mobile'; route?: string }>()

const injected = inject(editorStoreKey)
if (!injected) throw new Error('Canvas must be used inside PageComposer')
const store = injected

function resolveTarget(event: DragEvent): DropTarget | null {
  const target = event.target as HTMLElement | null
  if (!target) return null

  const emptyZone = target.closest<HTMLElement>('.pc-zone-empty')
  if (emptyZone) {
    const parentId = emptyZone.dataset.pcParent
    const zone = emptyZone.dataset.pcZone
    if (parentId && zone) return { parentId, zone, index: 0 }
  }

  const nodeEl = target.closest<HTMLElement>('.pc-cmp')
  if (nodeEl?.dataset.pcNodeId) {
    const location = findParent(store.doc.value, nodeEl.dataset.pcNodeId)
    if (location) {
      const rect = nodeEl.getBoundingClientRect()
      const after = event.clientY > rect.top + rect.height / 2
      return {
        parentId: location.parentId,
        zone: location.zone,
        index: after ? location.index + 1 : location.index,
      }
    }
  }

  const rootZone = target.closest<HTMLElement>('.pc-root-zone')
  if (rootZone?.dataset.pcParent && rootZone.dataset.pcZone) {
    return { parentId: rootZone.dataset.pcParent, zone: rootZone.dataset.pcZone }
  }

  return null
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  const target = resolveTarget(event)
  const type = store.dragType.value
  const movingId = store.dragNodeId.value
  if (target) {
    if (type) store.insert(type, target.parentId, target.zone, target.index)
    else if (movingId && movingId !== target.parentId) {
      store.move(movingId, target.parentId, target.zone, target.index)
    }
  }
  store.dragType.value = null
  store.dragNodeId.value = null
}

function onCanvasClick(): void {
  store.select(null)
}
</script>

<template>
  <main class="pc-stage" @click.self="onCanvasClick" @dragover.prevent @drop="onDrop">
    <div class="pc-device" :class="`pc-${viewport}`">
      <div class="pc-url">
        <span class="pc-dot" style="background: #e07a5f" />
        <span class="pc-dot" style="background: #e0a049" />
        <span class="pc-dot" style="background: #54bdb6" />
        <span class="pc-pill">yoursite.dev {{ route ?? '/' }}</span>
      </div>
      <ComposedPage :config="store.config" :model="store.doc.value" />
    </div>
  </main>
</template>
