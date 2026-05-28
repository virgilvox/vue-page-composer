<script setup lang="ts">
/**
 * One inspector row: label, an optional binding toggle, and the input control.
 * The control itself is delegated to FieldInput; this component owns the label,
 * the literal-vs-binding switch, and the write back to the document store.
 */
import { computed, inject } from 'vue'
import { isBinding, type FieldDef, type PropValue } from '@page-composer/core'
import { editorStoreKey } from './store.js'
import { Icon } from './icons.js'
import FieldInput from './FieldInput.vue'

const props = defineProps<{
  nodeId: string
  fieldKey: string
  field: FieldDef
}>()

const injected = inject(editorStoreKey)
if (!injected) throw new Error('FieldRow must be used inside PageComposer')
const store = injected

const rawValue = computed<PropValue | undefined>(
  () => store.doc.value.nodes[props.nodeId]?.props?.[props.fieldKey],
)

const bound = computed(() => isBinding(rawValue.value))
const bindExpression = computed(() => (isBinding(rawValue.value) ? rawValue.value.$bind : ''))
const label = computed(() => props.field.label ?? props.fieldKey)

// Binding only makes sense for scalar fields, not nested or custom ones.
const SCALAR = new Set(['text', 'textarea', 'number', 'select', 'segment', 'color'])
const canBind = computed(() => props.field.bindable === true && SCALAR.has(props.field.type))

const literal = computed<unknown>(() => (isBinding(rawValue.value) ? undefined : rawValue.value))

function set(value: unknown): void {
  store.setField(props.nodeId, props.fieldKey, value as PropValue)
}

function defaultLiteral(): PropValue {
  const field = props.field
  if ('default' in field && field.default !== undefined) return field.default as PropValue
  if (field.type === 'boolean') return false
  if (field.type === 'number') return 0
  return ''
}

function toggleBind(): void {
  if (bound.value) store.unbindField(props.nodeId, props.fieldKey, defaultLiteral())
  else store.bindField(props.nodeId, props.fieldKey, '')
}

function onBindInput(event: Event): void {
  store.bindField(props.nodeId, props.fieldKey, (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="pc-field">
    <div class="pc-flabel">
      <label>{{ label }}</label>
      <button
        v-if="canBind"
        class="pc-bind"
        :class="{ 'pc-off': !bound }"
        type="button"
        @click="toggleBind"
      >
        <Icon name="link" />{{ bound ? 'bound' : 'static' }}
      </button>
    </div>

    <input
      v-if="bound"
      class="pc-inp pc-bound"
      :value="bindExpression"
      placeholder="data path, e.g. feature.title"
      @input="onBindInput"
    />
    <FieldInput v-else :field="field" :model-value="literal" @update:model-value="set" />

    <p v-if="field.description" class="pc-fhint">{{ field.description }}</p>
  </div>
</template>
