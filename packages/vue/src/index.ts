/**
 * @page-composer/vue
 *
 * The Vue editor and renderer. PageComposer is the authoring surface;
 * ComposedPage is the runtime. Both read the same config and document.
 */
import './styles/tokens.css'
import './styles/editor.css'

export { default as ComposedPage } from './renderer/ComposedPage.vue'
export { default as PageComposer } from './editor/PageComposer.vue'
export { default as NodeRenderer } from './renderer/NodeRenderer.vue'

export { definePageConfig } from './config.js'
export { useEditor } from './editor/useEditor.js'
export type { EditorApi, UseEditorParams } from './editor/useEditor.js'
export { editorStoreKey } from './editor/store.js'
export type { EditorStore } from './editor/store.js'
export {
  renderContextKey,
  editorBridgeKey,
  type RenderContext,
  type EditorBridge,
} from './renderer/context.js'

// Re-export the core model so consumers have one import surface.
export * from '@page-composer/core'
