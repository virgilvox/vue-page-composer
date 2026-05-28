# Session 004 — Audit fixes

Date: 2026-05-28

## Audit findings and fixes

An audit of the editor surfaced four real issues, all now fixed and tested:

1. Zone restrictions were defined (`accepts`) but never enforced. Added `zoneAccepts` to core and wired it into the canvas drop logic (rejected drops show the no-drop cursor and are refused) and into click-to-add (falls back to the root when the selected container will not take the type). Four core tests, two editor tests.
2. Node drags did not set `dataTransfer`, so Firefox would not start a canvas drag. The node drag start now sets it.
3. The editor canvas passed no data, so bound props always rendered empty while authoring. `PageComposer` now takes a `data` prop, forwarded to the canvas renderer, so bound fields show real values as you edit. One test.
4. `ComposedPage` threw on a null or rootless model. It now guards and renders nothing instead.

Also: Escape closes the model and shortcuts overlays before falling through to deselect.

## Playground

Grid `items` and Repeater `item` zones now accept only Card, demonstrating zone restrictions. The editor receives `sampleData`, so bound props (the first card's title, for example) render their resolved values on the canvas instead of component defaults.

## Release

Full gate green: format, lint, both typechecks, 88 tests (core 55, vue 33), all builds. Published `@page-composer/core`, `@page-composer/vue`, and `vue-page-composer` at 0.4.0.

## Next

Iframe canvas isolation and the Nuxt module remain the large items, both needing a real browser or Nuxt runtime to verify. See `docs/comparison.md`.
