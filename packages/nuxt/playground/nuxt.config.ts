import { defineNuxtConfig } from 'nuxt/config'
import PageComposerModule from '../src/module'

// A minimal app that loads the module from source, used to verify the module
// integrates in a real Nuxt context (nuxi prepare runs its setup) and to dev
// against it locally (nuxi dev).
export default defineNuxtConfig({
  modules: [PageComposerModule],
  pageComposer: { editor: true },
  compatibilityDate: '2025-01-01',
})
