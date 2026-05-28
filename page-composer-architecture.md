# Page Composer

A visual page editor you embed in your own Vue or Nuxt app. Register the components you already ship, drag them onto a canvas, and save a portable JSON document that renders on any route. MIT, no backend assumptions, no vendor lock-in.

The name is descriptive on purpose, following the convention of `vue-designer`, `vue-flow`, and similar tools. People should know what it is from the name. You compose a page from the blocks you already have.

Package names are claimed and clean across the board:

- `vue-page-composer` — the headline install, the Vue editor and renderer.
- `nuxt-page-composer` — the Nuxt module.
- `@page-composer/*` — the scoped monorepo packages (`core`, `vue`, `nuxt`, `fields`, `dnd`).

---

## 1. What it is

Page Composer is a library, not a CMS and not a hosted product. It gives you two main pieces:

- `<PageComposer>` — the authoring surface (palette, canvas, inspector, outline).
- `<ComposedPage>` — the runtime that turns a saved document into a real page using your components.

Both read the same config object, which is where you list the components an author is allowed to place and the fields that drive their props. The config is the contract. Everything else is plumbing around it.

The closest reference point is Puck in the React world. Page Composer targets the same shape of problem for Vue and Nuxt, where no equivalent exists with that level of polish.

---

## 2. Goals and non-goals

### Goals

- Author pages visually using the host app's real, registered Vue components.
- Produce a serializable document that the host owns and persists anywhere.
- Render that document on any route, server side or client side, with full hydration.
- Stay framework-aware but persistence-agnostic. Page Composer never dictates a database, an API shape, or an auth model.
- Support dynamic content through data binding, so a block can read from the host app's data layer instead of only static prop values.
- Be extensible through plugins, custom field types, and slotted UI overrides.

### Non-goals

- Not a website hosting platform. No deploy pipeline, no CDN, no edge functions.
- Not a content database. Page Composer defines the document format and leaves storage to you.
- Not a design tool. It composes existing components. It does not draw arbitrary vector shapes or generate new components.
- Not a code generator. The output is data, read at runtime, not Vue source files written to disk.

---

## 3. Core concepts

### 3.1 Composition document

The document is a flat map of nodes keyed by id, plus a root id. Flat beats deeply nested for editing because moves, copies, and undo become id operations instead of tree surgery.

```json
{
  "version": "1",
  "root": "page",
  "nodes": {
    "page": { "type": "Root", "zones": { "main": ["n_hero", "n_grid"] } },
    "n_hero": { "type": "Hero", "props": { "title": "..." } },
    "n_grid": {
      "type": "Grid",
      "props": { "cols": 3 },
      "zones": { "items": ["c_8f3a", "c_2b1d"] }
    },
    "c_8f3a": { "type": "Card", "props": { "title": { "$bind": "feature.title" } } }
  },
  "data": { "feature": { "$source": "collection:features" } }
}
```

A node has a `type` (which component), `props` (its inputs), and optional `zones` (named slots holding ordered child ids). A prop value is either a literal or a binding expression. This format is portable. It contains no Vue, so the same document could feed a renderer in another framework later.

### 3.2 Config and registry

The host registers each placeable component once, describing how it appears in the palette and what fields the inspector should render for it.

```js
import { Hero, Card, Grid } from '@/components'

export const config = {
  components: {
    Card: {
      label: 'Card',
      category: 'content',
      render: Card, // the actual Vue component
      fields: {
        title: { type: 'text', label: 'Title', bindable: true },
        body: { type: 'textarea', label: 'Body' },
        icon: { type: 'select', options: ['zap', 'globe', 'shield'] },
        variant: { type: 'segment', options: ['plain', 'bordered', 'filled'] },
        elevated: { type: 'boolean', default: false },
        padding: { type: 'number', unit: 'px', default: 16 },
      },
      defaultProps: { variant: 'bordered', padding: 16 },
    },
    Grid: {
      label: 'Grid',
      category: 'layout',
      render: Grid,
      zones: ['items'], // declares droppable child areas
      fields: { cols: { type: 'number', default: 3 } },
    },
  },
  categories: { layout: { title: 'Layout' }, content: { title: 'Content' } },
}
```

The inspector is generated from `fields`. The palette is generated from `label`, `category`, and `categories`. There is no separate schema language to learn. The config is plain objects and your imported components.

### 3.3 Editor

`<PageComposer :config :model @change>` renders four regions:

- **Palette**: draggable entries built from the registry, grouped by category, searchable.
- **Canvas**: a live preview that mounts the real components inside an isolated iframe.
- **Inspector**: auto-generated form for the selected node's fields, including a binding toggle per bindable field.
- **Outline**: the document tree, with drag-to-reorder and click-to-select kept in sync with the canvas.

The editor is controlled. It takes a model in and emits changes out. The host decides when and how to save. That keeps autosave, drafts, and history under host control rather than buried in the library.

### 3.4 Renderer

`<ComposedPage :config :model :data>` walks the document and mounts each node with `<component :is>`, passing resolved props and rendering zones into the matching component slots. It is the same component you use in production routes. The editor canvas runs the renderer too, so what you author is what ships.

### 3.5 Resolvers and data binding

A prop can hold `{ "$bind": "feature.title" }` instead of a literal. At render time a resolver evaluates that expression against a data context the host supplies. This is how a page reads from your app rather than freezing static text.

```js
<ComposedPage
  :config="config"
  :model="doc"
  :data="{ feature: await fetchFeature(route.params.slug) }"
/>
```

Collections and repeaters use the same mechanism. A `Repeater` node binds a zone to a list source and clones its child subtree once per record, setting each clone's data scope to the current item. Binding plus repeaters is what turns a static layout into a template.

### 3.6 Zones

Zones are named, ordered lists of child ids. A component declares which zones it exposes (`zones: ['items']`) and renders them via slots. Drag and drop targets zones, not raw DOM positions, which keeps nesting rules explicit and prevents invalid drops.

---

## 4. Functional requirements

### Must have (v1)

- Register host components with field definitions and default props.
- Drag from palette to canvas, drop into declared zones, reorder within a zone.
- Select a node in canvas or outline and edit its props in a generated inspector.
- Field types: text, textarea, number, boolean, select, segment, color, and a generic object and array (repeatable) field.
- Move, duplicate, and delete nodes. Undo and redo across all mutations.
- Emit a serializable document and accept one back in. Round-trips without loss.
- Render a document to a live page with `<ComposedPage>`, client and server.
- Isolated canvas (iframe) so host CSS and responsive breakpoints behave correctly.
- Viewport preview at desktop, tablet, and mobile widths.

### Should have (v1.x)

- Data binding on fields, with a resolver interface the host implements.
- Repeater and collection binding for list-driven sections.
- Nuxt module: auto-register the renderer, provide composables, handle SSR hydration, and offer an optional catch-all route that loads a document by path.
- Plugin API for custom field types and inspector sections.
- Outline drag-to-reorder with keyboard support.
- Copy and paste of a node subtree, within and across documents.

### Could have (later)

- Multiplayer editing through a CRDT document adapter (Yjs or Loro).
- Versioning and visual diff of two document versions.
- Locale variants of props on a single document.
- Permissions: lock fields, restrict which components a role may place.
- Conditional visibility rules on nodes evaluated by the resolver.
- Export adapter to other renderers (the format is already framework-neutral).

---

## 5. Architecture

### 5.1 Packages

A small monorepo under the `@page-composer` scope. The split keeps Vue out of the core so the document format and logic stay portable. `vue-page-composer` and `nuxt-page-composer` are published as friendly aliases that re-export the scoped packages, so the common install matches the `vue-designer` style name people will search for.

| Package                                            | Responsibility                                                                                   | Vue dependency         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| `@page-composer/core`                              | Document model, mutations, validation, id generation, serialization, history, resolver interface | none (pure TypeScript) |
| `@page-composer/vue` (alias `vue-page-composer`)   | `PageComposer`, `ComposedPage`, inspector, palette, canvas, default field components             | yes                    |
| `@page-composer/fields`                            | Built-in field type registry and their input components                                          | yes                    |
| `@page-composer/nuxt` (alias `nuxt-page-composer`) | Nuxt module, composables, SSR and hydration glue, optional route loader                          | yes (Nuxt)             |
| `@page-composer/dnd`                               | Thin wrapper over the drag primitive, zone-aware drop logic                                      | none                   |

### 5.2 Layered flow

```
host app
  └─ config (components + fields)   <- the contract
       |
  +----+-----------------------------------------+
  |  @page-composer/core                          |
  |  document state | mutations | history         |
  |  resolver interface | serialize               |
  +----+---------------------------------+--------+
       | edit                            | render
  +----+---------+               +-------+--------+
  | PageComposer |               | ComposedPage   |
  | palette      |               | <component :is>|
  | canvas (iframe)---renders-----|  + zones/slots |
  | inspector    |               |  + resolvers   |
  | outline      |               +----------------+
  +------+-------+
         | @change(doc)
         v
  host persistence (DB, file, API, anything)
```

The editor and renderer never talk to storage. The host receives `@change` and decides what to do. To load, the host hands a document in as a prop. This is the single most important boundary in the design. It is what makes Page Composer fit any app instead of forcing an app to fit Page Composer.

### 5.3 Why an iframe canvas

Mounting the preview in an iframe gives true style isolation. Editor chrome CSS cannot bleed into the rendered page, the host's global styles apply exactly as they will in production, and width-based media queries respond to the simulated viewport rather than the editor window. The tradeoff is bridging selection events and drag coordinates across the frame boundary, which the dnd layer handles.

### 5.4 Drag and drop

The primitive is Atlassian's Pragmatic drag-and-drop. It is framework-agnostic, accessible, performant on large trees, and built on the native HTML5 API, so it carries no React dependency. Page Composer wraps it with zone-aware logic: a drop is valid only when the target zone accepts the dragged component type, and the visual drop indicator reflects the resolved insertion index.

### 5.5 Rendering with `<component :is>`

The render half is small in Vue. Walking the node map and mounting each node with `<component :is="config.components[node.type].render">` covers most of it. Props pass straight through after resolution. Zones map to slots. Vue's reactivity means a prop edit in the inspector updates the canvas with no rebuild. Most of the engineering effort lives in the editor surface, not the renderer.

### 5.6 Nuxt integration

The Nuxt module registers the renderer globally, exposes `usePageComposer()` for loading and resolving documents, and handles the SSR path so a page renders fully on the server and hydrates without mismatch. An optional catch-all route maps an incoming path to a stored document, which is the common case for a publishing or marketing site. Data resolvers run inside Nuxt's data fetching so bound content is present at first paint.

---

## 6. Key decisions and rationale

1. **Persistence-agnostic, controlled component.** The host owns saving and loading. Reason: every app already has a data layer and an opinion about it. Owning persistence inside the library would force migrations and lock-in, which is the thing this project exists to avoid.

2. **Framework-neutral document, Vue-specific binding layer.** Core has no Vue import. Reason: the format outlives any one renderer, and a future Svelte or web-component renderer can read the same documents.

3. **Flat node map over nested tree.** Reason: moves, duplication, and undo reduce to id operations. A nested tree makes those operations error prone and history harder.

4. **Config as plain objects, not a DSL.** Reason: authors of the integration are developers who already know Vue. Importing a component and writing a field map is less to learn than a schema language, and it keeps types intact end to end.

5. **Iframe canvas.** Reason: correct CSS isolation and real responsive behavior are worth the cross-frame event bridging cost.

6. **Pragmatic drag-and-drop as the primitive.** Reason: framework-agnostic, accessible, and avoids dragging a heavy or React-bound dependency into a Vue library.

7. **Binding as data on the prop, not a separate field mode.** A prop value is either a literal or a `$bind` object. Reason: one uniform path through the resolver, and the binding survives serialization with no side table.

---

## 7. How it adapts to routing and components

Two requirements from the brief drove the design.

**Use the components already registered.** The config points `render` at imported components. Global or local registration in the host app is irrelevant to Page Composer because it holds direct references. The same Card that ships in production is the Card an author places and the Card the renderer mounts.

**Adapt to how the app serves pages and routes.** The renderer is a component, so it drops inside whatever route structure the app already has: a dynamic `[slug].vue`, a catch-all, a nested layout, a single embedded section on an otherwise hand-built page. Page Composer does not own the route. It renders into one. The host fetches the document however it likes (by slug, by id, from a file, from an API) and passes it in, along with the data context the resolvers read. Routing stays entirely in the host's hands.

---

## 8. Comparison to alternatives

| Tool               | Fully OSS    | Vue-native      | Uses your components | Decoupled render | Notes                                                                               |
| ------------------ | ------------ | --------------- | -------------------- | ---------------- | ----------------------------------------------------------------------------------- |
| Puck               | yes (MIT)    | no (React only) | yes                  | yes              | The model Page Composer follows. No Vue support planned.                            |
| GrapesJS           | yes (BSD-3)  | agnostic        | with a bridge        | partial          | Mature, but DOM/HTML-centric. Real Vue components need a custom mount type.         |
| Builder.io Vue SDK | SDK only     | yes             | yes                  | yes              | Editor is hosted SaaS, so it fails the fully-OSS bar.                               |
| Nuxt Studio        | yes (recent) | Nuxt only       | yes                  | content-shaped   | Content/MDC editor, Git-backed. Good for documents, not freeform per-route layouts. |
| Page Composer      | yes (MIT)    | yes             | yes                  | yes              | Fills the Vue gap with the Puck-style decoupled model.                              |

---

## 9. Build phases

**Phase 0 — core and renderer.** Document model, mutations, serialization, history in `@page-composer/core`. `ComposedPage` with zones and `<component :is>`. No editor yet. Deliverable: render a hand-written document to a page.

**Phase 1 — editor surface.** Palette, iframe canvas, selection, generated inspector, outline. Drag and drop through the dnd wrapper. Deliverable: build and edit a static page visually, round-trip the document.

**Phase 2 — data.** Resolver interface, `$bind` fields, repeater and collection binding. Deliverable: a list-driven section reading from host data.

**Phase 3 — Nuxt module.** Auto-registration, composables, SSR and hydration, optional route loader. Deliverable: a Nuxt site serving pages from stored documents.

**Phase 4 — extensibility.** Plugin API, custom field types, inspector overrides. Deliverable: a third party adds a field type without forking.

**Later.** CRDT multiplayer adapter, versioning and diff, locales, permissions, conditional visibility.
