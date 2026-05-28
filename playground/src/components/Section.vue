<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'paper' | 'tint' | 'dark' }>(), { tone: 'paper' })
</script>

<template>
  <section class="demo-section" :class="`tone-${tone}`">
    <slot name="content" />
  </section>
</template>

<style scoped>
.demo-section {
  width: 100%;
}
.demo-section.tone-tint {
  background: #faf6ec;
}
.demo-section.tone-dark {
  background: #211c15;
  color: #ede6db;
}
</style>
