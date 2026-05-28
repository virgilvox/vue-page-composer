<script setup lang="ts">
/** One row in the outline tree, recursing into its zones. */
import { computed, inject, ref } from 'vue'
import { editorStoreKey } from './store.js'
import { Icon } from './icons.js'

const props = defineProps<{ id: string }>()

const store = inject(editorStoreKey)
if (!store) throw new Error('OutlineNode must be used inside PageComposer')

const open = ref(true)

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
const selected = computed(() => store.selectedId.value === props.id)

const label = computed(() => {
  const titleProp = node.value?.props?.title
  const base = componentConfig.value?.label ?? node.value?.type ?? props.id
  if (typeof titleProp === 'string' && titleProp) return `${base} · ${titleProp}`
  return base
})
</script>

<template>
  <div class="pc-tnode">
    <button class="pc-trow" :class="{ 'pc-sel': selected }" type="button" @click="store.select(id)">
      <span class="pc-tw" @click.stop="open = !open">
        <Icon v-if="hasChildren" name="chevron" :style="open ? '' : 'transform:rotate(-90deg)'" />
      </span>
      <span class="pc-ti"><Icon :name="componentConfig?.icon ?? 'card'" /></span>
      <span class="pc-tt">{{ label }}</span>
      <span class="pc-tag">{{ node?.type }}</span>
    </button>
    <div v-if="hasChildren && open" class="pc-tchildren">
      <OutlineNode v-for="childId in childIds" :key="childId" :id="childId" />
    </div>
  </div>
</template>
