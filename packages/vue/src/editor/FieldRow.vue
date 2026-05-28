<script setup lang="ts">
/**
 * One inspector row: label, optional binding toggle, and the input control
 * matched to the field type. Reads and writes the selected node's prop through
 * the editor store.
 */
import { computed, inject } from 'vue'
import { isBinding, type FieldDef, type FieldOption, type PropValue } from '@page-composer/core'
import { editorStoreKey } from './store.js'
import { Icon } from './icons.js'

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

function options(): { label: string; value: string | number }[] {
  if (props.field.type !== 'select' && props.field.type !== 'segment') return []
  return props.field.options.map((option: FieldOption) =>
    typeof option === 'string' ? { label: option, value: option } : option,
  )
}

function literal(): PropValue {
  return isBinding(rawValue.value) ? '' : (rawValue.value as PropValue)
}

function asString(): string {
  const value = literal()
  return value === undefined || value === null ? '' : String(value)
}

function asNumber(): number {
  const value = Number(literal())
  return Number.isFinite(value) ? value : 0
}

function asBool(): boolean {
  return literal() === true
}

function set(value: PropValue): void {
  store.setField(props.nodeId, props.fieldKey, value)
}

function toggleBind(): void {
  if (bound.value) {
    store.unbindField(props.nodeId, props.fieldKey, defaultLiteral())
  } else {
    store.bindField(props.nodeId, props.fieldKey, '')
  }
}

function defaultLiteral(): PropValue {
  const field = props.field
  if ('default' in field && field.default !== undefined) return field.default as PropValue
  if (field.type === 'boolean') return false
  if (field.type === 'number') return 0
  return ''
}

function onBindInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  store.bindField(props.nodeId, props.fieldKey, value)
}

function step(delta: number): void {
  const field = props.field
  const next = asNumber() + delta
  if (field.type === 'number') {
    const min = field.min ?? -Infinity
    const max = field.max ?? Infinity
    set(Math.max(min, Math.min(max, next)))
    return
  }
  set(next)
}

const unit = computed(() => (props.field.type === 'number' ? props.field.unit : undefined))
</script>

<template>
  <div class="pc-field">
    <div class="pc-flabel">
      <label>{{ label }}</label>
      <button
        v-if="field.bindable"
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

    <template v-else>
      <input
        v-if="field.type === 'text'"
        class="pc-inp"
        :value="asString()"
        :placeholder="field.placeholder"
        @input="set(($event.target as HTMLInputElement).value)"
      />

      <textarea
        v-else-if="field.type === 'textarea'"
        class="pc-txa"
        :rows="field.rows"
        :value="asString()"
        :placeholder="field.placeholder"
        @input="set(($event.target as HTMLTextAreaElement).value)"
      />

      <div v-else-if="field.type === 'number'" class="pc-stepper">
        <button type="button" @click="step(-(field.step ?? 1))">&minus;</button>
        <input
          :value="asNumber()"
          @input="set(Number(($event.target as HTMLInputElement).value))"
        />
        <span v-if="unit" class="pc-unit">{{ unit }}</span>
        <button type="button" @click="step(field.step ?? 1)">+</button>
      </div>

      <div v-else-if="field.type === 'boolean'" class="pc-toggle">
        <label>{{ label }}</label>
        <button
          class="pc-sw"
          :class="{ 'pc-on': asBool() }"
          type="button"
          role="switch"
          :aria-checked="asBool()"
          @click="set(!asBool())"
        />
      </div>

      <select
        v-else-if="field.type === 'select'"
        class="pc-sel"
        :value="asString()"
        @change="set(($event.target as HTMLSelectElement).value)"
      >
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
          @click="set(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <div v-else-if="field.type === 'color'" class="pc-swatch">
        <input
          class="pc-chip"
          type="color"
          :value="asString() || '#000000'"
          @input="set(($event.target as HTMLInputElement).value)"
        />
        <input
          class="pc-inp pc-hex"
          :value="asString()"
          @input="set(($event.target as HTMLInputElement).value)"
        />
      </div>

      <div v-else class="pc-insp-empty" style="padding: 8px 0; text-align: left">
        {{ field.type }} field
      </div>
    </template>

    <p v-if="field.description" class="pc-fhint">{{ field.description }}</p>
  </div>
</template>
