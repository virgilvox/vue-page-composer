<script setup lang="ts">
import { defineComponent, h } from 'vue'
import type { ComposedDocument, Config } from '@page-composer/vue'

const Hero = defineComponent({
  props: { title: { type: String, default: '' } },
  setup: (p) => () => h('h1', { class: 'hero' }, p.title),
})

const config: Config = {
  components: { Hero: { label: 'Hero', render: Hero } },
}

const model: ComposedDocument = {
  version: '1',
  root: 'page',
  nodes: {
    page: { type: 'Root', zones: { main: ['n_hero'] } },
    n_hero: { type: 'Hero', props: { title: { $bind: 'msg' } } },
  },
}

const data = { msg: 'SSR works' }
</script>

<template>
  <ComposedPage :config="config" :model="model" :data="data" />
</template>
