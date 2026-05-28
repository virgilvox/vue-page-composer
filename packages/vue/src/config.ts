import type { Component } from 'vue'
import type { Config } from '@page-composer/core'

/**
 * Identity helper that pins the render type to a Vue component so the config
 * keeps full type inference at the call site. Plain objects in, typed config
 * out, no DSL.
 */
export function definePageConfig(config: Config<Component>): Config<Component> {
  return config
}
