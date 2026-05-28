<script setup lang="ts">
/**
 * Runtime that turns a saved document into a real page using the host's
 * registered components. The same component the editor canvas mounts, so what
 * you author is what ships. Pass a resolver and data to drive bound props.
 */
import { computed, provide, type Component } from 'vue'
import {
  defaultResolver,
  type ComposedDocument,
  type Config,
  type Resolver,
} from '@page-composer/core'
import { renderContextKey } from './context.js'
import NodeRenderer from './NodeRenderer.vue'

const props = withDefaults(
  defineProps<{
    config: Config<Component>
    model: ComposedDocument
    data?: Record<string, unknown>
    resolver?: Resolver
  }>(),
  {
    data: () => ({}),
    resolver: () => defaultResolver,
  },
)

const documentRef = computed(() => props.model)
const dataRef = computed(() => props.data)

provide(renderContextKey, {
  config: props.config,
  resolver: props.resolver,
  document: documentRef,
  data: dataRef,
})
</script>

<template>
  <div class="pc-page">
    <NodeRenderer :id="model.root" />
  </div>
</template>
