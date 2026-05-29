# Session 005 — Drag-and-drop correctness

Date: 2026-05-28

## Audit findings and fixes

A closer audit of the drag-and-drop index math and selection lifecycle found three real bugs, all fixed and tested:

1. Reorder off-by-one. The canvas computed the insertion index against the zone as it currently looks, including the dragged node. Moving a node forward within the same zone then landed it one slot too far, disagreeing with the drop indicator. Added a pure `adjustForDetach` helper that corrects the index for the gap the detached node leaves, applied on drop. Five unit tests.
2. Invalid moves showed a drop indicator. Dragging a container onto its own child drew an indicator, then silently no-opped. The drop validity check now rejects moving a node into itself or its descendants (via `isDescendant`), so the indicator and the no-drop cursor are honest.
3. Stale selection after undo. Undoing or redoing past the selected node left the inspector pointing at a node no longer in the document. Undo and redo now clear the selection when the selected node is absent from the restored state. One test.

## Release

Full gate green: format, lint, both typechecks, 94 tests (core 55, vue 39), all builds. Published at 0.4.1.

## Next

Iframe canvas isolation and the Nuxt module remain, both needing a real runtime to verify. See `docs/comparison.md`.
