<script setup lang="ts">
/**
 * A custom inspector field, registered with PageComposer through
 * `field-components`. It follows the v-model contract: take `modelValue`, emit
 * `update:modelValue`. This is the plugin path for field types the library
 * does not ship.
 */
import type { CustomField } from 'vue-page-composer'

defineProps<{ modelValue?: string; field?: CustomField }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const choices = ['zap', 'globe', 'shield']
const glyphs: Record<string, string> = {
  zap: 'M13 2 3 14h9l-1 8 10-12h-9z',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20',
  shield: 'M12 2l9 5v6c0 5-3.5 8-9 9-5.5-1-9-4-9-9V7z',
}
</script>

<template>
  <div class="icon-field">
    <button
      v-for="name in choices"
      :key="name"
      type="button"
      class="icon-choice"
      :class="{ on: modelValue === name }"
      :aria-pressed="modelValue === name"
      @click="emit('update:modelValue', name)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path :d="glyphs[name]" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.icon-field {
  display: flex;
  gap: 6px;
}
.icon-choice {
  width: 38px;
  height: 34px;
  border: 1px solid var(--pc-line, rgba(237, 230, 219, 0.08));
  border-radius: 7px;
  background: var(--pc-ink-900, #15120d);
  color: var(--pc-fg-dim, #a89e8e);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.icon-choice svg {
  width: 17px;
  height: 17px;
}
.icon-choice.on {
  border-color: var(--pc-accent-soft, rgba(224, 160, 73, 0.4));
  color: var(--pc-accent, #e0a049);
  background: var(--pc-accent-soft, rgba(224, 160, 73, 0.14));
}
</style>
