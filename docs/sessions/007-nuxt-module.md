# Session 007 — Nuxt module

Date: 2026-05-28

## What was built

`@page-composer/nuxt`, a real Nuxt module (Phase 3), and the `nuxt-page-composer` alias is now a thin re-export of it rather than a stub.

The module:

- registers `ComposedPage` as a global, SSR-safe component,
- optionally registers `PageComposer` client only (`editor: true`),
- injects `@page-composer/vue/styles.css` (`css: true`, default),
- adds the `usePageComposer` composable,
- supports a `prefix` for the registered component names.

Built with `@nuxt/module-builder` (kept the install light: only `@nuxt/kit` plus the builder, no full Nuxt in the workspace).

## Verification

Three layers, all green:

1. The module compiles cleanly with `@nuxt/module-builder` (dist `module.mjs`, `types.d.mts`, runtime composables).
2. A unit test invokes the module's `setup` against a mocked `@nuxt/kit` and asserts it registers `ComposedPage` globally, injects the stylesheet, registers the editor client-only with the prefix when enabled, and skips the stylesheet when `css` is false. Four tests.
3. `ComposedPage`, the component the module registers, is independently SSR-tested (session 006).

Full gate: format, lint, typechecks, 101 unit tests (core 55, vue 42, nuxt 4), all builds.

## Verification gap, then closed

Initially the module was verified at the compile, setup-logic, and renderer-SSR levels but not inside a full Nuxt app. That gap was then closed in the same session:

- A `playground/` fixture loads the module. `nuxi prepare` runs its `setup` in real Nuxt; the generated manifests confirm `ComposedPage` and `PageComposer` are registered globally and `usePageComposer` is auto-imported.
- A `@nuxt/test-utils` SSR e2e (`pnpm --filter @page-composer/nuxt test:e2e`) builds the playground, server-renders it, and asserts the resolved binding ("SSR works") and component markup appear in the returned HTML. Green.

The e2e is opt-in (separate config) so it stays out of the fast unit gate. `nuxt` and `@nuxt/test-utils` are dev-only and not in the published package.

## Release

Published `@page-composer/nuxt@0.1.0` and `nuxt-page-composer@0.1.0`. The core, vue, and vue alias packages are unchanged at 0.4.2.

## Next

A Nuxt fixture e2e to close the verification gap, then iframe canvas isolation (Playwright is wired up for it).
