<script setup lang="ts">
/**
 * Draggable component entries, grouped by category and searchable. Click to add
 * near the selection; drag to drop onto a zone in the canvas.
 */
import { computed, inject, ref } from 'vue'
import { editorStoreKey } from './store.js'
import { Icon } from './icons.js'

const injected = inject(editorStoreKey)
if (!injected) throw new Error('Palette must be used inside PageComposer')
const store = injected

const query = ref('')

interface Entry {
  type: string
  label: string
  icon: string
  isData: boolean
}
interface Group {
  key: string
  title: string
  order: number
  note: string | undefined
  entries: Entry[]
}

const groups = computed<Group[]>(() => {
  const categories = store.config.categories ?? {}
  const buckets = new Map<string, Entry[]>()
  const term = query.value.trim().toLowerCase()

  for (const [type, component] of Object.entries(store.config.components)) {
    if (
      term &&
      !component.label.toLowerCase().includes(term) &&
      !type.toLowerCase().includes(term)
    ) {
      continue
    }
    const category = component.category ?? 'other'
    const entry: Entry = {
      type,
      label: component.label,
      icon: component.icon ?? 'card',
      isData: category === 'data',
    }
    const bucket = buckets.get(category)
    if (bucket) bucket.push(entry)
    else buckets.set(category, [entry])
  }

  return [...buckets.entries()]
    .map(([key, entries]) => ({
      key,
      title: categories[key]?.title ?? key,
      order: categories[key]?.order ?? 99,
      note: key === 'data' ? 'bound to app' : undefined,
      entries,
    }))
    .sort((a, b) => a.order - b.order)
})

function onDragStart(event: DragEvent, type: string): void {
  store.dragType.value = type
  store.dragNodeId.value = null
  event.dataTransfer?.setData('text/plain', type)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'
}

function onDragEnd(): void {
  store.dragType.value = null
}
</script>

<template>
  <div class="pc-pbody">
    <div class="pc-search">
      <Icon name="search" />
      <input v-model="query" placeholder="Search registered blocks…" aria-label="Search blocks" />
    </div>

    <template v-for="group in groups" :key="group.key">
      <div class="pc-cat-label">
        {{ group.title }}
        <span v-if="group.note" class="pc-cat-note"> · {{ group.note }}</span>
      </div>
      <div class="pc-blocks">
        <button
          v-for="entry in group.entries"
          :key="entry.type"
          class="pc-block"
          :class="{ 'pc-block-data': entry.isData }"
          type="button"
          draggable="true"
          :aria-label="`Add ${entry.label}`"
          @click="store.addBlock(entry.type)"
          @dragstart="onDragStart($event, entry.type)"
          @dragend="onDragEnd"
        >
          <span class="pc-bi"><Icon :name="entry.icon" /></span>
          <span class="pc-bn">{{ entry.label }}</span>
        </button>
      </div>
    </template>

    <div v-if="groups.length === 0" class="pc-insp-empty">No blocks match your search.</div>
  </div>
</template>
