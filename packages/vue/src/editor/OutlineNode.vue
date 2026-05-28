<script setup lang="ts">
/** One row in the outline tree, recursing into its zones. */
import { computed, inject } from 'vue'
import { editorStoreKey } from './store.js'
import { outlineKey } from './outline.js'
import { Icon } from './icons.js'

const props = defineProps<{ id: string; depth: number }>()

const store = inject(editorStoreKey)
if (!store) throw new Error('OutlineNode must be used inside PageComposer')
const outline = inject(outlineKey)
if (!outline) throw new Error('OutlineNode must be used inside Outline')

const node = computed(() => store.doc.value.nodes[props.id])
const componentConfig = computed(() =>
  node.value ? store.config.components[node.value.type] : undefined,
)
const childIds = computed<string[]>(() => {
  const zones = node.value?.zones
  if (!zones) return []
  return Object.values(zones).flat()
})
const hasChildren = computed(() => childIds.value.length > 0)
const open = computed(() => outline.isOpen(props.id))
const selected = computed(() => store.selectedId.value === props.id)
const tabbable = computed(() => outline.tabbableId.value === props.id)

const label = computed(() => {
  const titleProp = node.value?.props?.title
  const base = componentConfig.value?.label ?? node.value?.type ?? props.id
  if (typeof titleProp === 'string' && titleProp) return `${base} · ${titleProp}`
  return base
})
</script>

<template>
  <div class="pc-tnode" role="presentation">
    <div
      class="pc-trow"
      :class="{ 'pc-sel': selected }"
      :data-pc-outline-id="id"
      role="treeitem"
      :aria-level="depth"
      :aria-selected="selected"
      :aria-expanded="hasChildren ? open : undefined"
      :tabindex="tabbable ? 0 : -1"
      @click="store.select(id)"
    >
      <span class="pc-tw" :aria-hidden="true" @click.stop="hasChildren && outline.toggle(id)">
        <Icon v-if="hasChildren" name="chevron" :style="open ? '' : 'transform:rotate(-90deg)'" />
      </span>
      <span class="pc-ti"><Icon :name="componentConfig?.icon ?? 'card'" /></span>
      <span class="pc-tt">{{ label }}</span>
      <span class="pc-tag">{{ node?.type }}</span>
    </div>
    <div v-if="hasChildren && open" class="pc-tchildren" role="group">
      <OutlineNode v-for="childId in childIds" :key="childId" :id="childId" :depth="depth + 1" />
    </div>
  </div>
</template>
