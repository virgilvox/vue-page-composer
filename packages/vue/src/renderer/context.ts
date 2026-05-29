/**
 * Injection contracts shared between the renderer and the editor. The renderer
 * reads the render context to resolve props and look up components. When the
 * editor mounts the same renderer it also provides an editor bridge, which
 * turns on selection chrome and drop targets. Production has no bridge, so the
 * output is plain: what you author is what ships.
 */

import type { InjectionKey, Component, Ref } from 'vue'
import type { ComposedDocument, Config, Resolver } from '@page-composer/core'

export interface RenderContext {
  config: Config<Component>
  resolver: Resolver
  /** The live document. Reactive so canvas edits flow through. */
  document: Ref<ComposedDocument>
  /** The data context resolvers read against. */
  data: Ref<Record<string, unknown>>
}

export const renderContextKey: InjectionKey<RenderContext> = Symbol('pc-render-context')

export interface EditorBridge {
  readonly isEditor: true
  selectedId: Ref<string | null>
  hoveredId: Ref<string | null>
  /** Node currently being dragged on the canvas, for dimming the source. */
  dragNodeId: Ref<string | null>
  /** Node currently in keyboard move mode, for highlighting it. */
  movingId: Ref<string | null>
  select: (id: string | null) => void
  hover: (id: string | null) => void
  /** Insert a child of the given type into a zone at an index. */
  requestInsert: (type: string, parentId: string, zone: string, index?: number) => void
  /** Move an existing node to a new location. */
  requestMove: (id: string, parentId: string, zone: string, index?: number) => void
  duplicate: (id: string) => void
  remove: (id: string) => void
  /** Mark an existing node as the current drag source. */
  beginNodeDrag: (id: string) => void
  endDrag: () => void
}

export const editorBridgeKey: InjectionKey<EditorBridge | null> = Symbol('pc-editor-bridge')
