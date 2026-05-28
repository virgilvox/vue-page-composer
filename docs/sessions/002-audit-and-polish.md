# Session 002 — Audit, polish, docs

Date: 2026-05-28

## What was done

- Added two editor screenshots to `docs/assets/` and wired them into the root, `@page-composer/vue`, and `vue-page-composer` READMEs via absolute raw GitHub URLs so they render on the npm package pages.
- Ran competitive and UX research (Puck, Builder.io, GrapesJS, Craft.js, Gutenberg, Webflow, Framer) covering drop-indicator patterns, keyboard conventions, and the WAI-ARIA tree pattern. Findings fed the improvements and the comparison doc.
- Core: added `extractSubtree` and `insertSubtree`, the copy and paste primitives. They work across documents and assign fresh ids on paste. Seven new tests; core is at 51.
- Editor UX:
  - Axis-aware drop indicator: a line with a terminal dot between items, oriented to the layout (vertical line in a grid or row, horizontal in a stack), and a filled highlight over an empty zone. One placement function drives both the indicator and the actual drop, so the indicator is truthful.
  - Drag source dims to 0.4 while dragging; canvas auto-scrolls near the edges; drop effect reflects copy vs move.
  - Fixed the selection tag clipping at the device top edge with `overflow: clip` plus `overflow-clip-margin`. Added a drag grip to the tag.
  - Keyboard shortcuts: duplicate, copy, paste, reorder up/down, delete, deselect, and a `?` help overlay. Shortcuts stay inert while typing in a field.
  - Accessibility: outline rebuilt to the WAI-ARIA tree pattern (roles, `aria-expanded`, `aria-selected`, roving tabindex, arrow-key navigation). Canvas wrappers are focusable with `aria-pressed` and keyboard select. A polite live region announces add, delete, duplicate, paste, move, undo, and redo. Added focus-visible rings and a reduced-motion media query.
  - Inspector renders field descriptions.
- Docs: wrote `docs/` set (getting-started, configuration, data-binding, keyboard-shortcuts, comparison, index). Eight new editor tests; vue is at 23. Full gate green: format, lint, both typechecks, 74 tests, all builds.

## Decisions

- One placement function in the canvas returns both the resolved drop target and the on-screen indicator, so they can never disagree.
- Outline expansion state moved from per-node local refs to a single controller provided by `Outline`, which the keyboard navigation needs to compute the visible node list.
- Kept native HTML5 drag and drop behind the thin canvas layer rather than pulling in a drag engine, and added keyboard reorder plus the accessible outline as the non-pointer path. The deprecated `aria-grabbed`/`aria-dropeffect` are deliberately avoided.

## Open questions and next steps

- Iframe canvas isolation, repeater and collection field UI, the Nuxt module, and the `dnd`/`fields` package extractions remain. See `docs/comparison.md` for the full roadmap.
- A full keyboard pick-up-and-move drag flow with auto-scroll parity would round out DnD accessibility.
