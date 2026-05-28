<script setup lang="ts">
// A data-driven container. Page Composer repeats its `item` zone once per
// record in the bound `source` list, so the card placed inside is a template.
withDefaults(defineProps<{ cols?: number; source?: unknown }>(), { cols: 3 })
</script>

<template>
  <div class="demo-repeater" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
    <slot name="item" />
  </div>
</template>

<style scoped>
.demo-repeater {
  display: grid;
  gap: 18px;
  padding: 8px 44px 50px;
}
</style>
