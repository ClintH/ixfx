import type { Reactive } from "@ixfxfun/rx"
import type { EventSourceOptions } from "@ixfxfun/rx/from"

export type DomBindValueTarget = {
  /**
   * If _true_ `innerHTML` is set (a shortcut for elField:`innerHTML`)
   */
  htmlContent?: boolean
  /**
   * If _true_, 'textContent' is set (a shortcut for elField:'textContext')
   */
  textContent?: boolean
  /**
   * If set, this DOM element field is set. Eg 'textContent'
   */
  elField?: string
  /**
   * If set, this DOM attribute is set, Eg 'width'
   */
  attribName?: string
  /**
   * If set, this CSS variable is set, Eg 'hue' (sets '--hue')
   */
  cssVariable?: string
  /**
   * If set, this CSS property is set, Eg 'background-color'
   */
  cssProperty?: string
}

export type ElementBind = {
  /**
   * Tag name for this binding.
   * Overrides `defaultTag`
   */
  tagName?: string
  /**
   * If _true_, sub-paths are appended to element, rather than `container`
   */
  nestChildren?: boolean
  transform?: (value: any) => string
}
export type ElementsOptions = {
  container: HTMLElement | string
  defaultTag: string,
  binds: Record<string, DomBindValueTarget & ElementBind>
}

export type DomBindTargetNode = {
  query?: string
  element?: HTMLElement
}

export type DomBindTargetNodeResolved = {
  element: HTMLElement
}

export type DomBindUnresolvedSource<TSource, TDestination> = DomBindTargetNode & DomBindSourceValue<TSource, TDestination> & DomBindValueTarget;
export type DomBindResolvedSource<TSource, TDestination> = DomBindTargetNodeResolved & DomBindSourceValue<TSource, TDestination> & DomBindValueTarget;

export type DomBindSourceValue<TSource, TDestination> = {
  twoway?: boolean
  /**
   * Field from source value to pluck and use.
   * This will also be the value passed to the transform
   */
  sourceField?: keyof TSource
  transform?: (input: TSource) => TDestination
  transformValue?: (input: any) => TDestination
}

export type DomBindInputOptions<TSource, TDestination> = DomBindSourceValue<TSource, TDestination> & {
  transformFromInput: (input: TDestination) => TSource
}
export type BindUpdateOpts<V> = {
  initial: (v: V, el: HTMLElement) => void,
  binds: Record<string, DomBindValueTarget & {
    transform?: (value: any) => string
  }>
}

export type DomCreateOptions = {
  tagName: string
  parentEl: string | HTMLElement
}

export type PipeDomBinding = {
  /**
   * Remove binding and optionally delete element(s) (false by default)
   */
  remove(deleteElements: boolean): void
}


export type DomValueOptions = EventSourceOptions & {
  /**
   * If true, the current value will be emitted even though it wasn't
   * triggered by an event.
   * Default: false
   */
  emitInitialValue: boolean
  attributeName: string
  fieldName: string
  /**
   * Respond to when value has changed or when value is changing
   * Default: `changed`
   */
  when: `changed` | `changing`
  fallbackValue: string
  upstreamSource?: Reactive<unknown>
  upstreamFilter?: (value: unknown) => string
}

export type DomFormOptions<T extends Record<string, unknown>> = EventSourceOptions & {
  //initialValue: T | undefined,
  /**
   * If true, the current value will be emitted even though it wasn't
   * triggered by an event.
   * Default: false
   */
  emitInitialValue: boolean
  /**
   * Respond to when value has changed or when value is changing
   * Default: `changed`
   */
  when: `changed` | `changing`
  upstreamSource?: Reactive<T>
  upstreamFilter?: (name: string, value: unknown) => string
}

export type DomNumberInputValueOptions = DomValueOptions & {
  /**
   * If true, sets up INPUT element to operate with relative values
   */
  relative?: boolean
  /**
   * If true, when setting up, sets max to be on left side
   */
  inverted?: boolean
  upstreamSource?: Reactive<number>
}

