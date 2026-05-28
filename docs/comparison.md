# How Page Composer compares

Page Composer occupies a specific spot: a fully open-source, Vue-native visual builder that uses your real components, outputs a portable JSON document, and supports visual data binding. Here is how that lines up against the tools people reach for today.

## At a glance

| Tool             | Open source               | Vue-native    | Uses your components | Decoupled render | Visual data binding |
| ---------------- | ------------------------- | ------------- | -------------------- | ---------------- | ------------------- |
| Puck             | yes (MIT)                 | no (React)    | yes                  | yes              | no                  |
| Builder.io       | SDK only (editor is SaaS) | yes           | yes                  | yes              | yes                 |
| GrapesJS         | yes (BSD-3)               | with a bridge | partial              | partial          | plugin-dependent    |
| Craft.js         | yes (MIT)                 | no (React)    | yes                  | yes              | build-your-own      |
| Gutenberg        | yes (GPL)                 | no (React)    | yes                  | content-shaped   | block bindings      |
| Webflow / Framer | no                        | no            | n/a                  | no               | CMS bindings        |
| Page Composer    | yes (MIT)                 | yes           | yes                  | yes              | yes                 |

Puck is the closest analog and the model this project follows, but it is React-only. Builder.io matches the data-binding strength but its editor is hosted SaaS, so it fails the fully-open-source bar. GrapesJS is framework-agnostic but DOM/HTML-centric and ships no opinionated editor chrome, so you build every panel yourself. Page Composer aims to be batteries-included like Puck, with portable JSON output like GrapesJS, plus the `$bind` model.

## What we borrowed from the best tools

- Zones as the nesting primitive with per-zone type restrictions, the way Puck models `slot`/`DropZone` fields ([Puck slot docs](https://puckeditor.com/docs/api-reference/fields/slot)).
- Axis-aware drop indicators: a 2px line with a terminal dot in a stack, a vertical line in a grid or row, and a filled highlight over an empty zone, following the Atlassian Pragmatic drag-and-drop guidelines ([Atlassian DnD design guidelines](https://atlassian.design/components/pragmatic-drag-and-drop/design-guidelines)).
- The cross-tool keyboard consensus from Figma, Webflow, and Framer: duplicate, copy and paste, delete, deselect, undo and redo, and reorder ([Figma cheat sheet](https://figmafy.com/figma-keyboard-shortcuts-cheat-sheet/), [Webflow shortcuts](https://help.webflow.com/hc/en-us/articles/33961359609875-Keyboard-shortcuts-in-Webflow)).
- The WAI-ARIA tree view pattern for the outline, with `role` tree/treeitem/group, `aria-expanded`, `aria-selected`, a single roving tabindex, and arrow-key navigation ([WAI-ARIA APG Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)). We avoid the deprecated `aria-grabbed` / `aria-dropeffect` and announce structural changes through a live region instead ([MDN aria-grabbed](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-grabbed)).

## Pain points we designed against

Common complaints about existing builders shaped these decisions:

- Deep-nesting performance collapses in some builders past a few dozen nested nodes ([Puck issue #1208](https://github.com/puckeditor/puck/issues/1208)). The flat node map keeps moves, copies, and undo as id operations rather than tree surgery, and Vue's reactivity updates only what changed.
- Cross-level moves used to require copy and paste in early Puck ([Puck issue #123](https://github.com/measuredco/puck/issues/123)). Page Composer supports moving a node into any valid zone, plus copy and paste of a whole subtree across the document.
- Builders that break component markup or output inline styles frustrate theme authors ([WP Tavern, on Gutenberg](https://wptavern.com/where-gutenberg-went-wrong-theme-developer-edition)). Page Composer never owns your component markup. It mounts your component and passes resolved props; styling stays yours, and the document is versioned data, not generated source.
- GrapesJS forces you to assemble every manager yourself. Page Composer ships an opinionated, themeable editor out of the box.

## Honest limitations

- The canvas is not yet an isolated iframe, so width-based media queries respond to the editor window rather than a simulated viewport. The device frame previews layout width; true isolation is planned.
- Drag and drop uses the native HTML5 API behind a thin layer. Keyboard reordering (`Cmd/Ctrl Shift ↑/↓`) and the outline cover the non-pointer path, but a full keyboard pick-up-and-move flow with auto-scroll parity is still on the list.
- Repeater and collection binding are modeled in core and supported by the resolver, but the repeater field UI is not built yet.
- The Nuxt module, the `@page-composer/dnd` and `@page-composer/fields` package extractions, and a plugin API for custom field types are roadmap items.

## Roadmap

Near term: iframe canvas isolation, repeater and collection field UI, the Nuxt module (SSR, hydration, optional route loader). Later: a plugin API for custom field types and inspector overrides, multiplayer through a CRDT adapter, locale variants, and field/role permissions. The framework-neutral document format leaves room for renderers beyond Vue.
