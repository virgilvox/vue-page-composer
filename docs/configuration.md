# Configuration and field types

The config is the contract between your app and Page Composer. It is a plain object, typed end to end, with no separate schema language to learn.

## Shape

```ts
interface Config {
  components: Record<string, ComponentConfig>
  categories?: Record<string, { title: string; order?: number }>
  rootZones?: string[] // zones on the document root, defaults to ['main']
}

interface ComponentConfig {
  label: string // palette and inspector name
  render: Component // the actual Vue component
  category?: string // groups it in the palette
  icon?: string // palette and outline glyph
  zones?: string[] // droppable child areas, rendered as slots
  accepts?: Record<string, string[]> // per-zone allow-list of component types
  fields?: Record<string, FieldDef> // drives the inspector form
  defaultProps?: Record<string, PropValue> // applied when a block is added
}
```

Use `definePageConfig(...)` so the call site keeps full type inference.

## Zones

A zone is a named, ordered list of child nodes. Declare the zones a component exposes, then render each as a slot of the same name:

```ts
Grid: { label: 'Grid', render: Grid, zones: ['items'] }
```

```vue
<template>
  <div class="grid"><slot name="items" /></div>
</template>
```

Drag and drop targets zones, not raw DOM positions, which keeps nesting rules explicit. The document root has its own zones, `['main']` by default, configurable with `rootZones`.

### Restricting what a zone accepts

`accepts` is a per-zone allow-list of component types. A zone with no entry accepts any type.

```ts
Grid: {
  label: 'Grid',
  render: Grid,
  zones: ['items'],
  accepts: { items: ['Card'] }, // only Cards may drop into items
}
```

The editor enforces this: a drop into a zone that rejects the dragged type shows the no-drop cursor and is refused, and click-to-add falls back to the root when the selected container will not take the type.

## Field types

The inspector form is generated from `fields`. Every field has an optional `label`, `description`, and `bindable` flag. Field-specific options follow.

### text

A single-line input.

```ts
title: { type: 'text', label: 'Title', placeholder: 'Headline', default: '', bindable: true }
```

### textarea

A multi-line input.

```ts
body: { type: 'textarea', label: 'Body', rows: 4, bindable: true }
```

### number

A stepper with optional unit and bounds.

```ts
padding: { type: 'number', label: 'Padding', unit: 'px', default: 16, min: 0, max: 96, step: 2 }
```

### boolean

A toggle switch.

```ts
elevated: { type: 'boolean', label: 'Elevated shadow', default: false }
```

### select

A dropdown. Options are strings or `{ label, value }`.

```ts
icon: { type: 'select', label: 'Icon', options: ['zap', 'globe', 'shield'], default: 'zap' }
```

### segment

A segmented button group, good for short option sets.

```ts
variant: { type: 'segment', options: ['plain', 'bordered', 'filled'], default: 'bordered' }
```

### color

A swatch plus a hex input.

```ts
accent: { type: 'color', label: 'Accent', default: '#e0a049' }
```

### object

A group of nested fields, edited inline.

```ts
cta: { type: 'object', label: 'Call to action', fields: {
  label: { type: 'text', label: 'Label' },
  href: { type: 'text', label: 'Href' },
} }
```

### array

A repeatable list. `of` is the field definition for each item, and may itself be an object or another array. The inspector renders add, remove, and reorder controls.

```ts
badges: { type: 'array', label: 'Badges', of: { type: 'text' } }
links: { type: 'array', of: { type: 'object', fields: {
  label: { type: 'text' }, href: { type: 'text' },
} } }
```

### custom

A field rendered by a component you register, for types the library does not ship. The `component` name keys into the `fieldComponents` map you pass to `PageComposer`.

```ts
// in the config
icon: { type: 'custom', label: 'Icon', component: 'iconPicker' }
```

```vue
<!-- register the component -->
<PageComposer :config="config" :field-components="{ iconPicker: IconField }" v-model="doc" />
```

The custom component follows the `v-model` contract. It receives `modelValue` and the `field` definition, and emits `update:modelValue`:

```vue
<script setup lang="ts">
defineProps<{ modelValue?: string; field?: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
```

## Repeater

Mark a component as a repeater and it renders one zone as a per-item template:

```ts
Repeater: {
  label: 'Repeater',
  render: Repeater,
  zones: ['item'],
  repeat: { zone: 'item', source: 'source' },
  fields: { source: { type: 'text', label: 'Data source', bindable: true } },
}
```

At render time the children of the `item` zone are cloned once per record in the list resolved from the `source` prop, with each clone's data scope set to that record. In the editor the template renders once so it stays editable. See [data binding](data-binding.md) for the resolver details.

## Default props

`defaultProps` are applied when an author adds the block, so a new component lands looking complete rather than empty.

## Bindable fields

Set `bindable: true` and the inspector shows a toggle that flips the value between a literal and a `$bind` expression. See [data binding](data-binding.md).
