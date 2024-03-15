import type { ChangeRecord } from '../Compare.js';
import type { Interval } from '../flow/IntervalType.js';
import * as Immutable from '../Immutable.js';

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export const symbol = Symbol(`Rx`);

export type SignalKinds = `done`;
export type Passed<V> = {
  value: V | undefined
  signal?: SignalKinds
  context?: string
}

export type GeneratorOptions = {
  /**
   * By default (true) only accesses the generator if there is a subscriber.
   */
  lazy: boolean
}

export type PassedSignal = Passed<any> & {
  value: undefined
  signal: `done`
  context: string
}

export type EventOptions<V> = {
  process: (args?: Event | undefined) => V
  lazy?: boolean
  /**
   * If true, log messages are emitted
   * when event handlers are added/removed
   */
  debugLifecycle?: boolean
  /**
   * If true, log messages are emitted
   * when the source event fires
   */
  debugFiring?: boolean
}

export type PassedValue<V> = Passed<V> & {
  value: V
}


export type UpstreamOptions<In> = {
  lazy: boolean
  /**
   * If _true_ (default), we dispose the underlying stream if the upstream closes. This happens after onStop() is called.
   */
  disposeIfSourceDone: boolean
  onValue: (v: In) => void
  /**
   * Called just before we subscribe to source
   * @returns 
   */
  onStart: () => void
  /**
   * Called after we unsubscribe from source
   * @returns
   */
  onStop: () => void
}


/**
 * Wrapped Reactive for object-oriented access
 */
export type Wrapped<TIn> = {
  source: Reactive<TIn>,
  /**
   * Copies values from source into an array, throwing
   * an error if expected number of items is not reached
   * @param options 
   * @returns 
   */
  toArrayOrThrow: (options: Partial<ToArrayOptions<TIn>>) => Promise<Array<TIn>>
  /**
   * Copies values from source into an array.
   * @param options 
   * @returns 
   */
  toArray: (options: Partial<ToArrayOptions<TIn>>) => Promise<Array<TIn | undefined>>
  /**
   * Accumulate a batch of values, emitted as an array
   * @param options 
   * @returns 
   */
  batch: (options: Partial<BatchOptions>) => Wrapped<Array<TIn>>
  /**
   * Annotate values with a timestamp of elapsed time
   * (uses `annotate`)
   * @returns 
   */
  annotateElapsed: () => Wrapped<TIn & AnnotationElapsed>
  /**
   * Annotate values with some additional field(s)
   * @param transformer 
   * @returns 
   */
  annotate: <TAnnotation>(transformer: (value: TIn) => TIn & TAnnotation) => Wrapped<TIn & TAnnotation>
  /**
   * Pluck and emit a single field from values
   * @param fieldName 
   * @param options 
   * @returns 
   */
  field: <TFieldType>(fieldName: keyof TIn, options: Partial<FieldOptions<TFieldType>>) => Wrapped<TFieldType>
  /**
   * Throws away values that don't match `predicate`
   * @param predicate 
   * @param options 
   * @returns 
   */
  filter: (predicate: FilterPredicate<TIn>, options: Partial<InitStreamOptions>) => Wrapped<TIn>
  /**
   * Converts one source stream into two, with values being emitted by both
   * @param options 
   * @returns 
   */
  split: (options: Partial<SplitOptions>) => Array<Wrapped<TIn>>
  /**
   * Transforms all values
   * @param transformer 
   * @param options 
   * @returns 
   */
  transform: <TOut>(transformer: (value: TIn) => TOut, options?: Partial<TransformOpts>) => Wrapped<TOut>
  /**
   * Only allow values through if a minimum of time has elapsed. Throws away values.
   * Ie. converts a fast stream into a slower one.
   * @param options 
   * @returns 
   */
  throttle: (options: Partial<ThrottleOptions>) => Wrapped<TIn>
  debounce: (options: Partial<DebounceOptions>) => Wrapped<TIn>

  /**
   * Emits values when this stream and any additional streams produce a value.
   * Outputted values captures the last value from each stream.
   * @returns 
   */
  synchronise: (...additionalSources: Array<ReactiveOrSource<TIn> | Wrapped<TIn>>) => Wrapped<Array<TIn | undefined>>
  /**
   * Creates new streams for each case, sending values to the stream if they match the filter predicate
   * @param cases 
   * @param options 
   * @returns 
   */
  switcher: <TRec extends Record<string, FilterPredicate<TIn>>, TLabel extends keyof TRec>(cases: TRec, options: Partial<SwitcherOptions>) => Record<TLabel, Wrapped<TIn>>
  /**
   * Creates new streams for each case
   * @param labels 
   * @returns 
   */
  splitLabelled: <K extends keyof TIn>(...labels: Array<K>) => Record<K, Wrapped<TIn>>
  /**
   * Listen for values
   * @param callback 
   * @returns 
   */
  value: (callback: (value: TIn) => void) => void
}

export type ToArrayOptions<V> = {
  /**
   * Maximim time to wait for `limit` to be reached. 10s by default.
   */
  maximumWait: Interval
  /**
   * Number of items to read
   */
  limit: number
  /**
   * Behaviour if threshold is not reached.
   * partial: return partial results
   * throw: throw an error
   * fill: fill remaining array slots with `fillValue`
   */
  underThreshold: `partial` | `throw` | `fill`
  /**
   * Value to fill empty slots with if `underThreshold = 'fill'`.
   */
  fillValue: V
}

export type FromArrayOptions = {
  /**
   * Interval between each item being read. 5ms by default.
   */
  intervalMs: Interval
  /**
   * If _true_, only starts after first subscriber. _False_ by default.
   */
  lazy: boolean
  /**
   * Governs behaviour if all subscribers are removed AND lazy=true. By default continues
   * iteration.
   * 
   * * pause: stop at last array index
   * * reset: go back to 0
   * * empty: continue, despite there being no listeners (default)
   */
  idle: `` | `pause` | `reset`
}

/**
 * Switcher options.
 * 
 * match (default: 'first')
 * * 'first': Outputs to first case where predicate is _true_
 * * 'all': Outputs to all cases where predicate is _true_
 */
export type SwitcherOptions = {
  match: `first` | `all`
}

export type ReactiveOrSource<V> = Reactive<V> | IterableIterator<V> | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V> | Array<V>

export type BindUpdateOpts<V> = {
  initial: (v: V, el: HTMLElement) => void,
  binds: Record<string, DomBindValueTarget & {
    transform?: (value: any) => string
  }>
}

export type Reactive<V> = {
  /**
   * Subscribes to a reactive. Receives
   * data as well as signals. Use `value` if you
   * just care about values.
   * 
   * Return result unsubscribes.
   * 
   * ```js
   * const unsub = someReactive.on(msg => {
   *    // Do something with msg.value
   * });
   * 
   * unsub(); // Unsubscribe
   * ```
   * @param handler 
   */
  on(handler: (value: Passed<V>) => void): () => void
  value(handler: (value: V) => void): () => void
}

export type ReactiveNonInitial<V> = Reactive<V> & {
  last(): V | undefined
}

export type ReactiveWritable<V> = {
  set(value: V): void
}

export type ReactiveInitial<V> = Reactive<V> & {
  last(): V
}

export type ReactiveFinite = {
  isDone(): boolean
}

export type ReactiveDisposable = {
  dispose(reason: string): void
  isDisposed(): boolean
}

export type ReactiveArray<V> = ReactiveDisposable & ReactiveWritable<Array<V>> & {
  push(value: V): void
  deleteAt(index: number): void
  deleteWhere(filter: (value: V) => boolean): number
  setAt(index: number, value: V): void
  insertAt(index: number, value: V): void
  onArray(handler: (changes: Passed<Array<ChangeRecord<number>>>) => void): () => void
}

export type ReactiveDiff<V> = ReactiveDisposable & ReactiveWritable<V> & {
  /**
   * Diff information
   * @param handler 
   */
  onDiff(handler: (changes: Passed<Array<Immutable.Change<any>>>) => void): () => void
  /**
   * Updates the reactive with some partial key-value pairs.
   * Keys omitted are left the same as the current value.
   * @param changedPart 
   */
  update(changedPart: Record<string, any>): void
  /**
   * Updates a particular field by its path
   * @param field 
   * @param value 
   */
  updateField(field: string, value: any): void
}

export type ReactiveStream<V> = Reactive<V> & ReactiveDisposable & ReactiveWritable<V> & {
  through(message: Passed<V>): void
  /**
   * Removes all the subscribers from this stream.
   */
  reset(): void
  /**
   * Dispatches a signal
   * @param signal 
   * @param context 
   */
  signal(signal: SignalKinds, context?: string): void
}


/**
 * Options when creating a reactive object.
 */
export type ObjectOptions<V> = {
  /**
   * _false_ by default.
   * If _true_, inherited fields are included. This is necessary for event args, for example.
   */
  deepEntries: boolean
  /**
   * Uses JSON.stringify() by default.
   * Fn that returns _true_ if two values are equal, given a certain path.
   */
  eq: Immutable.IsEqualContext<V>
}

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

export type DomBindUnresolvedSource<V> = DomBindTargetNode & DomBindSourceValue<V> & DomBindValueTarget;
export type DomBindResolvedSource<V> = DomBindTargetNodeResolved & DomBindSourceValue<V> & DomBindValueTarget;

export type DomBindSourceValue<V> = {
  /**
   * Field from source value to pluck and use.
   * This will also be the value passed to the transform
   */
  sourceField?: keyof V
  transform?: (input: V) => string
  transformValue?: (input: any) => string
}


export type FilterPredicate<In> = (value: In) => boolean;
export type PipeSet<In, Out> = [
  Reactive<In>,
  ...Array<Reactive<any> & ReactiveWritable<any>>,
  ReactiveWritable<Out> & Reactive<any>
]

export type InitStreamOptions = {
  onFirstSubscribe: () => void
  onNoSubscribers: () => void
}

export type ThrottleOptions = InitStreamOptions & {
  elapsed: Interval
}

export type AnnotationElapsed = {
  elapsedMs: number
}

export type SplitOptions = {
  quantity: number
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

export type TransformOpts = InitStreamOptions;

export type BatchOptions = InitStreamOptions & {
  /**
   * If _true_ (default) remaining results are yielded
   * if source closes. If _false_, only 'complete' batches are yielded.
   */
  returnRemainder: boolean
  elapsed: Interval
  quantity: number
}

export type FieldOptions<V> = InitStreamOptions & {

  /**
   * If `field` is missing on a value, this value is used in its place.
   * If not set, the value is skipped.
   */
  missingFieldDefault: V
};


export type SingleFromArrayOptions<V> = {
  /**
   * Function to select a single value from array
   * @param value 
   * @returns 
   */
  predicate: (value: V) => boolean
  /**
   * `default`: leave array in same order (default option)
   * `random`: shuffles array before further processing
   * function: function that sorts values
   */
  order: `default` | `random` | ((a: V, b: V) => number)
  /**
   * Selects an index from array. 0 being first, 1 being second.
   * Reverse indexing also works: -1 being last, -2 being second last...
   * 
   * If index exceeds length of array, _undefined_ is returned
   */
  at: number
}

export type ResolveOptions = {
  /**
   * How many times to return value or call function.
   * If _infinite_ is set to true, this value is ignored
   */
  loops: number
  /**
   * If _true_ loops forever
   */
  infinite: boolean
  /**
   * Delay before value
   */
  interval: Interval
  /**
   * If _true_, resolution only starts after first subscriber. Looping, if active,
   * stops if there are no subscribers.
   * 
   * _False_ by default.
   * 
   */
  lazy: boolean
}

export type ReactiveOpInit<TIn, TOut, TOpts> = (options: Partial<TOpts>) => ReactiveOp<TIn, TOut>
export type ReactiveOp<TIn, TOut> = (source: ReactiveOrSource<TIn>) => Reactive<TOut>

export type ReactiveOpLinks<In, Out> = [
  ReactiveOrSource<In>,
  ...Array<ReactiveOp<any, any>>,
  ReactiveOp<any, Out>
]

export type DebounceOptions = InitStreamOptions & {
  /**
   * Minimum time between events. Default 50ms
   */
  elapsed: Interval
}