<script setup lang="ts">
/** Auto-generated prop form for the selected node, built from its field defs. */
import { computed, inject } from 'vue'
import { editorStoreKey } from './store.js'
import FieldRow from './FieldRow.vue'
import { Icon } from './icons.js'

const injected = inject(editorStoreKey)
if (!injected) throw new Error('Inspector must be used inside PageComposer')
const store = injected

const selectedId = store.selectedId
const node = computed(() =>
  selectedId.value ? store.doc.value.nodes[selectedId.value] : undefined,
)
const componentConfig = computed(() =>
  node.value ? store.config.components[node.value.type] : undefined,
)
const fieldEntries = computed(() => Object.entries(componentConfig.value?.fields ?? {}))
const whenExpr = computed(() => node.value?.when ?? '')

function onWhenInput(event: Event): void {
  if (selectedId.value) store.setWhen(selectedId.value, (event.target as HTMLInputElement).value)
}
</script>

<template>
  <template v-if="selectedId && node && componentConfig">
    <div class="pc-insp-head">
      <div class="pc-ih-ico"><Icon :name="componentConfig.icon ?? 'card'" /></div>
      <div class="pc-ih-t">
        <div class="pc-ih-name">{{ componentConfig.label }}</div>
        <div class="pc-ih-sub">{{ node.type }} · #{{ selectedId }}</div>
      </div>
    </div>
    <div class="pc-pbody">
      <FieldRow
        v-for="[key, field] in fieldEntries"
        :key="key"
        :node-id="selectedId"
        :field-key="key"
        :field="field"
      />
      <div v-if="fieldEntries.length === 0" class="pc-insp-empty">
        This component has no editable fields.
      </div>

      <div class="pc-visibility">
        <div class="pc-flabel"><label>Visible when</label></div>
        <input
          class="pc-inp"
          :value="whenExpr"
          placeholder="always · e.g. user.isPro"
          @input="onWhenInput"
        />
      </div>
    </div>
  </template>

  <div v-else class="pc-pbody">
    <div class="pc-insp-empty">Select a component on the canvas to edit its props.</div>
  </div>
</template>
