/**
 * Editor state and actions. Owns selection, hover, and an undo and redo stack,
 * and exposes the mutation actions the toolbar, palette, inspector, outline,
 * and canvas all call. Every mutation goes through `commit`, which records
 * history and notifies the host. The host stays in control of persistence.
 */
import { computed, ref, type Component, type ComputedRef, type Ref } from 'vue'
import {
  History,
  insertNode,
  moveNode,
  removeNode,
  duplicateNode,
  setProp,
  setBinding,
  clearBinding,
  findParent,
  type ComposedDocument,
  type Config,
  type PropValue,
} from '@page-composer/core'
import type { EditorBridge } from '../renderer/context.js'

export interface UseEditorParams {
  config: Config<Component>
  /** Current document, controlled by the host through v-model. */
  doc: ComputedRef<ComposedDocument>
  /** Push a new document state to the host. */
  emit: (next: ComposedDocument) => void
}

export interface EditorApi {
  selectedId: Ref<string | null>
  hoveredId: Ref<string | null>
  /** Type being dragged from the palette, if any. */
  dragType: Ref<string | null>
  /** Existing node being dragged on the canvas, if any. */
  dragNodeId: Ref<string | null>
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
  select: (id: string | null) => void
  hover: (id: string | null) => void
  insert: (type: string, parentId: string, zone: string, index?: number) => string | null
  /** Insert a block near the current selection, or at the root when nothing fits. */
  addBlock: (type: string) => string | null
  move: (id: string, parentId: string, zone: string, index?: number) => void
  duplicate: (id: string) => void
  remove: (id: string) => void
  setField: (id: string, key: string, value: PropValue) => void
  bindField: (id: string, key: string, expression: string) => void
  unbindField: (id: string, key: string, value?: PropValue) => void
  undo: () => void
  redo: () => void
  bridge: EditorBridge
}

export function useEditor(params: UseEditorParams): EditorApi {
  const { config, doc, emit } = params
  const history = new History(doc.value)
  const selectedId = ref<string | null>(null)
  const hoveredId = ref<string | null>(null)
  const dragType = ref<string | null>(null)
  const dragNodeId = ref<string | null>(null)
  const version = ref(0)

  const canUndo = computed(() => {
    void version.value
    return history.canUndo
  })
  const canRedo = computed(() => {
    void version.value
    return history.canRedo
  })

  function commit(next: ComposedDocument): void {
    history.push(next)
    version.value += 1
    emit(next)
  }

  function select(id: string | null): void {
    selectedId.value = id
  }

  function hover(id: string | null): void {
    hoveredId.value = id
  }

  function insert(type: string, parentId: string, zone: string, index?: number): string | null {
    const componentConfig = config.components[type]
    if (!componentConfig && type !== 'Root') return null
    const node = {
      type,
      ...(componentConfig?.defaultProps ? { props: componentConfig.defaultProps } : {}),
      ...(componentConfig?.zones ? { zones: componentConfig.zones } : {}),
    }
    const target = index === undefined ? { parentId, zone } : { parentId, zone, index }
    const result = insertNode(doc.value, node, target)
    commit(result.doc)
    select(result.id)
    return result.id
  }

  function addBlock(type: string): string | null {
    const sel = selectedId.value
    if (sel) {
      const selNode = doc.value.nodes[sel]
      const selZones = selNode ? config.components[selNode.type]?.zones : undefined
      if (selZones && selZones.length > 0) {
        return insert(type, sel, selZones[0] as string)
      }
      const location = findParent(doc.value, sel)
      if (location) return insert(type, location.parentId, location.zone, location.index + 1)
    }
    const rootNode = doc.value.nodes[doc.value.root]
    const rootZone = rootNode?.zones ? (Object.keys(rootNode.zones)[0] ?? 'main') : 'main'
    return insert(type, doc.value.root, rootZone)
  }

  function move(id: string, parentId: string, zone: string, index?: number): void {
    const target = index === undefined ? { parentId, zone } : { parentId, zone, index }
    try {
      commit(moveNode(doc.value, id, target))
    } catch {
      // Invalid moves (into own subtree) are ignored rather than thrown at the user.
    }
  }

  function duplicate(id: string): void {
    const result = duplicateNode(doc.value, id)
    commit(result.doc)
    select(result.id)
  }

  function remove(id: string): void {
    const parent = findParent(doc.value, id)
    commit(removeNode(doc.value, id))
    if (selectedId.value === id) select(parent ? parent.parentId : null)
  }

  function setField(id: string, key: string, value: PropValue): void {
    commit(setProp(doc.value, id, key, value))
  }

  function bindField(id: string, key: string, expression: string): void {
    commit(setBinding(doc.value, id, key, expression))
  }

  function unbindField(id: string, key: string, value: PropValue = ''): void {
    commit(clearBinding(doc.value, id, key, value))
  }

  function undo(): void {
    const restored = history.undo()
    version.value += 1
    if (restored) emit(restored)
  }

  function redo(): void {
    const restored = history.redo()
    version.value += 1
    if (restored) emit(restored)
  }

  function beginNodeDrag(id: string): void {
    dragNodeId.value = id
    dragType.value = null
  }

  function endDrag(): void {
    dragNodeId.value = null
    dragType.value = null
  }

  const bridge: EditorBridge = {
    isEditor: true,
    selectedId,
    hoveredId,
    select,
    hover,
    requestInsert: insert,
    requestMove: move,
    duplicate,
    remove,
    beginNodeDrag,
    endDrag,
  }

  return {
    selectedId,
    hoveredId,
    dragType,
    dragNodeId,
    canUndo,
    canRedo,
    select,
    hover,
    insert,
    addBlock,
    move,
    duplicate,
    remove,
    setField,
    bindField,
    unbindField,
    undo,
    redo,
    bridge,
  }
}
