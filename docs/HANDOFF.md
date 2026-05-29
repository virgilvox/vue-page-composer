# Handoff

Current state of Page Composer, what is done, what is deliberately not, and how to develop and release.

## Published packages (npm, lockstep versions)

| Package               | What it is                                                                            |
| --------------------- | ------------------------------------------------------------------------------------- |
| `@page-composer/core` | Framework-neutral document model, mutations, history, serialization, resolver, rules. |
| `@page-composer/vue`  | The Vue editor (`PageComposer`) and renderer (`ComposedPage`).                        |
| `@page-composer/nuxt` | Nuxt module: global SSR renderer, styles, composable.                                 |
| `vue-page-composer`   | Friendly alias for `@page-composer/vue`.                                              |
| `nuxt-page-composer`  | Friendly alias for `@page-composer/nuxt`.                                             |

All five publish together at the same version. The `^x.y.z` workspace dependencies stay aligned that way.

## What is built and verified

- Core: flat document model, pure mutations (insert, move, remove, duplicate, copy and paste subtree, set/clear binding, `setWhen`), history, serialization with validation, resolver, zone-accept rules.
- Renderer: `ComposedPage` mounts host components, maps zones to slots, resolves bindings, repeats templates, and honors conditional visibility. SSR-tested with `@vue/server-renderer`.
- Editor: palette, live canvas with selection and axis-aware drop indicator, auto-generated inspector (text, textarea, number, boolean, select, segment, color, object, array, custom), per-field binding toggle, accessible outline tree, undo and redo, copy and paste, duplicate, keyboard shortcuts, accessible keyboard move (`M`), viewport preview, model JSON view, optional iframe-isolated canvas, conditional visibility control.
- Nuxt module: registers the renderer globally with SSR, injects styles, adds `usePageComposer`. Verified with a real Nuxt fixture (`packages/nuxt/playground`) and a `@nuxt/test-utils` SSR e2e.
- 113 unit tests (Vitest), 9 Playwright editor e2e, plus an opt-in Nuxt SSR e2e. CI runs lint, typecheck, unit tests, build, and the editor e2e.

## Deliberately not done

- In-iframe pointer drag and pointer-drag auto-scroll parity. Native HTML5 drag cannot be verified headless (Playwright cannot simulate it across an iframe), so it was not shipped blind. Keyboard move (`M`) covers the iframe case and is fully tested.
- The `@page-composer/dnd` and `@page-composer/fields` package extractions. The field inputs are coupled to the editor store, so extraction is churn with no user benefit today.

## Develop

```bash
pnpm install
pnpm --filter playground dev      # try the editor (add ?isolate=1 for the iframe canvas)
pnpm -r test                      # unit suites
pnpm test:e2e                     # editor e2e in a real browser (needs: pnpm exec playwright install chromium)
pnpm --filter @page-composer/nuxt test:e2e   # Nuxt SSR e2e (heavy)
pnpm typecheck && pnpm lint && pnpm format:check && pnpm -r build
```

## Release

Bump all five package versions together, build, then publish in dependency order with `pnpm publish --access public --no-git-checks`: core, vue, nuxt, then the two aliases. `pnpm publish` rewrites the `workspace:^` deps to real ranges, so core must publish before vue and vue before nuxt. The `@page-composer` npm org must be used (login `virgilvox`). Push the version bump and changelog to `main` before publishing so README image URLs and links resolve.
