/** Shared state for the outline tree, provided by Outline to its nodes. */
import type { ComputedRef, InjectionKey } from 'vue'

export interface OutlineController {
  isOpen: (id: string) => boolean
  toggle: (id: string) => void
  /** The single node that is keyboard-tabbable (roving tabindex). */
  tabbableId: ComputedRef<string | null>
}

export const outlineKey: InjectionKey<OutlineController> = Symbol('pc-outline')
