# Page Composer build plan

Working plan for turning the architecture doc and the editor mockup into a shipped, MIT-licensed Vue and Nuxt library. This is the execution layer under `page-composer-architecture.md`. Read that first for the why; this file is the how and the order.

## Snapshot of decisions already locked

- Monorepo of small packages under the `@page-composer` scope, with `vue-page-composer` and `nuxt-page-composer` as friendly unscoped aliases.
- Core is pure TypeScript with no Vue import. The document format outlives any one renderer.
- Flat node map keyed by id, with a root id. Moves, copies, and undo are id operations.
- Config is plain objects and imported components, not a schema DSL.
- Controlled component. The host owns persistence. The editor takes a model in and emits change out.
- Iframe canvas for real CSS isolation and true responsive behavior.
- Pragmatic drag-and-drop as the dnd primitive, wrapped in a zone-aware layer.
- Binding lives on the prop value as a `$bind` object, resolved at render time.

## Verified environment (checked 2026-05-28)

- Names free on npm: `vue-page-composer`, `nuxt-page-composer`, `@page-composer/core`, `@page-composer/vue`.
- npm login: `virgilvox`. node 22.12, pnpm 10.10, npm 10.9.
- Latest stable deps: vue 3.5.35, vite 8.0.14, vitest 4.1.7, typescript 6.0.3, @vue/test-utils 2.4.10, @atlaskit/pragmatic-drag-and-drop 1.8.1, nuxt 4.4.6, @nuxt/module-builder 1.0.2.

## Repository layout

```
vue-page-composer/                 repo root, private pnpm workspace
  pnpm-workspace.yaml
  package.json                     private, scripts only
  tsconfig.base.json
  vitest.workspace.ts
  packages/
    core/        -> @page-composer/core    pure TS: model, mutations, history, serialize, resolver iface, ids
    dnd/         -> @page-composer/dnd      zone-aware wrapper over pragmatic-drag-and-drop
    fields/      -> @page-composer/fields   field type registry + input components
    vue/         -> @page-composer/vue      ComposedPage, PageComposer, palette, canvas, inspector, outline, tokens
    nuxt/        -> @page-composer/nuxt     nuxt module, composables, ssr glue, optional route loader
  aliases/
    vue-page-composer/             re-exports @page-composer/vue
    nuxt-page-composer/            re-exports @page-composer/nuxt
  docs/
    sessions/                      per-session logs
```

Dependency direction: vue depends on core, dnd, fields. fields depends on core. dnd depends on core (types only). nuxt depends on vue and core. Nothing depends upward. Core depends on nothing.

## Design system

Pulled straight from the mockup so the shipped editor matches the approved look. One token file is the source of truth. Components consume `var(--pc-*)`, never raw values. Class prefix is `pc-`.

- Palette (ink scale): `--pc-ink-900 #15120d` through `--pc-ink-700 #322b21`, lines at low-alpha `#ede6db`.
- Foreground: `--pc-fg #ede6db`, `--pc-fg-dim #a89e8e`, `--pc-fg-faint #766c5c`.
- Accent (amber): `--pc-accent #e0a049`, `--pc-accent-2 #f0b865`, ink `#3a2a0e`, soft `rgba(224,160,73,.14)`.
- Data (teal): `--pc-data #54bdb6`, soft `rgba(84,189,182,.14)`. Used for bound fields and data blocks.
- Danger (coral): `--pc-danger #e07a5f`.
- Canvas surfaces: `--pc-canvas #efe9df`, `--pc-paper #ffffff`, paper ink `#2a2620`.
- Radius 9px / 6px. Shadow pop token. Type: Bricolage Grotesque (display), Hanken Grotesk (body), IBM Plex Mono (labels and code).
- Light and dark both themable by swapping token values. Editor chrome ships dark by default, matching the mockup.

Accessibility floor: keyboard navigable, ARIA on interactive controls, WCAG 2.1 AA contrast and target sizing. The outline and palette support keyboard move and select.

## Document model (core)

```ts
interface ComposedDocument {
  version: '1'
  root: string
  nodes: Record<string, Node>
  data?: Record<string, DataSource>
}
interface Node {
  type: string
  props?: Record<string, PropValue>
  zones?: Record<string, string[]>
}
type PropValue = Literal | Binding
interface Binding {
  $bind: string
}
interface DataSource {
  $source: string
}
```

Mutations are pure functions: `insertNode`, `moveNode`, `removeNode`, `duplicateNode`, `setProp`, `setBinding`, `clearBinding`. Each returns a new document, never mutates in place. History is a ring of snapshots (or patch pairs) with `undo` and `redo`. Id generation is short, collision-checked, prefixed by role (`n_`, `c_`). Serialize and deserialize round-trip with validation and a clear error on a malformed document.

Resolver interface: `resolve(binding, context)` and `resolveSource(source, context)`. Core defines the contract; the host implements fetching. A `Repeater` clones a child subtree per record and sets the data scope per clone.

## Build order

Phase 0, core and renderer.

- core package: model types, mutations, history, ids, serialize, resolver interface. Tests first.
- vue package start: `ComposedPage` walks the node map, mounts `<component :is>`, maps zones to slots, resolves props. Tokens file. Deliverable: render a hand-written document.

Phase 1, editor surface.

- PageComposer shell: toolbar, three-column body, status bar, exactly the mockup layout.
- Palette from registry, grouped by category, searchable.
- Iframe canvas mounting ComposedPage, selection overlay and floating tag, viewport toggle desktop/tablet/mobile.
- Inspector auto-generated from fields, with per-field bind toggle.
- Outline tree synced with canvas selection.
- dnd package: zone-aware drag from palette and within canvas, drop indicator at resolved index.
- Undo and redo wired to core history. Model overlay (the JSON view from the mockup).
- Deliverable: build and edit a page visually, round-trip the document.

Phase 2, data.

- Resolver wiring, `$bind` fields end to end, Repeater and Collection binding. Deliverable: a list-driven section reading from host data.

Phase 3, nuxt module.

- Auto-register renderer, `usePageComposer()`, SSR and hydration, optional catch-all route loader. Deliverable: a Nuxt site serving stored documents.

Phase 4, extensibility.

- Plugin API, custom field types, inspector section overrides. Deliverable: a third party adds a field type without forking.

## Tooling

- Build: each library built with Vite library mode plus vue-tsc for declarations. Core can build with tsdown or tsc. Keep build configs small and per-package.
- Test: Vitest workspace across packages. Core is unit tested first (test-driven, per the rules). Vue components tested with @vue/test-utils. Renderer round-trip and mutation tests are the backbone.
- Lint and format: tsconfig strict, no `any`, explicit return types on exports. Prettier or Biome for format, ESLint for lint. Pick one formatter, keep it clean before any commit.
- Quality gate before any commit: tests green, lint clean, format clean.

## Publish strategy

- Park `vue-page-composer` immediately with a self-contained 0.0.1: correct package.json metadata (name, description, repo, MIT license, author, keywords), a README, and a tiny hand-written `dist` so install never breaks. No toolchain dependency in the park step, so nothing can block it.
- Park `nuxt-page-composer` and the `@page-composer/*` scope names the same way if time allows, so the whole set is reserved.
- Real releases follow once core and vue are built and tested. Scoped packages publish first (topological: core, then dnd and fields, then vue and nuxt), then the aliases re-export them. Scoped packages publish with `--access public`.
- Conventional commits, atomic, squash merge to main. No AI attribution anywhere.

## Risks and how they are handled

- Bleeding-edge majors (Vite 8, Vitest 4, TS 6, Nuxt 4). Mitigation: pin ranges, verify the build on each package, keep the park publish toolchain-free.
- Cross-frame dnd coordinate bridging is the hardest part of Phase 1. Mitigation: isolate it in the dnd package behind a narrow interface so the editor does not carry the complexity.
- Publishing is irreversible per version. Mitigation: park at 0.0.1 with honest "early development" wording, hold real semver until tested.
