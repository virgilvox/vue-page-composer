<script setup lang="ts">
import { ref } from 'vue'
import { PageComposer, ComposedPage, serialize, type ComposedDocument } from '@page-composer/vue'
import { config } from './page-config'
import { initialDoc, sampleData } from './initial-doc'
import IconField from './components/IconField.vue'

// Custom inspector field types, keyed by the field's `component` name.
const fieldComponents = { iconPicker: IconField }

const doc = ref<ComposedDocument>(initialDoc)
const mode = ref<'edit' | 'preview'>('edit')

function onPublish(next: ComposedDocument): void {
  // The host owns persistence. Here we just log the portable document.
  console.log('published document:\n', serialize(next, true))
  mode.value = 'preview'
}
</script>

<template>
  <PageComposer
    v-if="mode === 'edit'"
    v-model="doc"
    :config="config"
    :field-components="fieldComponents"
    route="/"
    version="0.3"
    doc-name="home.page.json"
    @preview="mode = 'preview'"
    @publish="onPublish"
  />

  <div v-else class="preview">
    <header class="preview-bar">
      <span class="tag">Preview · rendered with ComposedPage</span>
      <button class="back" @click="mode = 'edit'">Back to editor</button>
    </header>
    <div class="preview-stage">
      <div class="preview-paper">
        <ComposedPage :config="config" :model="doc" :data="sampleData" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #15120d;
}
.preview-bar {
  height: 48px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #1b1711;
  border-bottom: 1px solid rgba(237, 230, 219, 0.14);
}
.tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: #54bdb6;
}
.back {
  height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 7px;
  background: #e0a049;
  color: #3a2a0e;
  font-weight: 600;
  font-size: 12.5px;
  cursor: pointer;
}
.preview-stage {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 30px 24px 60px;
}
.preview-paper {
  width: 100%;
  max-width: 980px;
  align-self: flex-start;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 30px 70px -28px rgba(0, 0, 0, 0.7);
}
</style>
