# Nuxt module

`nuxt-page-composer` (alias for `@page-composer/nuxt`) wires Page Composer into Nuxt: it registers the `ComposedPage` renderer as a global, SSR-safe component, injects the stylesheet, and adds composables.

## Setup

```bash
pnpm add nuxt-page-composer
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-page-composer'],
})
```

## Options

Configured under the `pageComposer` key:

| Option   | Default | What it does                                                       |
| -------- | ------- | ------------------------------------------------------------------ |
| `editor` | `false` | Also register `PageComposer` (client only) for an authoring route. |
| `css`    | `true`  | Inject `@page-composer/vue/styles.css`.                            |
| `prefix` | `''`    | Prefix for the registered component names, for example `Pc`.       |

## Rendering a stored page

`ComposedPage` is registered globally, so any page can render a document. Fetch the document inside Nuxt's data layer (`useAsyncData` or `useFetch`) so bound content is resolved server side and present at first paint, with no hydration mismatch.

```vue
<script setup lang="ts">
import { config } from '~/page-config'

const route = useRoute()
const { data: doc } = await useAsyncData(`page:${route.path}`, () =>
  $fetch('/api/page', { query: { path: route.path } }),
)
const { data } = await useAsyncData('page-data', () => $fetch('/api/page-data'))
</script>

<template>
  <ComposedPage v-if="doc" :config="config" :model="doc" :data="data ?? {}" />
</template>
```

## A catch-all publishing route

For a marketing or publishing site, a single catch-all route maps any path to a stored document:

```vue
<!-- pages/[...slug].vue -->
<script setup lang="ts">
import { config } from '~/page-config'
const route = useRoute()
const { data: doc, error } = await useAsyncData(`page:${route.path}`, () =>
  $fetch('/api/page', { query: { path: route.path } }),
)
if (!doc.value) throw createError({ statusCode: 404 })
</script>

<template>
  <ComposedPage :config="config" :model="doc" />
</template>
```

The module keeps routing in your hands. It registers the renderer and gets out of the way, matching the rest of the library's persistence-agnostic design.

## Authoring in Nuxt

Set `editor: true` and render `PageComposer` on a client route (it is registered client only). Persist the document on `@change` through your own API.
