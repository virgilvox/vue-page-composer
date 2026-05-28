/**
 * Short, collision-checked id generation. Ids carry a role prefix so a glance
 * at the document tells you what a node is for.
 */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

function randomChar(): string {
  // Math.random is fine here: ids are local and collision-checked, not secret.
  const index = Math.floor(Math.random() * ALPHABET.length)
  return ALPHABET[index] as string
}

function randomSuffix(length: number): string {
  let out = ''
  for (let i = 0; i < length; i += 1) out += randomChar()
  return out
}

/**
 * Generate an id with the given prefix that does not collide with any key in
 * `taken`. `taken` is anything keyed by id (typically a node map).
 */
export function createId(prefix: string, taken: Record<string, unknown> = {}, length = 4): string {
  let id = `${prefix}${randomSuffix(length)}`
  let attempts = 0
  while (id in taken) {
    attempts += 1
    id = `${prefix}${randomSuffix(length + Math.floor(attempts / 8))}`
  }
  return id
}

/** Node id prefix. */
export const NODE_PREFIX = 'n_'
/** Child node id prefix, used for components placed inside zones. */
export const CHILD_PREFIX = 'c_'
