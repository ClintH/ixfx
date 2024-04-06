import type { Primitive } from 'src/KeyValue.js';
import type { ChangeRecord } from '../Compare.js';
import type { Interval } from '../flow/IntervalType.js';
import * as Immutable from '../Immutable.js';


export type MergeOptions = {
  /**
   * How to handle when a source ends.
   * * 'allow': continue mergeAsArrayStream, last value for done stream will kept
   * * 'break': stop mergeAsArrayStream
   * 
   * Default: 'break'
   */
  onSourceDone: `allow` | `break`
}

export type SyncOptions = {

  /**
   * How to handle when a source completes.
   * * 'allow' means we continue synchronising with remaining alive sources. Use 'finalValue' option to control what data is returned for completed sources
   * * 'break' means we stop the stream, because synchronisation across all sources is no longer possible.
   * 
   * Default: 'break'.
   */
  onSourceDone: `allow` | `break`,
  /**
   * Maximum time to wait for synchronisation to happen.
   * If interval is exceeded, stream closes.
   * Default: 2s
   */
  maximumWait: Interval
  /**
   * If we continue synchronisation when a source is done (via `onSourceDone:'allow'`),
   * what source should be returned for a completed source?
   * * 'undefined': _undefined_
   * * 'last': the last received value, or _undefined_
   * 
   * Default: 'undefined'
   */
  finalValue: `undefined` | `last`
}


export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export const symbol = Symbol(`Rx`);

export type SignalKinds = `done` | `warn`;
export type Passed<V> = {
  value: V | undefined
  signal?: SignalKinds
  context?: string
}

export type PassedSignal = Passed<any> & {
  value: undefined
  signal: SignalKinds
  context: string
}

export type EventOptions<V> = {
  transform: (args?: Event | undefined) => V
  lazy?: Lazy
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
  lazy: Lazy
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

  onDispose: () => void
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
   * Emits values when this stream and any additional streams produce a value. The resulting stream is
   * thus an array of values, each source at a given index.
   * Waits to output a value until each stream has produced a value. Thus, the pace is determined by
   * the slowest stream.
   * @returns 
   */
  synchronise: <const T extends ReadonlyArray<ReactiveOrSource<any>>>(reactiveSources: T, options?: Partial<SyncOptions>) => Wrapped<[ TIn, ...RxValueTypes<T> ]>

  //synchronise: (...additionalSources: Array<ReactiveOrSource<TIn> | Wrapped<TIn>>) => Wrapped<Array<TIn | undefined>>
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

/**
 * Laziness
 * * start: only begins on first subscriber. Keeps running even when there are no subscribers
 * * very: only begins on first subscriber. Stops looping if there are no subscribers
 * * never: begins calling function when initalised and doesn't stop until Reactive is disposed
 */
export type Lazy = `initial` | `never` | `very`
export type InitLazyStreamOptions = Partial<InitStreamOptions> & {
  lazy: Lazy
  onStart: () => void
  onStop: () => void
};

export type CountOptions = { lazy: Lazy, amount: number, offset: number, interval: Interval, signal: AbortSignal }
export type PingedFunctionOptions = {
  /**
   * If _true_, stream closes if function throws an error.
   * If _false_, errors are emitted as signals, but stream is not closed.
   * Default: _true_
   */
  closeOnError: boolean
  /**
   * Laziness
   * * start: only begins on first subscriber. Keeps running even when there are no subscribers
   * * very: only begins on first subscriber. Stops looping if there are no subscribers
   * * never: begins calling function when initalised and doesn't stop until Reactive is disposed
   */
  lazy: Lazy,
  /**
 * If specified, a time before invoking function.
 * If `repeat` is used, this is in addition to `interval` time.
 */
  predelay: Interval,
  /***
* If specified, signal is checked to prevent function execution.
* Also used for aborting a looped fromFunction.
*/
  signal: AbortSignal
}

export type FromFunctionOptions = {
  /**
   * If _true_, stream closes if function throws an error.
   * If _false_, errors are emitted as signals, but stream is not closed.
   * Default: _true_
   */
  closeOnError: boolean
  /**
   * Laziness
   * * start: only begins on first subscriber. Keeps running even when there are no subscribers
   * * very: only begins on first subscriber. Stops looping if there are no subscribers
   * * never: begins calling function when initalised and doesn't stop until Reactive is disposed
   */
  lazy: Lazy
  /**
   * If specified, sets an upper limit of how many times we loop
   * (if this is also enabled)
   */
  maximumRepeats: number
  /**
   * If specified, function is called repeatedly with this delay
   */
  interval: Interval
  /**
   * If specified, a time before invoking function.
   * If `repeat` is used, this is in addition to `interval` time.
   */
  predelay: Interval,
  /***
   * If specified, signal is checked to prevent function execution.
   * Also used for aborting a looped fromFunction.
   */
  signal: AbortSignal
}


export type ReadFromArrayOptions = {
  /**
   * Interval between each item being read. Default: 5ms.
   */
  interval: Interval

  lazy: Lazy
  /**
   * Behaviour when reactive stops, for example due to having no subscribers
   * * continue: iteration continues through array where it left off
   * * reset: iteration begins from start of array
   */
  whenStopped: `continue` | `reset`
  debugLifecycle: boolean
  signal: AbortSignal
}

export type FromGeneratorOptions = {
  /**
   * Minimum time interval between reads from generator
   * Default: 5ms
   */
  interval: Interval
  /**
   * If _true_, only accesses the generator if there is a subscriber.
   * Default: true
   */
  lazy: Lazy,
  signal: AbortSignal

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

export type ReactiveOrSource<V> = Wrapped<V> | Reactive<V> | IterableIterator<V> | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V> | Array<V>

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
  on(handler: (value: Passed<V>) => void): Unsubscriber
  value(handler: (value: V) => void): Unsubscriber
}

export type Unsubscriber = () => void;

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
  onDispose: () => void
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

/**
 * Transform options
 */
export type TransformOpts = InitStreamOptions;
/**
 * Cached stream options
 */
export type CacheOpts<V> = InitStreamOptions & {
  /**
   * Initial value
   */
  initialValue: V,
  /**
   * Laziness
   */
  lazy: Lazy
}

export type BatchOptions = InitStreamOptions & {
  /**
   * If _true_ (default) remaining results are yielded
   * if source closes. If _false_, only batches that meet
   * `elapsed` or `quantity` are emitted.
   */
  returnRemainder: boolean
  /**
   * Amount of time to gather results for a batch.
   * 'elapsed' and 'quantity' is ORed. Meaning a batch will the minimum of
   * 'elapsed' and 'quantity'
   */
  elapsed: Interval
  /**
   * Number of items to gather for a batch.
   * 'elapsed' and 'quantity' is ORed. Meaning a batch will the minimum of
   * 'elapsed' and 'quantity'
   */
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

  lazy: Lazy
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

export type RxValueTypes<T extends ReadonlyArray<ReactiveOrSource<any>>> =
  { [ K in keyof T ]: T[ K ] extends Reactive<infer V> ? V | undefined :
    T[ K ] extends Wrapped<infer V> ? V | undefined :
    T[ K ] extends Generator<infer V> ? V | undefined :
    T[ K ] extends AsyncGenerator<infer V> ? V | undefined :
    T[ K ] extends IterableIterator<infer V> ? V | undefined :
    T[ K ] extends AsyncIterableIterator<infer V> ? V | undefined :
    T[ K ] extends Array<infer V> ? V | undefined :
    never };

export type RxValueTypeObject<T extends Record<string, ReactiveOrSource<any>>> =
  { [ K in keyof T ]: T[ K ] extends Reactive<infer V> ? V | undefined :
    T[ K ] extends Wrapped<infer V> ? V | undefined :
    T[ K ] extends Generator<infer V> ? V | undefined :
    T[ K ] extends AsyncGenerator<infer V> ? V | undefined :
    T[ K ] extends IterableIterator<infer V> ? V | undefined :
    T[ K ] extends AsyncIterableIterator<infer V> ? V | undefined :
    T[ K ] extends Array<infer V> ? V | undefined :
    never };


export type PrimitiveValueTypeObject<T extends Record<string, Primitive>> =
  { [ K in keyof T ]:
    T[ K ] extends number ? number | undefined :
    T[ K ] extends string ? string | undefined :
    T[ K ] extends boolean ? boolean | undefined :
    T[ K ] extends bigint ? bigint | undefined :
    never };

export type RxPrimitiveValueTypeObject<T extends Record<string, Primitive | ReactiveOrSource<any>>> =
  { [ K in keyof T ]:
    T[ K ] extends number ? number | undefined :
    T[ K ] extends string ? string | undefined :
    T[ K ] extends boolean ? boolean | undefined :
    T[ K ] extends bigint ? bigint | undefined :
    T[ K ] extends Reactive<infer V> ? V | undefined :
    T[ K ] extends Wrapped<infer V> ? V | undefined :
    T[ K ] extends Generator<infer V> ? V | undefined :
    T[ K ] extends AsyncGenerator<infer V> ? V | undefined :
    T[ K ] extends IterableIterator<infer V> ? V | undefined :
    T[ K ] extends AsyncIterableIterator<infer V> ? V | undefined :
    T[ K ] extends Array<infer V> ? V | undefined :
    never };