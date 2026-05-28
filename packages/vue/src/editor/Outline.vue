<script setup lang="ts">
/**
 * Document tree, kept in sync with canvas selection. Follows the WAI-ARIA tree
 * view pattern: role tree/treeitem/group, aria-expanded and aria-selected, a
 * single roving tabindex, and arrow-key navigation. Up and down move selection
 * through visible nodes; right and left expand, collapse, or step to a child or
 * parent.
 */
import { computed, inject, nextTick, provide, ref } from 'vue'
import { findParent } from '@page-composer/core'
import { editorStoreKey } from './store.js'
import { outlineKey } from './outline.js'
import OutlineNode from './OutlineNode.vue'

const injected = inject(editorStoreKey)
if (!injected) throw new Error('Outline must be used inside PageComposer')
const store = injected

const treeEl = ref<HTMLElement | null>(null)
const collapsed = ref<Set<string>>(new Set())

function isOpen(id: string): boolean {
  return !collapsed.value.has(id)
}
function toggle(id: string): void {
  const next = new Set(collapsed.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsed.value = next
}

function childIdsOf(id: string): string[] {
  const zones = store.doc.value.nodes[id]?.zones
  return zones ? Object.values(zones).flat() : []
}

const rootChildren = computed<string[]>(() => childIdsOf(store.doc.value.root))

interface VisibleRow {
  id: string
  depth: number
}
const flatVisible = computed<VisibleRow[]>(() => {
  const out: VisibleRow[] = []
  const walk = (ids: string[], depth: number): void => {
    for (const id of ids) {
      out.push({ id, depth })
      const kids = childIdsOf(id)
      if (kids.length > 0 && isOpen(id)) walk(kids, depth + 1)
    }
  }
  walk(rootChildren.value, 0)
  return out
})

const tabbableId = computed<string | null>(
  () => store.selectedId.value ?? flatVisible.value[0]?.id ?? null,
)

provide(outlineKey, { isOpen, toggle, tabbableId })

function focusRow(id: string): void {
  nextTick(() => {
    treeEl.value?.querySelector<HTMLElement>(`[data-pc-outline-id="${CSS.escape(id)}"]`)?.focus()
  })
}

function selectAndFocus(id: string): void {
  store.select(id)
  focusRow(id)
}

function moveSelection(delta: number): void {
  const list = flatVisible.value
  if (list.length === 0) return
  const current = store.selectedId.value
  let index = list.findIndex((row) => row.id === current)
  index = index < 0 ? (delta > 0 ? 0 : list.length - 1) : index + delta
  if (index < 0 || index >= list.length) return
  selectAndFocus(list[index]!.id)
}

function onKeydown(event: KeyboardEvent): void {
  const id = store.selectedId.value
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveSelection(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveSelection(-1)
      break
    case 'Home':
      event.preventDefault()
      if (flatVisible.value[0]) selectAndFocus(flatVisible.value[0].id)
      break
    case 'End': {
      event.preventDefault()
      const last = flatVisible.value.at(-1)
      if (last) selectAndFocus(last.id)
      break
    }
    case 'ArrowRight': {
      if (!id) break
      event.preventDefault()
      const kids = childIdsOf(id)
      if (kids.length === 0) break
      if (!isOpen(id)) toggle(id)
      else selectAndFocus(kids[0]!)
      break
    }
    case 'ArrowLeft': {
      if (!id) break
      event.preventDefault()
      const kids = childIdsOf(id)
      if (kids.length > 0 && isOpen(id)) {
        toggle(id)
      } else {
        const location = findParent(store.doc.value, id)
        if (location && location.parentId !== store.doc.value.root)
          selectAndFocus(location.parentId)
      }
      break
    }
    default:
      break
  }
}
</script>

<template>
  <div class="pc-pbody">
    <div ref="treeEl" class="pc-tree" role="tree" aria-label="Page outline" @keydown="onKeydown">
      <OutlineNode v-for="id in rootChildren" :key="id" :id="id" :depth="1" />
      <div v-if="rootChildren.length === 0" class="pc-insp-empty">
        The page is empty. Add a block from the Blocks tab.
      </div>
    </div>
  </div>
</template>
