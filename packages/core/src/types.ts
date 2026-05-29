/**
 * Document model and config types. Framework-neutral on purpose: nothing here
 * imports Vue. The document format outlives any one renderer.
 */

/** A prop value bound to the host data layer, resolved at render time. */
export interface Binding {
  $bind: string
}

/** A named data source the host resolves into the render context. */
export interface DataSourceRef {
  $source: string
}

/** A plain JSON value. Object and array literals may nest bindings. */
export type LiteralPrimitive = string | number | boolean | null
export interface LiteralObject {
  [key: string]: PropValue
}
export type LiteralArray = PropValue[]
export type Literal = LiteralPrimitive | LiteralObject | LiteralArray

/** A prop is either a literal value or a binding expression. */
export type PropValue = Literal | Binding

/** One placed component instance in the flat node map. */
export interface PageNode {
  /** Which registered component this node renders. */
  type: string
  /** Inputs to the component. Each value is a literal or a binding. */
  props?: Record<string, PropValue>
  /** Named, ordered lists of child node ids. */
  zones?: Record<string, string[]>
  /**
   * Conditional visibility. A resolver expression evaluated against the data
   * context; the node and its subtree render only when it is truthy. In the
   * editor the node always renders so it stays editable, marked as conditional.
   */
  when?: string
}

/** The portable composition document. Flat map of nodes keyed by id. */
export interface ComposedDocument {
  version: '1'
  /** Id of the root node, which holds the top-level zones. */
  root: string
  nodes: Record<string, PageNode>
  /** Optional named data sources for the resolver. */
  data?: Record<string, DataSourceRef>
}

/** Field types the inspector knows how to render. */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'segment'
  | 'color'
  | 'object'
  | 'array'
  | 'custom'

export interface FieldCommon {
  label?: string
  /** Show a binding toggle so the value can read from host data. */
  bindable?: boolean
  description?: string
}

/** An option for select and segment fields. */
export type FieldOption = string | { label: string; value: string | number }

export interface TextField extends FieldCommon {
  type: 'text'
  default?: string
  placeholder?: string
}

export interface TextareaField extends FieldCommon {
  type: 'textarea'
  default?: string
  placeholder?: string
  rows?: number
}

export interface NumberField extends FieldCommon {
  type: 'number'
  default?: number
  unit?: string
  min?: number
  max?: number
  step?: number
}

export interface BooleanField extends FieldCommon {
  type: 'boolean'
  default?: boolean
}

export interface SelectField extends FieldCommon {
  type: 'select'
  options: FieldOption[]
  default?: string | number
}

export interface SegmentField extends FieldCommon {
  type: 'segment'
  options: FieldOption[]
  default?: string | number
}

export interface ColorField extends FieldCommon {
  type: 'color'
  default?: string
}

export interface ObjectField extends FieldCommon {
  type: 'object'
  fields: Record<string, FieldDef>
}

export interface ArrayField extends FieldCommon {
  type: 'array'
  /** Field definition for each item in the list. */
  of: FieldDef
  default?: Literal[]
}

/**
 * A field rendered by a host-registered component. The `component` name keys
 * into the `fieldComponents` map passed to PageComposer. Extra config travels
 * in `props`, which the custom component reads off the field definition.
 */
export interface CustomField extends FieldCommon {
  type: 'custom'
  component: string
  default?: Literal
  props?: Record<string, unknown>
}

export type FieldDef =
  | TextField
  | TextareaField
  | NumberField
  | BooleanField
  | SelectField
  | SegmentField
  | ColorField
  | ObjectField
  | ArrayField
  | CustomField

/**
 * Registration for one placeable component. `TRender` is the host render
 * reference (a Vue component in the Vue package). Core leaves it abstract so
 * it carries no framework dependency.
 */
export interface ComponentConfig<TRender = unknown> {
  label: string
  render: TRender
  category?: string
  icon?: string
  /** Names of droppable child areas this component exposes as slots. */
  zones?: string[]
  /** Per-zone allow-list of component types. Absent means any type. */
  accepts?: Record<string, string[]>
  fields?: Record<string, FieldDef>
  defaultProps?: Record<string, PropValue>
  /**
   * Marks this component as a repeater. At render time the children of `zone`
   * are treated as a template and rendered once per item in the list resolved
   * from the `source` prop, with each clone's data scope set to that item. In
   * the editor the template renders once so it stays editable.
   */
  repeat?: RepeatConfig
}

export interface RepeatConfig {
  /** The zone whose children form the per-item template. */
  zone: string
  /** The prop key whose resolved value is the list to repeat over. */
  source: string
}

export interface CategoryConfig {
  title: string
  order?: number
}

/** The contract between the host and Page Composer. */
export interface Config<TRender = unknown> {
  components: Record<string, ComponentConfig<TRender>>
  categories?: Record<string, CategoryConfig>
  /** Zones exposed by the document root. Defaults to a single `main` zone. */
  rootZones?: string[]
}
