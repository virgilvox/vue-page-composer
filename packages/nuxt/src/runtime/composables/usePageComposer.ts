import { defaultResolver, definePageConfig, type Resolver } from '@page-composer/vue'

export interface PageComposerHelpers {
  /** The default dot-path resolver for bound props. */
  resolver: Resolver
  /** Identity helper that keeps full type inference on a config literal. */
  definePageConfig: typeof definePageConfig
}

/**
 * Sensible defaults for wiring Page Composer into a Nuxt route. The host still
 * fetches the document with Nuxt's own data tools (useAsyncData, useFetch) so
 * bound content is present at first paint, then passes it to <ComposedPage>.
 */
export function usePageComposer(): PageComposerHelpers {
  return { resolver: defaultResolver, definePageConfig }
}
