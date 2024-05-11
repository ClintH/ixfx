import type { Primitive } from 'src/KeyValue.js';
import type { ChangeRecord } from '../Compare.js';
import type { Interval } from '../flow/IntervalType.js';
import * as Immutable from '../Immutable.js';
import type { AnnotationElapsed, BatchOptions, DebounceOptions, FieldOptions, FilterPredicate, SplitOptions, SyncOptions, SwitcherOptions, TransformOpts, ThrottleOptions } from './ops/Types.js';
import type { TimeoutTriggerOptions } from './sources/Types.js';

export type CombineLatestOptions = {
  /**
   * If _true_, disposes all the merged sources when the merged reactive closes.
   * Default: _true_.
   */
  disposeSources: boolean
  /**
   * How to handle when a source ends.
   * * 'allow': continue combined stream, last value for done stream will kept
   * * 'break': stop combined stream
   * 
   * Default: 'break'
   */
  onSourceDone: `allow` | `break`
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

  onDispose: (reason: string) => void
}


/**
 * Wrapped Reactive for object-oriented access
 */
export type Wrapped<TIn> = {
  source: Reactive<TIn>,
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
  * Accumulate a batch of values, emitted as an array
  * @param options 
  * @returns 
  */
  batch: (options: Partial<BatchOptions>) => Wrapped<Array<TIn>>

  debounce: (options: Partial<DebounceOptions>) => Wrapped<TIn>

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

  combineLatestToArray: <const T extends ReadonlyArray<ReactiveOrSource<any>>>(sources: T, options: Partial<CombineLatestOptions>) => Wrapped<RxValueTypes<T>>
  combineLatestToObject: <const T extends Record<string, ReactiveOrSource<any>>>(sources: T, options: { name: string } & Partial<CombineLatestOptions>) => Wrapped<RxValueTypeObject<T>>

  /**
   * Converts one source stream into two, with values being emitted by both
   * @param options 
   * @returns 
   */
  split: (options: Partial<SplitOptions>) => Array<Wrapped<TIn>>
  /**
 * Emits values when this stream and any additional streams produce a value. The resulting stream is
 * thus an array of values, each source at a given index.
 * Waits to output a value until each stream has produced a value. Thus, the pace is determined by
 * the slowest stream.
 * @returns 
 */
  syncToArray: <const T extends ReadonlyArray<ReactiveOrSource<any>>>(reactiveSources: T, options?: Partial<SyncOptions>) => Wrapped<[ TIn, ...RxValueTypes<T> ]>

  syncToObject: <const T extends Record<string, ReactiveOrSource<any>>>(reactiveSources: T, options?: { name?: string } & Partial<SyncOptions>) => Wrapped<RxValueTypeObject<T>>

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
  timeoutTrigger: <TTriggerValue>(options: TimeoutTriggerOptions<TTriggerValue>) => Wrapped<TIn | TTriggerValue>
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


export type ReactiveOrSource<V> = Wrapped<V> | Reactive<V> | IterableIterator<V> | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V> | Array<V> | (() => V)

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

export type ReactiveDisposable<V> = Reactive<V> & {
  dispose(reason: string): void
  isDisposed(): boolean
}

export type ReactiveArray<V> = ReactiveWritable<Array<V>> & {
  push(value: V): void
  deleteAt(index: number): void
  deleteWhere(filter: (value: V) => boolean): number
  setAt(index: number, value: V): void
  insertAt(index: number, value: V): void
  onArray(handler: (changes: Passed<Array<ChangeRecord<number>>>) => void): () => void
}

export type ReactiveDiff<V> = ReactiveDisposable<V> & ReactiveWritable<V> & {
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

export type ReactiveStream<V> = Reactive<V> & ReactiveDisposable<V> & ReactiveWritable<V> & {
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

export type PipeSet<In, Out> = [
  Reactive<In>,
  ...Array<Reactive<any> & ReactiveWritable<any>>,
  ReactiveWritable<Out> & Reactive<any>
]

export type InitStreamOptions = {
  /**
   * Optional label to associate with this stream. Useful for debugging.
   */
  debugLabel: string
  onFirstSubscribe: () => void
  onNoSubscribers: () => void
  onDispose: (reason: string) => void
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
 * WithValue stream options
 */
export type WithValueOptions<V> = Partial<InitStreamOptions> & {
  /**
   * Initial value
   */
  initial: V,
  /**
   * Laziness
   */
  lazy?: Lazy
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

