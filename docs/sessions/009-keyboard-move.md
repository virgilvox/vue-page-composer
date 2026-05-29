# Session 009 — Accessible keyboard move

Date: 2026-05-28

## What was built

A keyboard "pick up and move" flow, the accessible counterpart to pointer drag and a gap the competitive research flagged. Press `M` on a selected block to pick it up, step it through every valid position with the arrows (across zones and nesting levels), drop with Enter or Space, cancel with Escape. Each step is announced through the live region, and the picked-up block is outlined.

This is chosen over in-iframe pointer drag deliberately: native HTML5 drag cannot be verified headless (Playwright cannot simulate it across an iframe), whereas keyboard move is fully verifiable, is an accessibility win, and gives the isolated (iframe) canvas a way to move blocks since pointer drag is not yet wired there.

## How it works

- `validSlots(config, doc, id)` enumerates every (parent, zone, index) the node may occupy: the zone must accept its type and must not be inside the node's own subtree. Indices are expressed against the zone with the node detached, so they feed straight into `moveNode`. Pure and unit-tested.
- Move slots are computed once at pick-up. Each arrow step re-applies the move from the captured origin to the target slot and emits it without recording history, so undo sees a single move on confirm. Escape re-emits the origin.

## Verification

- 5 unit tests for `validSlots` and `currentSlotIndex` (acceptance, no-self-nesting, indices that feed `moveNode`).
- 2 editor unit tests for the flow (move with `M`/arrow/Enter; cancel with Escape restores order).
- 1 Playwright e2e: pick up the Hero, step down, drop, assert the Grid is now first.

Full gate: format, lint, both typechecks, 108 unit tests (core 55, vue 49, nuxt 4), 9 Playwright e2e (6 editor, 3 iframe). All green.

## Release

Coordinated 0.6.0 across the workspace.

## Next

In-iframe pointer drag, the `@page-composer/dnd` and `@page-composer/fields` extractions, and pointer-drag auto-scroll parity.
