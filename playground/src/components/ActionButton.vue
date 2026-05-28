<script setup lang="ts">
withDefaults(defineProps<{ label?: string; variant?: 'primary' | 'secondary' }>(), {
  label: 'Button',
  variant: 'primary',
})
</script>

<template>
  <span class="demo-btn-wrap">
    <a class="demo-btn" :class="variant">{{ label }}</a>
  </span>
</template>

<style scoped>
.demo-btn-wrap {
  display: flex;
  justify-content: center;
  padding: 18px 44px 0;
}
.demo-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 9px;
  font-weight: 600;
  font-size: 13.5px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.demo-btn.primary {
  background: #23201a;
  color: #fff;
}
.demo-btn.secondary {
  background: #fff;
  color: #23201a;
  border: 1px solid #e7e0d3;
}
</style>
