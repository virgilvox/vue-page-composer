# Data binding

A prop value is either a literal or a binding. A literal is frozen into the document. A binding reads from the host data layer at render time, which turns a static layout into a template.

## The shape

A bound prop is an object with a `$bind` expression:

```json
{
  "type": "Card",
  "props": {
    "title": { "$bind": "feature.title" },
    "body": "Static text stays a literal"
  }
}
```

In the editor, any field marked `bindable: true` shows a toggle. Flip it on and type a data path; the field turns into a binding. Flip it off and the value returns to a literal.

## Supplying data

`ComposedPage` takes a `data` prop. The resolver evaluates each binding against it.

```vue
<ComposedPage
  :config="config"
  :model="doc"
  :data="{ feature: await fetchFeature(route.params.slug) }"
/>
```

`feature.title` reads `data.feature.title`. Paths are dot-separated and walk nested objects.

## The resolver

By default Page Composer ships a dot-path resolver. You can pass your own to compute values, call functions, or read from a store:

```ts
import { ComposedPage } from 'vue-page-composer'
import type { Resolver } from 'vue-page-composer'

const resolver: Resolver = {
  resolve(expression, context) {
    // context.data is the data prop, context.scope is the current repeater item
    if (expression === 'now') return new Date().toLocaleDateString()
    return expression.split('.').reduce((value, key) => value?.[key], context.data)
  },
}
```

```vue
<ComposedPage :config="config" :model="doc" :data="data" :resolver="resolver" />
```

The contract lives in `@page-composer/core`, framework-neutral, so the same document and resolver model could feed a renderer in another framework later.

## Repeaters and collections (roadmap)

The binding model is built to drive list sections. A repeater binds a zone to a list source and clones its child subtree once per record, setting each clone's `scope` to the current item, so a bound `item.title` reads from that record. The resolver already supports a `scope`; the repeater field UI is on the roadmap. See [the comparison page](comparison.md) for where this sits relative to other tools.
