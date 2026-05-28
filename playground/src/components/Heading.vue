<script setup lang="ts">
withDefaults(defineProps<{ text?: string; level?: '1' | '2' | '3'; align?: 'left' | 'center' }>(), {
  text: 'Section heading',
  level: '2',
  align: 'center',
})
</script>

<template>
  <component :is="`h${level}`" class="demo-heading" :style="{ textAlign: align }">
    {{ text }}
  </component>
</template>

<style scoped>
.demo-heading {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #2a2620;
  padding: 36px 44px 0;
  margin: 0;
}
h1.demo-heading {
  font-size: 34px;
}
h2.demo-heading {
  font-size: 26px;
}
h3.demo-heading {
  font-size: 20px;
}
</style>
