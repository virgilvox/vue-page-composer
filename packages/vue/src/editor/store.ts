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
}

export const editorStoreKey: InjectionKey<EditorStore> = Symbol('pc-editor-store')
