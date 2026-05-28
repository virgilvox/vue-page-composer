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

## Repeaters and collections

A repeater turns a static layout into a list-driven template. Mark a component as a repeater in the config:

```ts
Repeater: {
  label: 'Repeater',
  render: Repeater, // renders <slot name="item" />
  zones: ['item'],
  repeat: { zone: 'item', source: 'source' },
  fields: { source: { type: 'text', label: 'Data source', bindable: true } },
}
```

Place a template inside the repeater's `item` zone and bind its props to the current record with the `item.` prefix:

```json
{
  "n_rep": {
    "type": "Repeater",
    "props": { "source": { "$bind": "features" } },
    "zones": { "item": ["tpl"] }
  },
  "tpl": {
    "type": "Card",
    "props": { "title": { "$bind": "item.title" }, "body": { "$bind": "item.body" } }
  }
}
```

At render time the template is cloned once per record in `data.features`, with each clone's scope set to that record, so `item.title` resolves from it. In the editor the template renders once and stays editable. Bind `source` to your list, then switch to preview to see it repeat.
