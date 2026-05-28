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

### object and array

Nested field groups and repeatable lists. These are defined in the model and on the roadmap for full inspector support.

```ts
cta: { type: 'object', fields: { label: { type: 'text' }, href: { type: 'text' } } }
items: { type: 'array', of: { type: 'text' } }
```

## Default props

`defaultProps` are applied when an author adds the block, so a new component lands looking complete rather than empty.

## Bindable fields

Set `bindable: true` and the inspector shows a toggle that flips the value between a literal and a `$bind` expression. See [data binding](data-binding.md).
