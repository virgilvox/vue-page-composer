<script setup lang="ts">
/**
 * Renders one node and recurses into its zones. Editor-aware through the
 * optional editor bridge: with a bridge it draws a selection wrapper, a
 * floating tag, and empty-zone drop placeholders. Without one it renders the
 * host component bare, so production output carries no editor markup.
 */
import { computed, inject } from 'vue'
import { ROOT_TYPE, resolveProps, type ComponentConfig, type PageNode } from '@page-composer/core'
import { renderContextKey, editorBridgeKey } from './context.js'

const props = defineProps<{
  id: string
  /** Repeater item scope passed down to bound props. */
  scope?: Record<string, unknown>
}>()

defineOptions({ inheritAttrs: false })

const ctx = inject(renderContextKey)
if (!ctx) throw new Error('NodeRenderer must be used inside ComposedPage')
const bridge = inject(editorBridgeKey, null)

const node = computed<PageNode | undefined>(() => ctx.document.value.nodes[props.id])
const isRoot = computed(() => node.value?.type === ROOT_TYPE)

const componentConfig = computed<ComponentConfig | undefined>(() => {
  const type = node.value?.type
  if (!type) return undefined
  return ctx.config.components[type]
})

const zoneNames = computed<string[]>(() => {
  const n = node.value
  if (!n) return []
  if (isRoot.value) return Object.keys(n.zones ?? {})
  return componentConfig.value?.zones ?? []
})

const resolvedProps = computed<Record<string, unknown>>(() =>
  resolveProps(node.value?.props, ctx.resolver, {
    data: ctx.data.value,
    ...(props.scope ? { scope: props.scope } : {}),
  }),
)

function childIds(zone: string): string[] {
  return node.value?.zones?.[zone] ?? []
}

// Conditional visibility. The `when` expression is resolved against the data
// context; a falsy result hides the node in production. In the editor the node
// still renders (so it can be edited) and is marked as conditionally hidden.
const conditional = computed(() => Boolean(node.value?.when))
const hidden = computed<boolean>(() => {
  const when = node.value?.when
  if (!when) return false
  return !ctx.resolver.resolve(when, {
    data: ctx.data.value,
    ...(props.scope ? { scope: props.scope } : {}),
  })
})

// Repeater support. In production the template zone is rendered once per item
// in the resolved list; in the editor it renders once so it stays editable.
const repeat = computed(() => componentConfig.value?.repeat)
const repeatList = computed<unknown[]>(() => {
  const config = repeat.value
  if (!config) return []
  const value = resolvedProps.value[config.source]
  return Array.isArray(value) ? value : []
})
function scopeFor(item: unknown): Record<string, unknown> {
  return typeof item === 'object' && item !== null
    ? (item as Record<string, unknown>)
    : { value: item }
}

const selected = computed(() => bridge?.selectedId.value === props.id)
const hovered = computed(() => bridge?.hoveredId.value === props.id)

function onNodeDragStart(event: DragEvent): void {
  // Some browsers (Firefox) will not start a drag unless dataTransfer is set.
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.id)
  }
  bridge?.beginNodeDrag(props.id)
}
</script>

<template>
  <!-- The document root: render its zones with no component of its own. -->
  <template v-if="isRoot">
    <div
      v-for="zone in zoneNames"
      :key="zone"
      class="pc-root-zone"
      :data-pc-zone="zone"
      :data-pc-parent="id"
    >
      <NodeRenderer v-for="childId in childIds(zone)" :key="childId" :id="childId" :scope="scope" />
      <div
        v-if="bridge && childIds(zone).length === 0"
        class="pc-zone-empty"
        :data-pc-zone="zone"
        :data-pc-parent="id"
      >
        Drop a block here
      </div>
    </div>
  </template>

  <!-- A type the host did not register. -->
  <div v-else-if="!componentConfig" class="pc-unknown">
    Unknown component: <code>{{ node?.type }}</code>
  </div>

  <!-- Editor mode: selection wrapper, floating tag, droppable zones. -->
  <div
    v-else-if="bridge"
    class="pc-cmp"
    :class="{
      'pc-selected': selected,
      'pc-hovered': hovered,
      'pc-dragging': bridge.dragNodeId.value === id,
      'pc-moving': bridge.movingId.value === id,
      'pc-conditional': conditional,
      'pc-cond-hidden': conditional && hidden,
    }"
    :data-pc-node-id="id"
    role="button"
    tabindex="0"
    :aria-label="`${componentConfig.label} block`"
    :aria-pressed="selected"
    draggable="true"
    @click.stop="bridge.select(id)"
    @keydown.enter.stop.prevent="bridge.select(id)"
    @keydown.space.stop.prevent="bridge.select(id)"
    @mouseover.stop="bridge.hover(id)"
    @mouseleave.stop="bridge.hover(null)"
    @dragstart.stop="onNodeDragStart"
    @dragend.stop="bridge.endDrag()"
  >
    <div class="pc-tag-float">
      <span class="pc-tag-grip" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <circle cx="9" cy="6" r="1.4" />
          <circle cx="15" cy="6" r="1.4" />
          <circle cx="9" cy="12" r="1.4" />
          <circle cx="15" cy="12" r="1.4" />
          <circle cx="9" cy="18" r="1.4" />
          <circle cx="15" cy="18" r="1.4" />
        </svg>
      </span>
      <span class="pc-tag-name">{{ componentConfig.label }}</span>
      <span
        v-if="conditional"
        class="pc-tag-cond"
        :title="hidden ? 'Hidden by condition' : 'Conditionally shown'"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
          <path v-if="hidden" d="M3 3l18 18" />
        </svg>
      </span>
      <button class="pc-tag-act" title="Duplicate" @click.stop="bridge.duplicate(id)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      </button>
      <button class="pc-tag-act" title="Delete" @click.stop="bridge.remove(id)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>
    <component :is="componentConfig.render" v-bind="resolvedProps">
      <template v-for="zone in zoneNames" :key="zone" #[zone]>
        <NodeRenderer
          v-for="childId in childIds(zone)"
          :key="childId"
          :id="childId"
          :scope="scope"
        />
        <div
          v-if="childIds(zone).length === 0"
          class="pc-zone-empty"
          :data-pc-zone="zone"
          :data-pc-parent="id"
        >
          Drop here
        </div>
      </template>
    </component>
  </div>

  <!-- Production: bare host component, no wrapper. Hidden when its condition is falsy. -->
  <component :is="componentConfig.render" v-else-if="!hidden" v-bind="resolvedProps">
    <template v-for="zone in zoneNames" :key="zone" #[zone]>
      <template v-if="repeat && zone === repeat.zone">
        <template v-for="(item, i) in repeatList" :key="i">
          <NodeRenderer
            v-for="childId in childIds(zone)"
            :key="`${childId}#${i}`"
            :id="childId"
            :scope="scopeFor(item)"
          />
        </template>
      </template>
      <NodeRenderer
        v-for="childId in childIds(zone)"
        v-else
        :key="childId"
        :id="childId"
        :scope="scope"
      />
    </template>
  </component>
</template>
