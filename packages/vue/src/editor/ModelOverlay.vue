<script setup lang="ts">
/** Read-only view of the serialized document, the portable JSON the host saves. */
import { computed, inject } from 'vue'
import { serialize } from '@page-composer/core'
import { editorStoreKey } from './store.js'
import { Icon } from './icons.js'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ close: [] }>()

const store = inject(editorStoreKey)
if (!store) throw new Error('ModelOverlay must be used inside PageComposer')

const json = computed(() => serialize(store.doc.value, true))
const nodeCount = computed(() => Object.keys(store.doc.value.nodes).length)
</script>

<template>
  <div v-if="show" class="pc-json-wrap" @click.self="emit('close')">
    <div class="pc-json-card">
      <div class="pc-jh">
        <div class="pc-jt">
          Document model
          <span class="pc-pin">portable · {{ nodeCount }} nodes</span>
        </div>
        <button class="pc-ico-btn" type="button" aria-label="Close" @click="emit('close')">
          <Icon name="close" />
        </button>
      </div>
      <pre>{{ json }}</pre>
    </div>
  </div>
</template>
