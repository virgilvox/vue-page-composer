# vue-page-composer

A visual page editor you embed in your own Vue or Nuxt app. Register the components you already ship, drag them onto a canvas, and save a portable JSON document that renders on any route. MIT, no backend assumptions, no vendor lock-in.

This is the friendly alias for `@page-composer/vue`. Installing it pulls in the editor and renderer and re-exports everything, so `import { PageComposer, ComposedPage } from 'vue-page-composer'` works. Import the stylesheet once with `import 'vue-page-composer/styles.css'`.

## What it is

Page Composer is a library, not a CMS and not a hosted product. It gives you two main pieces:

- `<PageComposer>`, the authoring surface (palette, canvas, inspector, outline).
- `<ComposedPage>`, the runtime that turns a saved document into a real page using your components.

Both read the same config object, where you list the components an author is allowed to place and the fields that drive their props. The config is the contract.

## Design goals

- Author pages visually using the host app's real, registered Vue components.
- Produce a serializable document that the host owns and persists anywhere.
- Render that document on any route, server side or client side, with full hydration.
- Stay framework-aware but persistence-agnostic. No dictated database, API shape, or auth model.
- Support dynamic content through data binding, so a block can read from the host app's data layer.
- Extend through plugins, custom field types, and slotted UI overrides.

## Packages

- `vue-page-composer`, the Vue editor and renderer (this package).
- `nuxt-page-composer`, the Nuxt module.
- `@page-composer/core`, `@page-composer/vue`, `@page-composer/fields`, `@page-composer/dnd`, `@page-composer/nuxt`, the scoped building blocks.

## License

MIT. Copyright Moheeb Zara.
