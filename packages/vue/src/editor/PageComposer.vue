<script setup lang="ts">
/**
 * The authoring surface: toolbar, palette and outline, canvas, inspector, and
 * status bar. Controlled through v-model, so the host owns when and how to
 * persist. Emits the document on every change.
 */
import { computed, provide, ref, type Component } from 'vue'
import { createDocument, type ComposedDocument, type Config } from '@page-composer/core'
import { editorBridgeKey } from '../renderer/context.js'
import { useEditor } from './useEditor.js'
import { editorStoreKey } from './store.js'
import { Icon } from './icons.js'
import Palette from './Palette.vue'
import Outline from './Outline.vue'
import Canvas from './Canvas.vue'
import Inspector from './Inspector.vue'
import ModelOverlay from './ModelOverlay.vue'

const props = withDefaults(
  defineProps<{
    config: Config<Component>
    modelValue?: ComposedDocument
    route?: string
    version?: string
    docName?: string
    /** Components for custom field types, keyed by the field's `component` name. */
    fieldComponents?: Record<string, Component>
    /** Data context for resolving bound props on the canvas while authoring. */
    data?: Record<string, unknown>
    /** Render the canvas in an iframe for true CSS isolation and viewport accuracy. */
    isolate?: boolean
  }>(),
  {
    route: '/',
    version: '0.1',
    docName: 'page.json',
    fieldComponents: () => ({}),
    data: () => ({}),
    isolate: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [doc: ComposedDocument]
  change: [doc: ComposedDocument]
  preview: []
  publish: [doc: ComposedDocument]
}>()

const internal = ref<ComposedDocument>(props.modelValue ?? createDocument())
const doc = computed<ComposedDocument>(() => props.modelValue ?? internal.value)

function emitDoc(next: ComposedDocument): void {
  internal.value = next
  emit('update:modelValue', next)
  emit('change', next)
}

const editor = useEditor({ config: props.config, doc, emit: emitDoc })

provide(editorStoreKey, {
  ...editor,
  config: props.config,
  doc,
  fieldComponents: props.fieldComponents,
})
provide(editorBridgeKey, editor.bridge)

const viewport = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
const leftTab = ref<'blocks' | 'outline'>('blocks')
const showModel = ref(false)
const showShortcuts = ref(false)

const isMac =
  typeof navigator !== 'undefined' &&
  /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)
const mod = isMac ? '⌘' : 'Ctrl'

const shortcuts: { keys: string; label: string }[] = [
  { keys: `${mod} Z`, label: 'Undo' },
  { keys: `${mod} ⇧ Z`, label: 'Redo' },
  { keys: `${mod} D`, label: 'Duplicate selection' },
  { keys: `${mod} C`, label: 'Copy selection' },
  { keys: `${mod} V`, label: 'Paste' },
  { keys: `${mod} ⇧ ↑ / ↓`, label: 'Move selection up / down' },
  { keys: '⌫', label: 'Delete selection' },
  { keys: 'Esc', label: 'Deselect' },
  { keys: '?', label: 'Toggle this help' },
]

const nodeCount = computed(() => Object.keys(doc.value.nodes).length)

function isTextEntry(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

function onKeydown(event: KeyboardEvent): void {
  // Esc closes an open overlay first, otherwise deselects (even from a field).
  if (event.key === 'Escape') {
    if (showShortcuts.value) {
      showShortcuts.value = false
      return
    }
    if (showModel.value) {
      showModel.value = false
      return
    }
    ;(event.target as HTMLElement | null)?.blur?.()
    editor.select(null)
    return
  }
  // Leave text entry to the browser: native undo, copy, paste, caret movement.
  if (isTextEntry(event.target)) return

  const meta = event.metaKey || event.ctrlKey
  const key = event.key.toLowerCase()
  const id = editor.selectedId.value

  if (key === '?' || (event.shiftKey && key === '/')) {
    event.preventDefault()
    showShortcuts.value = !showShortcuts.value
    return
  }
  if (meta && key === 'z') {
    event.preventDefault()
    if (event.shiftKey) editor.redo()
    else editor.undo()
    return
  }
  if (meta && key === 'd' && id) {
    event.preventDefault()
    editor.duplicate(id)
    return
  }
  if (meta && key === 'c' && id) {
    event.preventDefault()
    editor.copy(id)
    return
  }
  if (meta && key === 'v') {
    event.preventDefault()
    editor.paste()
    return
  }
  if (id && (event.metaKey || event.ctrlKey) && event.shiftKey && key === 'arrowup') {
    event.preventDefault()
    editor.reorder(id, -1)
    return
  }
  if (id && (event.metaKey || event.ctrlKey) && event.shiftKey && key === 'arrowdown') {
    event.preventDefault()
    editor.reorder(id, 1)
    return
  }
  if ((event.key === 'Backspace' || event.key === 'Delete') && id) {
    event.preventDefault()
    editor.remove(id)
  }
}
</script>

<template>
  <div class="pc-editor pc-scope" tabindex="0" @keydown="onKeydown">
    <!-- toolbar -->
    <header class="pc-toolbar">
      <div class="pc-brand">
        <svg class="pc-brand-mark" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="9" height="9" rx="1.5" fill="#e0a049" />
          <rect x="13" y="2" width="9" height="9" rx="1.5" fill="#54bdb6" />
          <rect x="2" y="13" width="9" height="9" rx="1.5" fill="#e07a5f" />
          <rect x="13" y="13" width="9" height="9" rx="1.5" fill="#ede6db" />
        </svg>
        <span class="pc-brand-word">Page Composer</span>
        <span class="pc-brand-ver">v{{ version }}</span>
      </div>

      <nav class="pc-crumbs">
        <span>route</span><span class="pc-sep">·</span
        ><b :style="{ color: 'var(--pc-accent)' }">{{ route }}</b>
      </nav>

      <div class="pc-vp-toggle">
        <button
          v-for="vp in ['desktop', 'tablet', 'mobile'] as const"
          :key="vp"
          type="button"
          :class="{ 'pc-on': viewport === vp }"
          :title="vp"
          :aria-pressed="viewport === vp"
          @click="viewport = vp"
        >
          <Icon :name="vp" />
        </button>
      </div>

      <div class="pc-spacer" />

      <button
        class="pc-ico-btn"
        type="button"
        title="Undo"
        :disabled="!editor.canUndo.value"
        @click="editor.undo()"
      >
        <Icon name="undo" />
      </button>
      <button
        class="pc-ico-btn"
        type="button"
        title="Redo"
        :disabled="!editor.canRedo.value"
        @click="editor.redo()"
      >
        <Icon name="redo" />
      </button>
      <div class="pc-tdiv" />
      <button
        class="pc-btn pc-ghost"
        :class="{ 'pc-on': showModel }"
        type="button"
        @click="showModel = !showModel"
      >
        <Icon name="code" /> Model
      </button>
      <button class="pc-btn pc-ghost" type="button" @click="emit('preview')">
        <Icon name="eye" /> Preview
      </button>
      <button class="pc-btn pc-solid" type="button" @click="emit('publish', doc)">
        <Icon name="check" /> Publish
      </button>
      <button
        class="pc-ico-btn"
        type="button"
        title="Keyboard shortcuts (?)"
        aria-label="Keyboard shortcuts"
        @click="showShortcuts = !showShortcuts"
      >
        <Icon name="help" />
      </button>
    </header>

    <!-- body -->
    <div class="pc-body">
      <aside class="pc-panel pc-left">
        <div class="pc-tabs">
          <button
            class="pc-tab"
            :class="{ 'pc-on': leftTab === 'blocks' }"
            type="button"
            @click="leftTab = 'blocks'"
          >
            <Icon name="blocks" /> Blocks
          </button>
          <button
            class="pc-tab"
            :class="{ 'pc-on': leftTab === 'outline' }"
            type="button"
            @click="leftTab = 'outline'"
          >
            <Icon name="outline" /> Outline
          </button>
        </div>
        <Palette v-if="leftTab === 'blocks'" />
        <Outline v-else />
      </aside>

      <Canvas :viewport="viewport" :route="route" :data="data" :isolate="isolate" />

      <aside class="pc-panel pc-right">
        <Inspector />
      </aside>
    </div>

    <ModelOverlay :show="showModel" @close="showModel = false" />

    <!-- keyboard shortcuts overlay -->
    <div v-if="showShortcuts" class="pc-json-wrap" @click.self="showShortcuts = false">
      <div class="pc-json-card pc-shortcuts-card" role="dialog" aria-label="Keyboard shortcuts">
        <div class="pc-jh">
          <div class="pc-jt">Keyboard shortcuts</div>
          <button
            class="pc-ico-btn"
            type="button"
            aria-label="Close"
            @click="showShortcuts = false"
          >
            <Icon name="close" />
          </button>
        </div>
        <ul class="pc-shortcuts">
          <li v-for="s in shortcuts" :key="s.label">
            <span class="pc-sc-label">{{ s.label }}</span>
            <kbd class="pc-kbd">{{ s.keys }}</kbd>
          </li>
        </ul>
      </div>
    </div>

    <!-- polite live region for screen readers -->
    <div class="pc-sr-only" aria-live="polite" role="status">{{ editor.announcement.value }}</div>

    <!-- status -->
    <footer class="pc-status">
      <span class="pc-live"><i /> resolvers live</span>
      <span
        >doc <b>{{ docName }}</b></span
      >
      <span>{{ nodeCount }} nodes</span>
      <span class="pc-sp" />
      <button class="pc-status-btn" type="button" @click="showShortcuts = true">shortcuts ?</button>
      <span>Vue 3.5</span>
      <span>{{ viewport }}</span>
    </footer>
  </div>
</template>
