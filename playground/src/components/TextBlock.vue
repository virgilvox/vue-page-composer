<script setup lang="ts">
withDefaults(defineProps<{ content?: string; align?: 'left' | 'center' }>(), {
  content: 'Write some copy here.',
  align: 'center',
})
</script>

<template>
  <p class="demo-text" :style="{ textAlign: align }">{{ content }}</p>
</template>

<style scoped>
.demo-text {
  font-size: 15px;
  line-height: 1.6;
  color: #6f685c;
  max-width: 620px;
  margin: 14px auto 0;
  padding: 0 44px;
}
</style>
