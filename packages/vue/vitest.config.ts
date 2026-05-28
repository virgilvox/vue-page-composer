import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    name: 'vue',
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
  },
})
