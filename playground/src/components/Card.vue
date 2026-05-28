<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    body?: string
    variant?: 'plain' | 'bordered' | 'filled'
    elevated?: boolean
    accent?: string
    padding?: number
  }>(),
  {
    title: 'Card title',
    body: 'Card body text.',
    variant: 'bordered',
    elevated: false,
    accent: '#e0a049',
    padding: 22,
  },
)
</script>

<template>
  <div
    class="demo-card"
    :class="[`v-${variant}`, { elevated }]"
    :style="{ padding: padding + 'px', '--card-accent': accent }"
  >
    <div class="ico" />
    <h3>{{ title }}</h3>
    <p>{{ body }}</p>
  </div>
</template>

<style scoped>
.demo-card {
  background: #fff;
  border-radius: 12px;
  transition: 0.12s;
}
.demo-card.v-bordered {
  border: 1px solid #e7e0d3;
}
.demo-card.v-filled {
  background: #faf6ec;
}
.demo-card.elevated {
  box-shadow: 0 12px 28px -14px rgba(0, 0, 0, 0.3);
}
.ico {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--card-accent) 18%, transparent);
  margin-bottom: 14px;
}
h3 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 700;
  font-size: 16.5px;
  margin: 0 0 7px;
  letter-spacing: -0.01em;
  color: #2a2620;
}
p {
  font-size: 12.5px;
  color: #6f685c;
  line-height: 1.5;
  margin: 0;
}
</style>
