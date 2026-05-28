# @page-composer/vue

The Vue editor and renderer for [Page Composer](https://github.com/virgilvox/vue-page-composer). Register the components you already ship, compose pages on a canvas, and render the saved document on any route.

The unscoped `vue-page-composer` package is the friendly alias for this one.

## Install

```bash
pnpm add @page-composer/vue
```

Import the stylesheet once in your app:

```ts
import '@page-composer/vue/styles.css'
```

## Render a saved page

```vue
<script setup lang="ts">
import { ComposedPage, definePageConfig } from '@page-composer/vue'
import { Hero, Card, Grid } from '@/components'
import doc from './home.page.json'

const config = definePageConfig({
  components: {
    Hero: { label: 'Hero', render: Hero, fields: { title: { type: 'text' } } },
    Grid: { label: 'Grid', render: Grid, zones: ['items'] },
    Card: { label: 'Card', render: Card, fields: { title: { type: 'text', bindable: true } } },
  },
})
</script>

<template>
  <ComposedPage :config="config" :model="doc" :data="{ feature: { title: 'Live' } }" />
</template>
```

`ComposedPage` walks the document, mounts each node with `<component :is>`, maps zones to slots, and resolves bound props through the data context. It is the same renderer the editor canvas runs, so what you author is what ships.

## Author pages

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PageComposer } from '@page-composer/vue'
import { config } from './page-config'
import type { ComposedDocument } from '@page-composer/vue'

const doc = ref<ComposedDocument>(/* load from your store */)
</script>

<template>
  <PageComposer v-model="doc" :config="config" @change="save" />
</template>
```

`PageComposer` is a controlled component. It emits the document on every change and leaves persistence to you. Drafts, autosave, and history live in your app, not the library.

## Field types

`text`, `textarea`, `number`, `boolean`, `select`, `segment`, `color`, with `object` and `array` planned. Any field marked `bindable: true` gets a toggle that switches the value between a literal and a `$bind` expression.

## Theming

Every value comes from a CSS token in one place. Components consume `var(--pc-*)`. Apply `pc-theme-light` next to the editor root to flip the chrome to a light palette by swapping token values, no component changes.

## License

MIT. Copyright Moheeb Zara.
