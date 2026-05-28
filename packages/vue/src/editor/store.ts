/**
 * Injection key for the editor store. PageComposer provides it; the palette,
 * inspector, outline, and toolbar inject it instead of threading props.
 */
import type { Component, ComputedRef, InjectionKey } from 'vue'
import type { ComposedDocument, Config } from '@page-composer/core'
import type { EditorApi } from './useEditor.js'

export interface EditorStore extends EditorApi {
  config: Config<Component>
  doc: ComputedRef<ComposedDocument>
  /** Host-registered components for custom field types, keyed by name. */
  fieldComponents: Record<string, Component>
}

export const editorStoreKey: InjectionKey<EditorStore> = Symbol('pc-editor-store')
