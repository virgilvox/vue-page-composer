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

## Honest verification gap

The module is verified at the compile, setup-logic, and renderer-SSR levels, but not yet run inside a full Nuxt application end to end (that needs a heavy Nuxt install and a fixture build). The module uses only canonical `@nuxt/kit` primitives over an SSR-verified renderer, so the residual risk is low. A Nuxt-app SSR e2e with `@nuxt/test-utils` is the recommended next verification step.

## Release

Published `@page-composer/nuxt@0.1.0` and `nuxt-page-composer@0.1.0`. The core, vue, and vue alias packages are unchanged at 0.4.2.

## Next

A Nuxt fixture e2e to close the verification gap, then iframe canvas isolation (Playwright is wired up for it).
