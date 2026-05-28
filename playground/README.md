# Playground

A runnable Vite app for trying Page Composer. It registers a handful of demo Vue components, opens the `PageComposer` editor on a starting page, and lets you switch to a `ComposedPage` preview rendered with sample data.

```bash
pnpm install
pnpm --filter playground dev
```

Then open the printed local URL. Edit blocks in the canvas, tweak props in the inspector, toggle the binding on a field, open the Model button to see the portable JSON, and hit Preview to render the saved document.

The Vite config aliases `@page-composer/vue` and `@page-composer/core` to their source, so editing the library hot-reloads here without a rebuild.
