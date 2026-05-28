<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    body?: string
    icon?: string
    variant?: 'plain' | 'bordered' | 'filled'
    elevated?: boolean
    accent?: string
    padding?: number
  }>(),
  {
    title: 'Card title',
    body: 'Card body text.',
    icon: 'zap',
    variant: 'bordered',
    elevated: false,
    accent: '#e0a049',
    padding: 22,
  },
)

const glyphs: Record<string, string> = {
  zap: 'M13 2 3 14h9l-1 8 10-12h-9z',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20',
  shield: 'M12 2l9 5v6c0 5-3.5 8-9 9-5.5-1-9-4-9-9V7z',
}
</script>

<template>
  <div
    class="demo-card"
    :class="[`v-${variant}`, { elevated }]"
    :style="{ padding: padding + 'px', '--card-accent': accent }"
  >
    <div class="ico">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path :d="glyphs[icon] ?? glyphs.zap" />
      </svg>
    </div>
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
  color: var(--card-accent);
  display: grid;
  place-items: center;
  margin-bottom: 14px;
}
.ico svg {
  width: 20px;
  height: 20px;
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
