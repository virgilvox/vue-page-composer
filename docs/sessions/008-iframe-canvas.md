# Session 008 — Isolated (iframe) canvas

Date: 2026-05-28

## What was built

An opt-in isolated canvas (`isolate` prop on `PageComposer`), the architecture's signature Phase 1 feature. When enabled, the page renders inside an iframe:

- true CSS isolation: editor chrome cannot bleed in, and the host's component styles apply exactly as in production (parent stylesheets are copied into the iframe and kept in sync),
- width-based media queries respond to the simulated device width, not the editor window,
- a second Vue app mounts inside the iframe rendering the same editor-aware `ComposedPage`. It shares the store's reactive refs and the editor bridge, so selecting or editing inside the iframe updates the inspector and outline with no message passing,
- the iframe auto-resizes to its content.

It is opt-in and defaults off, so the inline canvas (with full drag and drop) is unchanged. In iframe mode, insertion is click-to-add and keyboard; in-iframe drag and drop is a planned follow-up.

## Verification

Real-browser Playwright e2e (`e2e/iframe.spec.ts`), all green:

- the page renders inside the iframe,
- selection works across the frame boundary (a click inside the iframe updates the parent inspector),
- a `@media (max-width: 520px)` rule on the Hero flips from 40px to 26px when the device switches to mobile, proving media queries follow the device width, not the window.

A benign `ResizeObserver loop` warning from the auto-resize was quieted with a requestAnimationFrame plus a no-op height guard.

Full suite: format, lint, both typechecks, 101 unit tests (core 55, vue 42, nuxt 4), 8 Playwright e2e (5 editor, 3 iframe). All green.

## Release

Coordinated 0.5.0 across the workspace to keep dependency ranges aligned. Core is unchanged in behavior but bumped in lockstep.

## Next

In-iframe drag and drop is the natural follow-up. Remaining: the `@page-composer/dnd` and `@page-composer/fields` extractions and a full keyboard pick-up-and-move flow.
