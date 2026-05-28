<script setup lang="ts">
withDefaults(defineProps<{ cols?: number; gap?: number }>(), { cols: 3, gap: 18 })
</script>

<template>
  <div class="demo-grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gap + 'px' }">
    <slot name="items" />
  </div>
</template>

<style scoped>
.demo-grid {
  display: grid;
  padding: 8px 44px 50px;
}
</style>
