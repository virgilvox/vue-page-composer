<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    subtitle?: string
    primaryLabel?: string
    secondaryLabel?: string
  }>(),
  {
    eyebrow: '',
    title: 'Headline goes here',
    subtitle: '',
    primaryLabel: 'Get started',
    secondaryLabel: 'Learn more',
  },
)
</script>

<template>
  <section class="demo-hero">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p v-if="subtitle" class="sub">{{ subtitle }}</p>
    <div class="cta">
      <a v-if="primaryLabel" class="btn primary">{{ primaryLabel }}</a>
      <a v-if="secondaryLabel" class="btn secondary">{{ secondaryLabel }}</a>
    </div>
  </section>
</template>

<style scoped>
.demo-hero {
  padding: 56px 48px 50px;
  text-align: center;
  background: radial-gradient(120% 120% at 50% 0, #fbf6ec, #fff 60%);
}
.eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #b07c1f;
  margin: 0 0 14px;
}
h1 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: 40px;
  line-height: 1.05;
  letter-spacing: -0.025em;
  max-width: 560px;
  margin: 0 auto 16px;
}
.sub {
  font-size: 15px;
  color: #6f685c;
  max-width: 430px;
  margin: 0 auto 24px;
  line-height: 1.5;
}
.cta {
  display: inline-flex;
  gap: 10px;
}
.btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 9px;
  font-weight: 600;
  font-size: 13.5px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.btn.primary {
  background: #23201a;
  color: #fff;
}
.btn.secondary {
  background: #fff;
  color: #23201a;
  border: 1px solid #e7e0d3;
}
</style>
