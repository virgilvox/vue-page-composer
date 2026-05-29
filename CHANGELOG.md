# Changelog

All packages are versioned in lockstep. Dates are 2026.

## 0.7.1

- Include a `LICENSE` file in every published package.
- Add a CI workflow (lint, typecheck, unit tests, build, and Playwright editor e2e).
- Add this changelog.

## 0.7.0

- Conditional visibility: a node's `when` expression hides it and its subtree when falsy, resolved against the data context or the repeater item scope. A repeated template with `when: "item.featured"` filters the list.

## 0.6.0

- Accessible keyboard move: press `M` to pick a block up, step it through every valid position with the arrows (across zones and nesting), drop with Enter, cancel with Escape, with screen-reader announcements.

## 0.5.0

- Opt-in isolated canvas (`isolate` prop): the page renders in an iframe for true CSS isolation, where width-based media queries respond to the device width rather than the editor window.

## 0.4.x

- Enforced zone type restrictions (`accepts`), corrected the drag-and-drop reorder index, rejected invalid moves, cleared stale selection after undo, an editor data context so bound props resolve while authoring, an SSR-safety guard on the renderer, and preserved numeric select values. SSR verified with `@vue/server-renderer`; editor end-to-end tests added with Playwright.

## 0.3.0

- Repeater and collection binding, nested object and array field editors, and a custom field plugin path through `field-components`.

## 0.2.0

- Copy and paste of a whole subtree (`extractSubtree` / `insertSubtree`), a drop indicator, accessible outline tree, keyboard shortcuts, and editor polish.

## 0.1.0

- First functional release: `@page-composer/core` (document model, mutations, history, serialization, resolver), `@page-composer/vue` (`ComposedPage` renderer and `PageComposer` editor), and the `vue-page-composer` alias. The Nuxt module (`@page-composer/nuxt` / `nuxt-page-composer`) landed during the 0.1–0.7 line with SSR verified through a Nuxt fixture.
