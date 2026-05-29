# @page-composer/nuxt

The Nuxt module for [Page Composer](https://github.com/virgilvox/vue-page-composer). It registers the `ComposedPage` renderer as a global component with SSR, injects the stylesheet, and adds composables. The unscoped `nuxt-page-composer` package is the friendly alias.

## Install

```bash
pnpm add @page-composer/nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@page-composer/nuxt'],
})
```

## Options

```ts
export default defineNuxtConfig({
  modules: ['@page-composer/nuxt'],
  pageComposer: {
    editor: false, // also register PageComposer (client only)
    css: true, // inject @page-composer/vue/styles.css
    prefix: '', // prefix for registered component names, e.g. 'Pc'
  },
})
```

## Render a page

`ComposedPage` is global and SSR-safe. Fetch the document inside Nuxt's data layer so bound content is present at first paint:

```vue
<script setup lang="ts">
import { config } from '~/page-config'
const route = useRoute()
const { data: doc } = await useAsyncData(`page:${route.path}`, () => loadDocument(route.path))
</script>

<template>
  <ComposedPage v-if="doc" :config="config" :model="doc" :data="{}" />
</template>
```

The renderer is the same one this library ships and is covered by an SSR test, so server render and hydration match.

## License

MIT. Copyright Moheeb Zara.
