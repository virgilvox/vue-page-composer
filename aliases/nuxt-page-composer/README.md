# nuxt-page-composer

Nuxt module for [Page Composer](https://github.com/virgilvox/vue-page-composer). Registers the `ComposedPage` renderer as a global component with SSR, injects the stylesheet, and adds composables. Friendly alias for `@page-composer/nuxt`.

## Install

```bash
pnpm add nuxt-page-composer
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-page-composer'],
  pageComposer: {
    editor: false, // also register the PageComposer editor (client only)
    css: true, // inject the stylesheet
    prefix: '', // prefix for the registered component names
  },
})
```

## Use

`ComposedPage` is registered globally and renders server side. Fetch the document with Nuxt's own data tools so bound content is present at first paint, then render it:

```vue
<script setup lang="ts">
import { config } from '~/page-config'
const route = useRoute()
const { data: doc } = await useAsyncData(`page:${route.path}`, () => loadDocument(route.path))
const { data } = await useAsyncData('page-data', () => loadData())
</script>

<template>
  <ComposedPage v-if="doc" :config="config" :model="doc" :data="data" />
</template>
```

Enable `editor: true` to also register `PageComposer` (client only) for an authoring route.

## License

MIT. Copyright Moheeb Zara.
