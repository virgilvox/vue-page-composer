/**
 * @page-composer/core
 *
 * Framework-neutral document model, mutations, history, serialization, and the
 * resolver interface. No Vue, no DOM. The Vue and Nuxt packages build on top.
 */

export type {
  Binding,
  DataSourceRef,
  LiteralPrimitive,
  LiteralObject,
  LiteralArray,
  Literal,
  PropValue,
  PageNode,
  ComposedDocument,
  FieldType,
  FieldCommon,
  FieldOption,
  TextField,
  TextareaField,
  NumberField,
  BooleanField,
  SelectField,
  SegmentField,
  ColorField,
  ObjectField,
  ArrayField,
  FieldDef,
  ComponentConfig,
  CategoryConfig,
  Config,
} from './types.js'

export { createId, NODE_PREFIX, CHILD_PREFIX } from './ids.js'

export { deepClone } from './clone.js'

export {
  ROOT_TYPE,
  DEFAULT_ROOT_ZONE,
  createDocument,
  getNode,
  getZones,
  getZoneChildren,
  findParent,
  collectSubtree,
  walk,
  isDescendant,
  cloneSubtree,
} from './document.js'
export type { NodeLocation } from './document.js'

export {
  insertNode,
  moveNode,
  removeNode,
  duplicateNode,
  setProp,
  removeProp,
  setBinding,
  clearBinding,
} from './mutations.js'
export type { DropTarget, NewNode } from './mutations.js'

export { History } from './history.js'
export type { HistoryOptions } from './history.js'

export {
  isBinding,
  isDataSourceRef,
  getPath,
  defaultResolver,
  resolveValue,
  resolveProps,
} from './resolver.js'
export type { Resolver, ResolverContext } from './resolver.js'

export {
  validateDocument,
  assertDocument,
  serialize,
  deserialize,
  normalize,
  DocumentValidationError,
} from './serialize.js'
export type { ValidationError } from './serialize.js'
