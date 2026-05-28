# Session 001 — Foundation

Date: 2026-05-28

## What was done

- Read the architecture doc and the editor mockup. Wrote `page-composer-plan.md` with the repo layout, design tokens pulled from the mockup, the document model, build order, tooling, and publish strategy.
- Stood up the pnpm monorepo: workspace config, base tsconfig, gitignore, MIT license.
- Parked the npm names. Published `vue-page-composer@0.0.1` and `nuxt-page-composer@0.0.1` as self-contained stubs with correct metadata and a hand-written `dist`, so the publish carried no toolchain dependency.
- Built `@page-composer/core` (pure TypeScript): document model, ids, traversal, pure mutations, history, serialization with path-tagged validation, resolver interface with a default dot-path resolver, and a dependency-free deep clone. 44 tests, all green. Builds with tsdown to ESM plus declarations.
- Built `@page-composer/vue`:
  - Renderer: `ComposedPage` and a recursive editor-aware `NodeRenderer`. Production output is bare; the editor bridge adds selection chrome and drop placeholders through the same renderer.
  - Editor: `PageComposer` shell (toolbar, three-column body, status bar), `Palette`, `Outline`, `Canvas`, `Inspector` with an auto-generated `FieldRow` per field type, `ModelOverlay`, undo and redo, keyboard delete, viewport toggle, model JSON view.
  - Design tokens extracted from the mockup into `tokens.css`, with a light theme override. Editor chrome in `editor.css`, all `var(--pc-*)`, classes prefixed `pc-`.
  - 15 tests (renderer plus editor integration), all green. Builds with Vite library mode plus vue-tsc declarations.
- Quality gate green across the workspace: Prettier clean, ESLint clean, core and vue typecheck clean, 59 tests passing.

## Decisions

- Verified current majors before locking deps: Vue 3.5.35, Vite 8, Vitest 4, TypeScript 6, Nuxt 4, Pragmatic DnD 1.8.1, ESLint 10. vue-tsc 3.3 runs on TS 6.
- Dropped `exactOptionalPropertyTypes` from the base tsconfig. It fought Vue's prop typing for little gain. Kept `strict` and `noUncheckedIndexedAccess`.
- One renderer for production and the editor canvas, switched by an injected editor bridge. Keeps "what you author is what ships" literally true and avoids a second render path.
- Editor-mode node wrappers add a `.pc-cmp` element around each component. Production renders no wrapper. The deeper CSS-isolation answer (iframe canvas) is deferred, see below.
- Core uses a small structural deep clone rather than `structuredClone`, so the package needs no DOM or node lib types.

## Open questions and next steps

- The `@page-composer` npm org does not exist yet, so the scoped packages cannot publish (403). Creating the org needs the npm website. Decide: create the org and publish `@page-composer/*` plus a real `vue-page-composer` alias, or publish the Vue code directly under the unscoped `vue-page-composer` name without the scope.
- Iframe canvas for true CSS isolation and real media-query response is not built. The current canvas simulates width with a device frame. This is Phase 1 finishing work.
- Drag and drop is wired with native HTML5 events behind a thin layer. The `@page-composer/dnd` package and Pragmatic drag-and-drop adoption are not done. Click-to-add, outline, and inspector flows are the tested, reliable paths.
- Phase 2 (repeater and collection binding end to end), Phase 3 (Nuxt module), and Phase 4 (plugin API, custom fields) are not started. The `fields` and `dnd` package extractions are pending.
