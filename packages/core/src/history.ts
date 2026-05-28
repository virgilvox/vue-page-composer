/**
 * Undo and redo over document snapshots. The host owns when to commit, so
 * history is a small explicit stack rather than something woven into mutations.
 */

import type { ComposedDocument } from './types.js'

export interface HistoryOptions {
  /** Maximum number of states to retain. Oldest are dropped past this. */
  limit?: number
}

export class History {
  private past: ComposedDocument[] = []
  private future: ComposedDocument[] = []
  private current: ComposedDocument
  private readonly limit: number

  constructor(initial: ComposedDocument, options: HistoryOptions = {}) {
    this.current = initial
    this.limit = options.limit ?? 100
  }

  /** The document as it stands now. */
  get state(): ComposedDocument {
    return this.current
  }

  get canUndo(): boolean {
    return this.past.length > 0
  }

  get canRedo(): boolean {
    return this.future.length > 0
  }

  /** Commit a new state, clearing the redo stack. */
  push(next: ComposedDocument): void {
    if (next === this.current) return
    this.past.push(this.current)
    if (this.past.length > this.limit) this.past.shift()
    this.current = next
    this.future = []
  }

  /** Step back one state. Returns the restored state, or null at the bottom. */
  undo(): ComposedDocument | null {
    const previous = this.past.pop()
    if (previous === undefined) return null
    this.future.push(this.current)
    this.current = previous
    return this.current
  }

  /** Step forward one state. Returns the restored state, or null at the top. */
  redo(): ComposedDocument | null {
    const next = this.future.pop()
    if (next === undefined) return null
    this.past.push(this.current)
    this.current = next
    return this.current
  }

  /** Replace the current state without recording history. */
  reset(next: ComposedDocument): void {
    this.current = next
    this.past = []
    this.future = []
  }
}
