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
  extractSubtree,
  insertSubtree,
  setProp,
  setBinding,
  clearBinding,
  findParent,
  zoneAccepts,
  type ComposedDocument,
  type Config,
  type DropTarget,
  type PropValue,
  type Subtree,
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
  /** Shift a node up (delta -1) or down (delta +1) within its current zone. */
  reorder: (id: string, delta: number) => void
  duplicate: (id: string) => void
  remove: (id: string) => void
  setField: (id: string, key: string, value: PropValue) => void
  bindField: (id: string, key: string, expression: string) => void
  unbindField: (id: string, key: string, value?: PropValue) => void
  copy: (id: string) => void
  paste: () => string | null
  canPaste: ComputedRef<boolean>
  undo: () => void
  redo: () => void
  /** Polite screen-reader announcement of the last action. */
  announcement: Ref<string>
  bridge: EditorBridge
}

export function useEditor(params: UseEditorParams): EditorApi {
  const { config, doc, emit } = params
  const history = new History(doc.value)
  const selectedId = ref<string | null>(null)
  const hoveredId = ref<string | null>(null)
  const dragType = ref<string | null>(null)
  const dragNodeId = ref<string | null>(null)
  const clipboard = ref<Subtree | null>(null)
  const announcement = ref('')
  const version = ref(0)

  const canPaste = computed(() => clipboard.value !== null)

  function labelOf(id: string): string {
    const type = doc.value.nodes[id]?.type
    if (!type) return 'block'
    return config.components[type]?.label ?? type
  }

  function announce(message: string): void {
    // Reset first so repeated identical messages re-trigger the live region.
    announcement.value = ''
    announcement.value = message
  }

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
    announce(`Added ${componentConfig?.label ?? type}`)
    return result.id
  }

  // Where a click-to-add or paste lands, relative to the current selection:
  // into a selected container's first zone, after a selected leaf, or the root.
  function selectionTarget(): DropTarget {
    const sel = selectedId.value
    if (sel) {
      const selNode = doc.value.nodes[sel]
      const selZones = selNode ? config.components[selNode.type]?.zones : undefined
      if (selZones && selZones.length > 0) return { parentId: sel, zone: selZones[0] as string }
      const location = findParent(doc.value, sel)
      if (location)
        return { parentId: location.parentId, zone: location.zone, index: location.index + 1 }
    }
    const rootNode = doc.value.nodes[doc.value.root]
    const rootZone = rootNode?.zones ? (Object.keys(rootNode.zones)[0] ?? 'main') : 'main'
    return { parentId: doc.value.root, zone: rootZone }
  }

  function rootTarget(): DropTarget {
    const rootNode = doc.value.nodes[doc.value.root]
    const rootZone = rootNode?.zones ? (Object.keys(rootNode.zones)[0] ?? 'main') : 'main'
    return { parentId: doc.value.root, zone: rootZone }
  }

  function addBlock(type: string): string | null {
    const target = selectionTarget()
    const parentType = doc.value.nodes[target.parentId]?.type
    // If the selection's zone rejects this type, drop at the root instead.
    if (parentType && !zoneAccepts(config, parentType, target.zone, type)) {
      const root = rootTarget()
      return insert(type, root.parentId, root.zone, root.index)
    }
    return insert(type, target.parentId, target.zone, target.index)
  }

  function copy(id: string): void {
    clipboard.value = extractSubtree(doc.value, id)
    announce(`Copied ${labelOf(id)}`)
  }

  function paste(): string | null {
    if (!clipboard.value) return null
    const target = selectionTarget()
    const result = insertSubtree(doc.value, clipboard.value, target)
    commit(result.doc)
    select(result.id)
    announce(`Pasted ${labelOf(result.id)}`)
    return result.id
  }

  function move(id: string, parentId: string, zone: string, index?: number): void {
    const label = labelOf(id)
    const target = index === undefined ? { parentId, zone } : { parentId, zone, index }
    try {
      commit(moveNode(doc.value, id, target))
      announce(`Moved ${label}`)
    } catch {
      // Invalid moves (into own subtree) are ignored rather than thrown at the user.
    }
  }

  // Shift a node within its current zone by detaching and reinserting. Because
  // moveNode reads the index against the post-detach array, a downward shift
  // targets index+1 and an upward shift targets index-1.
  function reorder(id: string, delta: number): void {
    const location = findParent(doc.value, id)
    if (!location) return
    const target = {
      parentId: location.parentId,
      zone: location.zone,
      index: location.index + delta,
    }
    if (target.index < 0) return
    move(id, target.parentId, target.zone, target.index)
  }

  function duplicate(id: string): void {
    const result = duplicateNode(doc.value, id)
    commit(result.doc)
    select(result.id)
    announce(`Duplicated ${labelOf(result.id)}`)
  }

  function remove(id: string): void {
    const label = labelOf(id)
    const parent = findParent(doc.value, id)
    commit(removeNode(doc.value, id))
    if (selectedId.value === id) select(parent ? parent.parentId : null)
    announce(`Deleted ${label}`)
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
    if (restored) {
      emit(restored)
      announce('Undo')
    }
  }

  function redo(): void {
    const restored = history.redo()
    version.value += 1
    if (restored) {
      emit(restored)
      announce('Redo')
    }
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
    dragNodeId,
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
    reorder,
    duplicate,
    remove,
    setField,
    bindField,
    unbindField,
    copy,
    paste,
    canPaste,
    undo,
    redo,
    announcement,
    bridge,
  }
}
