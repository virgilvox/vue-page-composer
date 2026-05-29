# Getting started

Page Composer is a library you embed in your own Vue or Nuxt app. It gives you a visual editor (`PageComposer`) and a runtime renderer (`ComposedPage`). Both read one config object that lists the components an author may place and the fields that drive their props.

## Install

```bash
pnpm add vue-page-composer
# or: pnpm add @page-composer/vue
```

Import the stylesheet once, near your app entry:

```ts
import 'vue-page-composer/styles.css'
```

## 1. Write a config

The config points at your real components and describes their fields. There is no schema language; it is plain objects and imported components.

```ts
// page-config.ts
import { definePageConfig } from 'vue-page-composer'
import Hero from '@/components/Hero.vue'
import Card from '@/components/Card.vue'
import Grid from '@/components/Grid.vue'

export const config = definePageConfig({
  categories: {
    layout: { title: 'Layout', order: 0 },
    content: { title: 'Content', order: 1 },
  },
  components: {
    Grid: {
      label: 'Grid',
      category: 'layout',
      render: Grid,
      zones: ['items'], // a droppable child area, rendered as a slot
      fields: { cols: { type: 'number', label: 'Columns', default: 3 } },
      defaultProps: { cols: 3 },
    },
    Hero: {
      label: 'Hero',
      category: 'content',
      render: Hero,
      fields: {
        title: { type: 'text', label: 'Title', bindable: true },
        subtitle: { type: 'textarea', label: 'Subtitle' },
      },
    },
    Card: {
      label: 'Card',
      category: 'content',
      render: Card,
      fields: {
        title: { type: 'text', label: 'Title', bindable: true },
        body: { type: 'textarea', label: 'Body' },
        variant: { type: 'segment', options: ['plain', 'bordered', 'filled'], default: 'bordered' },
      },
    },
  },
})
```

A component that exposes a zone renders it as a named slot:

```vue
<!-- Grid.vue -->
<template>
  <div class="grid"><slot name="items" /></div>
</template>
```

## 2. Mount the editor

`PageComposer` is controlled. Bind a document with `v-model` and persist on `@change`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PageComposer, createDocument } from 'vue-page-composer'
import type { ComposedDocument } from 'vue-page-composer'
import { config } from './page-config'

const doc = ref<ComposedDocument>(createDocument())

function save(next: ComposedDocument) {
  // store it wherever you like: API, file, localStorage
  localStorage.setItem('home.page', JSON.stringify(next))
}
</script>

<template>
  <PageComposer v-model="doc" :config="config" @change="save" @publish="save" />
</template>
```

The host owns persistence. Page Composer never talks to storage; it hands you the document and you decide what to do.

Pass `:isolate="true"` to render the canvas in an iframe for true CSS isolation, so the host's component styles apply exactly as in production and width-based media queries respond to the device width rather than the editor window. In this mode, insertion is click-to-add and keyboard; the default inline canvas has full drag and drop.

## 3. Render the saved page

On any route, load the document and render it with the same config:

```vue
<script setup lang="ts">
import { ComposedPage } from 'vue-page-composer'
import { config } from './page-config'

const doc = JSON.parse(localStorage.getItem('home.page') ?? 'null')
</script>

<template>
  <ComposedPage :config="config" :model="doc" />
</template>
```

That is the whole loop: register components, author a document, render it. From here:

- [Configuration and field types](configuration.md) covers every field type and config option.
- [Data binding](data-binding.md) shows how a prop reads from your app's data instead of a static value.
- [Keyboard shortcuts](keyboard-shortcuts.md) lists the editor shortcuts.

## Try the playground

The repository ships a runnable demo:

```bash
pnpm install
pnpm --filter playground dev
```
