# Session 010 — Conditional visibility

Date: 2026-05-28

## What was built

A node can carry a `when` expression. The renderer resolves it against the data context and renders the node and its subtree only when truthy. This rounds out the data-driven toolkit: binding sets a prop from data, repeaters clone a template per record, and `when` decides whether a node appears at all.

- core: optional `when` on `PageNode`, and a pure `setWhen` mutation. Round-trips through serialization.
- renderer: a `hidden` computed; in production a hidden node renders nothing, in the editor it always renders (so it stays editable) with an eye badge and dimming when its condition is currently falsy.
- editor: a "Visible when" field in the inspector, wired through `setWhen` on the store.

Because `when` resolves with the same context as bindings, inside a repeater it reads from the item scope. A template with `when: "item.featured"` renders only featured records, turning the repeater into a filtered list.

## Verification

- 4 core tests for `setWhen` (set, clear, immutability, serialization round-trip).
- 5 vue tests: renderer shows/hides on the condition, repeater filters per item, the inspector sets the expression, and a hidden node still renders in the editor.
- Full gate: format, lint, both typechecks, 113 unit tests (core 59, vue 54, nuxt 4), 9 Playwright e2e. All green.

## Release

Coordinated 0.7.0 across the workspace.

## Next

Remaining items are narrow: in-iframe pointer drag, the `@page-composer/dnd` and `@page-composer/fields` extractions, and CI. The feature set now covers the architecture's phases and most of its "could have" list.
