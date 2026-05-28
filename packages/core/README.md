# @page-composer/core

Framework-neutral core for [Page Composer](https://github.com/virgilvox/vue-page-composer). No Vue, no DOM. This package defines the document format and the logic around it so the format outlives any single renderer.

## What is inside

- Document model: a flat map of nodes keyed by id, plus a root id and optional data sources.
- Mutations: `insertNode`, `moveNode`, `removeNode`, `duplicateNode`, `extractSubtree`, `insertSubtree`, `setProp`, `setBinding`, `clearBinding`. Each is pure and returns a new document. `extractSubtree` and `insertSubtree` are the copy and paste primitives, and work across documents.
- Traversal: `findParent`, `collectSubtree`, `walk`, `cloneSubtree`, and friends.
- History: an undo and redo stack over document snapshots.
- Serialization: `serialize`, `deserialize`, and `validateDocument` with collected, path-tagged errors.
- Resolver interface: `Resolver`, `resolveProps`, and a default dot-path resolver for data binding.

## Document shape

```json
{
  "version": "1",
  "root": "page",
  "nodes": {
    "page": { "type": "Root", "zones": { "main": ["n_hero", "n_grid"] } },
    "n_hero": { "type": "Hero", "props": { "title": "Welcome" } },
    "n_grid": { "type": "Grid", "props": { "cols": 3 }, "zones": { "items": ["c_8f3a"] } },
    "c_8f3a": { "type": "Card", "props": { "title": { "$bind": "feature.title" } } }
  },
  "data": { "feature": { "$source": "collection:features" } }
}
```

A prop value is either a literal or a `{ "$bind": "path" }` binding the resolver evaluates at render time.

## License

MIT. Copyright Moheeb Zara.
