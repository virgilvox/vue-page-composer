<script setup lang="ts">
/**
 * An isolated canvas. The page renders inside an iframe, which gives true CSS
 * isolation (editor chrome cannot bleed in) and makes width-based media queries
 * respond to the simulated device width rather than the editor window.
 *
 * A second Vue app is mounted into the iframe rendering the same editor-aware
 * ComposedPage. It shares the store's reactive refs (document, selection) and
 * the editor bridge, so selecting or editing inside the iframe updates the
 * inspector and outline with no message passing. Host stylesheets are copied in
 * so components look exactly as they will in production.
 *
 * Insertion in this mode is click-to-add and keyboard; in-iframe drag and drop
 * is a planned follow-up.
 */
import { createApp, h, inject, nextTick, onBeforeUnmount, onMounted, ref, type App } from 'vue'
import { editorStoreKey } from './store.js'
import { editorBridgeKey } from '../renderer/context.js'
import ComposedPage from '../renderer/ComposedPage.vue'

const props = defineProps<{ data?: Record<string, unknown> }>()

const injected = inject(editorStoreKey)
if (!injected) throw new Error('IframeCanvas must be used inside PageComposer')
const store = injected

const frame = ref<HTMLIFrameElement | null>(null)
let app: App | null = null
let headObserver: MutationObserver | null = null
let bodyObserver: ResizeObserver | null = null

// Copy the host's stylesheets into the iframe so components, and the selection
// chrome, are styled exactly as in the parent document.
function syncStyles(doc: Document): void {
  doc.head.querySelectorAll('[data-pc-synced]').forEach((node) => node.remove())
  const base = doc.createElement('style')
  base.setAttribute('data-pc-synced', '')
  base.textContent = 'html,body{margin:0;padding:0;background:#fff}'
  doc.head.appendChild(base)
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    const clone = node.cloneNode(true)
    ;(clone as HTMLElement).setAttribute('data-pc-synced', '')
    doc.head.appendChild(clone)
  })
}

function mountInto(doc: Document): void {
  doc.open()
  doc.write('<!doctype html><html><head></head><body><div id="pc-mount"></div></body></html>')
  doc.close()
  syncStyles(doc)

  const target = doc.getElementById('pc-mount')
  if (!target) return

  app = createApp({
    setup() {
      return () =>
        h(ComposedPage, { config: store.config, model: store.doc.value, data: props.data ?? {} })
    },
  })
  app.provide(editorBridgeKey, store.bridge)
  app.mount(target)

  // Grow the iframe to its content so there is no inner scrollbar. Defer to the
  // next frame and skip no-op updates so resizing never feeds back into itself.
  let frameRequest = 0
  let lastHeight = 0
  bodyObserver = new ResizeObserver(() => {
    if (frameRequest) return
    frameRequest = requestAnimationFrame(() => {
      frameRequest = 0
      const el = frame.value
      if (!el || !doc.body) return
      const next = doc.body.scrollHeight
      if (next !== lastHeight) {
        lastHeight = next
        el.style.height = `${next}px`
      }
    })
  })
  bodyObserver.observe(doc.body)

  // Keep styles in sync as the host hot-reloads during development.
  headObserver = new MutationObserver(() => syncStyles(doc))
  headObserver.observe(document.head, { childList: true, subtree: true })
}

onMounted(() => {
  nextTick(() => {
    const doc = frame.value?.contentDocument
    if (doc) mountInto(doc)
  })
})

onBeforeUnmount(() => {
  headObserver?.disconnect()
  bodyObserver?.disconnect()
  app?.unmount()
  app = null
})
</script>

<template>
  <iframe ref="frame" class="pc-iframe" title="Page preview" />
</template>
