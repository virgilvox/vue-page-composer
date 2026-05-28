<script setup lang="ts">
/** Document tree, kept in sync with canvas selection through the store. */
import { computed, inject } from 'vue'
import { editorStoreKey } from './store.js'
import OutlineNode from './OutlineNode.vue'

const store = inject(editorStoreKey)
if (!store) throw new Error('Outline must be used inside PageComposer')

const rootChildren = computed<string[]>(() => {
  const root = store.doc.value.nodes[store.doc.value.root]
  if (!root?.zones) return []
  return Object.values(root.zones).flat()
})
</script>

<template>
  <div class="pc-pbody">
    <div class="pc-tree">
      <OutlineNode v-for="id in rootChildren" :key="id" :id="id" />
      <div v-if="rootChildren.length === 0" class="pc-insp-empty">
        The page is empty. Add a block from the Blocks tab.
      </div>
    </div>
  </div>
</template>
