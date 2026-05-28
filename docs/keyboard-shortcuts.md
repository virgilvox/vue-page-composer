# Keyboard shortcuts

Press `?` anywhere in the editor to open the shortcut list. Shortcuts are inert while you are typing in a field, so native text editing (caret movement, native undo) keeps working.

| Action                   | Shortcut                |
| ------------------------ | ----------------------- |
| Undo                     | `Cmd/Ctrl Z`            |
| Redo                     | `Cmd/Ctrl Shift Z`      |
| Duplicate selection      | `Cmd/Ctrl D`            |
| Copy selection           | `Cmd/Ctrl C`            |
| Paste                    | `Cmd/Ctrl V`            |
| Move selection up / down | `Cmd/Ctrl Shift ↑ / ↓`  |
| Delete selection         | `Delete` or `Backspace` |
| Deselect                 | `Esc`                   |
| Toggle this help         | `?`                     |

Copy and paste operate on a whole subtree: copying a Grid copies its cards too, and pasting grafts a fresh copy with new ids.

## Outline navigation

When focus is in the outline tree, it follows the WAI-ARIA tree pattern:

| Action                         | Key            |
| ------------------------------ | -------------- |
| Move to next / previous node   | `↓` / `↑`      |
| Expand, or move to first child | `→`            |
| Collapse, or move to parent    | `←`            |
| First / last node              | `Home` / `End` |

Selecting a node in the outline selects it on the canvas, and the reverse, so the two stay in sync. Every structural action also writes to a polite live region for screen readers.
