import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// Point the workspace packages at their source so editing the library
// hot-reloads here, no rebuild needed.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue'],
    alias: {
      '@page-composer/vue': fileURLToPath(new URL('../packages/vue/src/index.ts', import.meta.url)),
      '@page-composer/core': fileURLToPath(
        new URL('../packages/core/src/index.ts', import.meta.url),
      ),
    },
  },
})
