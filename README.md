# Page Composer

A visual page editor you embed in your own Vue or Nuxt app. Register the components you already ship, drag them onto a canvas, and save a portable JSON document that renders on any route. MIT, no backend assumptions, no vendor lock-in.

The closest reference point is Puck in the React world. Page Composer fills the same gap for Vue and Nuxt.

## Two pieces

- `<PageComposer>`, the authoring surface: palette, canvas, inspector, outline.
- `<ComposedPage>`, the runtime that turns a saved document into a real page using your components.

Both read the same config object, where you list the components an author may place and the fields that drive their props. The config is the contract.

## Packages

| Package               | What it is                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `@page-composer/core` | Framework-neutral document model, mutations, history, serialization, resolver interface. |
| `@page-composer/vue`  | The Vue editor and renderer.                                                             |
| `vue-page-composer`   | Friendly alias for `@page-composer/vue`.                                                 |
| `nuxt-page-composer`  | The Nuxt module (in progress).                                                           |

## Status

The core model and the Vue renderer and editor are built and tested. The Nuxt module, the `@page-composer/dnd` and `@page-composer/fields` extractions, and richer drag and drop are next. See `page-composer-plan.md` for the build order and `page-composer-architecture.md` for the design.

## Develop

```bash
pnpm install
pnpm -r test      # run every package test suite
pnpm -r build     # build every package
pnpm lint         # eslint across the workspace
pnpm format       # prettier write
```

Layout:

```
packages/core    @page-composer/core
packages/vue     @page-composer/vue
packages/dnd     @page-composer/dnd      (planned)
packages/fields  @page-composer/fields   (planned)
packages/nuxt    @page-composer/nuxt     (planned)
aliases/*        vue-page-composer, nuxt-page-composer
```

## License

MIT. Copyright Moheeb Zara.
