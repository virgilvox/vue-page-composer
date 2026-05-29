<script setup lang="ts">
/**
 * A value-based input control for one field. Pure in and out: it takes the
 * current value and emits the next one, so it composes recursively for object
 * and array fields and never reaches into the document itself. FieldRow wraps
 * it with the label, the binding toggle, and the store write.
 */
import { computed, inject } from 'vue'
import type { FieldDef, FieldOption, Literal } from '@page-composer/core'
import { editorStoreKey } from './store.js'

const props = defineProps<{ field: FieldDef; modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const store = inject(editorStoreKey, null)

function update(value: unknown): void {
  emit('update:modelValue', value)
}

function asString(): string {
  const v = props.modelValue
  return v === undefined || v === null ? '' : String(v)
}
function asNumber(): number {
  const v = Number(props.modelValue)
  return Number.isFinite(v) ? v : 0
}
function asBool(): boolean {
  return props.modelValue === true
}

function options(): { label: string; value: string | number }[] {
  if (props.field.type !== 'select' && props.field.type !== 'segment') return []
  return props.field.options.map((option: FieldOption) =>
    typeof option === 'string' ? { label: option, value: option } : option,
  )
}

// A select's DOM value is always a string; map it back to the option's own
// value so numeric options keep their type in the document.
function onSelect(event: Event): void {
  const raw = (event.target as HTMLSelectElement).value
  const match = options().find((option) => String(option.value) === raw)
  update(match ? match.value : raw)
}

const unit = computed(() => (props.field.type === 'number' ? props.field.unit : undefined))

function step(delta: number): void {
  if (props.field.type !== 'number') return
  const next = asNumber() + delta
  const min = props.field.min ?? -Infinity
  const max = props.field.max ?? Infinity
  update(Math.max(min, Math.min(max, next)))
}

// object
const objectValue = computed<Record<string, unknown>>(() =>
  props.modelValue && typeof props.modelValue === 'object' && !Array.isArray(props.modelValue)
    ? (props.modelValue as Record<string, unknown>)
    : {},
)
function setKey(key: string, value: unknown): void {
  update({ ...objectValue.value, [key]: value })
}
const objectFields = computed(() =>
  props.field.type === 'object' ? Object.entries(props.field.fields) : [],
)

// array
const arrayValue = computed<unknown[]>(() =>
  Array.isArray(props.modelValue) ? props.modelValue : [],
)
function defaultFor(field: FieldDef): unknown {
  if ('default' in field && field.default !== undefined) return field.default
  switch (field.type) {
    case 'boolean':
      return false
    case 'number':
      return 0
    case 'object':
      return {}
    case 'array':
      return []
    default:
      return ''
  }
}
function addItem(): void {
  if (props.field.type !== 'array') return
  update([...arrayValue.value, defaultFor(props.field.of) as Literal])
}
function setItem(index: number, value: unknown): void {
  const next = arrayValue.value.slice()
  next[index] = value
  update(next)
}
function removeItem(index: number): void {
  const next = arrayValue.value.slice()
  next.splice(index, 1)
  update(next)
}
function moveItem(index: number, delta: number): void {
  const target = index + delta
  if (target < 0 || target >= arrayValue.value.length) return
  const next = arrayValue.value.slice()
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  update(next)
}
function subLabel(field: FieldDef, key: string): string {
  return field.label ?? key
}

// custom
const customComponent = computed(() => {
  if (props.field.type !== 'custom') return undefined
  return store?.fieldComponents?.[props.field.component]
})
</script>

<template>
  <input
    v-if="field.type === 'text'"
    class="pc-inp"
    :value="asString()"
    :placeholder="field.placeholder"
    @input="update(($event.target as HTMLInputElement).value)"
  />

  <textarea
    v-else-if="field.type === 'textarea'"
    class="pc-txa"
    :rows="field.rows"
    :value="asString()"
    :placeholder="field.placeholder"
    @input="update(($event.target as HTMLTextAreaElement).value)"
  />

  <div v-else-if="field.type === 'number'" class="pc-stepper">
    <button type="button" @click="step(-(field.step ?? 1))">&minus;</button>
    <input :value="asNumber()" @input="update(Number(($event.target as HTMLInputElement).value))" />
    <span v-if="unit" class="pc-unit">{{ unit }}</span>
    <button type="button" @click="step(field.step ?? 1)">+</button>
  </div>

  <button
    v-else-if="field.type === 'boolean'"
    class="pc-sw"
    :class="{ 'pc-on': asBool() }"
    type="button"
    role="switch"
    :aria-checked="asBool()"
    @click="update(!asBool())"
  />

  <select v-else-if="field.type === 'select'" class="pc-sel" :value="asString()" @change="onSelect">
    <option v-for="opt in options()" :key="String(opt.value)" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>

  <div v-else-if="field.type === 'segment'" class="pc-seg">
    <button
      v-for="opt in options()"
      :key="String(opt.value)"
      type="button"
      :class="{ 'pc-on': asString() === String(opt.value) }"
      @click="update(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>

  <div v-else-if="field.type === 'color'" class="pc-swatch">
    <input
      class="pc-chip"
      type="color"
      :value="asString() || '#000000'"
      @input="update(($event.target as HTMLInputElement).value)"
    />
    <input
      class="pc-inp pc-hex"
      :value="asString()"
      @input="update(($event.target as HTMLInputElement).value)"
    />
  </div>

  <div v-else-if="field.type === 'object'" class="pc-subfields">
    <div v-for="[key, sub] in objectFields" :key="key" class="pc-subfield">
      <label class="pc-sublabel">{{ subLabel(sub, key) }}</label>
      <FieldInput
        :field="sub"
        :model-value="objectValue[key]"
        @update:model-value="setKey(key, $event)"
      />
    </div>
  </div>

  <div v-else-if="field.type === 'array'" class="pc-array">
    <div v-for="(item, i) in arrayValue" :key="i" class="pc-array-item">
      <div class="pc-array-controls">
        <span class="pc-array-index">{{ i + 1 }}</span>
        <button type="button" title="Move up" @click="moveItem(i, -1)">↑</button>
        <button type="button" title="Move down" @click="moveItem(i, 1)">↓</button>
        <button type="button" title="Remove" class="pc-array-remove" @click="removeItem(i)">
          ×
        </button>
      </div>
      <FieldInput :field="field.of" :model-value="item" @update:model-value="setItem(i, $event)" />
    </div>
    <button type="button" class="pc-array-add" @click="addItem">+ Add item</button>
  </div>

  <component
    :is="customComponent"
    v-else-if="field.type === 'custom' && customComponent"
    :model-value="modelValue"
    :field="field"
    @update:model-value="update"
  />

  <div v-else class="pc-insp-empty" style="padding: 8px 0; text-align: left">
    Unknown field<span v-if="field.type === 'custom'"
      >: no component for "{{ field.component }}"</span
    >
  </div>
</template>
