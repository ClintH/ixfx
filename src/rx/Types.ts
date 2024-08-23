import type { Primitive } from '../PrimitiveTypes.js';
import type { Interval } from '../flow/IntervalType.js';
import * as Immutable from '../data/Pathed.js';
import type { ChunkOptions, DebounceOptions, FieldOptions, FilterPredicate, SplitOptions, SyncOptions, SwitcherOptions, TransformOpts, ThrottleOptions, OpMathOptions } from './ops/Types.js';
import type { TimeoutPingOptions, TimeoutValueOptions } from './sources/Types.js';
import type { SetHtmlOptions } from './sinks/Dom.js';
import type { Processors } from '../data/Process.js';
import type { TallyOptions } from './ops/Math.js';
import type { ChangeRecord } from '../data/Compare.js';
import type { RecursivePartial } from 'src/TsUtil.js';


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
  /**
   * If _true_ (default), emits a value when initialised.
   */
  emitInitial: boolean
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
  debugLabel: string
  onDispose: (reason: string) => void
}

export type UpstreamInitialOptions<In> = UpstreamOptions<In> & {
  initialValue: In
}

//export type Processor = <TIn, TOptions>(source: ReactiveOrSource<TIn>) => (options: TOptions) => () => void;

/**
 * Wrapped Reactive for object-oriented access
 */
export type Wrapped<TIn> = {
  enacts: {
    setHtmlText: (options: SetHtmlOptions) => () => void
  }
  source: Reactive<TIn>,

  /**
   * Annotate values with output from the `annotation` function.
   * Returned values will be in the form `{ value:TIn, annotation:TAnnotation }`
   * @param transformer 
   * @returns 
   */
  annotate: <TAnnotation>(transformer: (value: TIn) => TAnnotation) => Wrapped<{ value: TIn, annotation: TAnnotation }>
  annotateWithOp: <TOut>(op: ReactiveOp<TIn, TOut>) => Wrapped<{ value: TIn, annotation: TOut }>
  /**
  * Accumulate a chunk of values, emitted as an array
  * @param options 
  * @returns 
  */
  chunk: (options: Partial<ChunkOptions>) => Wrapped<Array<TIn>>

  debounce: (options: Partial<DebounceOptions>) => Wrapped<TIn>


  /**
   * Pluck and emit a single field from values
   * @param fieldName 
   * @param options 
   * @returns 
   */
  field: <TSource, TFieldType>(fieldName: keyof TIn, options: Partial<FieldOptions<TSource, TFieldType>>) => Wrapped<TFieldType>
  /**
   * Throws away values that don't match `predicate`
   * @param predicate 
   * @param options 
   * @returns 
   */
  filter: (predicate: FilterPredicate<TIn>, options: Partial<InitStreamOptions>) => Wrapped<TIn>

  combineLatestToArray: <const T extends ReadonlyArray<ReactiveOrSource<any>>>(sources: T, options: Partial<CombineLatestOptions>) => Wrapped<RxValueTypes<T>>
  combineLatestToObject: <const T extends Record<string, ReactiveOrSource<any>>>(sources: T, options: { name: string } & Partial<CombineLatestOptions>) => Wrapped<RxValueTypeObject<T>>

  min: (options?: Partial<OpMathOptions>) => Wrapped<number>
  max: (options?: Partial<OpMathOptions>) => Wrapped<number>
  average: (options?: Partial<OpMathOptions>) => Wrapped<number>
  sum: (options?: Partial<OpMathOptions>) => Wrapped<number>
  tally: (options?: Partial<TallyOptions>) => Wrapped<number>

  /**
   * Converts one source stream into two, with values being emitted by both
   * @param options 
   * @returns 
   */
  split: (options?: Partial<SplitOptions>) => Array<Wrapped<TIn>>
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
   * Taps the stream, passing values to one or more 'processor' functions.
   * This processing essentially happens in parallel, not affecting the main stream.
   * 
   * ```js
   * // Stream of pointermove events with {x:0,y:0} as default
   * const move = Rx.From.event(document.body, `pointermove`, {x:0,y:0});
   * // Wrap it for fluent access
   * const ptr = Rx.wrap(move)
   *  .tapProcess(
   *    // Create a string representation
   *    v => `${v.x},${v.y}`
   *    // Set to DOM
   *    v => {
   *      document.getElementById(`coords`).innerText = v;
   *    }
   *   )
   *  .onValue(value => {
   *    // 'value' will be original PointerEvent, since .tapProcess happened in parallel,
   *    // not affecting stream
   *  });
   * ```
   * @param processors One-five processing functions
   * @returns 
   */
  tapProcess: <T2, T3, T4, T5, T6>(...processors: Processors<TIn, T2, T3, T4, T5, T6>) => Wrapped<TIn>
  tapStream: (divergedStream: ReactiveWritable<TIn>) => Wrapped<TIn>
  tapOps: <TOut>(source: ReactiveOrSource<TIn>, ...ops: Array<ReactiveOp<TIn, TOut>>) => Wrapped<TIn>
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
  /**
   * Emits a value if `source` does not emit a value after `interval`
   * has elapsed. This can be useful to reset a reactive to some
   * 'zero' state if nothing is going on.
   * 
   * If `source` emits faster than the `interval`, it won't get triggered.
   * 
   * Default for 'timeout': 1000s.
   * 
   * ```js
   * // Emit 'hello' if 'source' doesn't emit a value after 1 minute
   * const r = Rx.timeoutValue(source, { value: 'hello', interval: { mins: 1 } });
   * ```
   * 
   * Can also emit results from a function or generator
   * ```js
   * // Emits a random number if 'source' doesn't emit a value after 500ms
   * const r = Rx.timeoutValue(source, { fn: Math.random, interval: 500 });
   * ```
   * 
   * If `immediate` option is _true_ (default), the timer starts from stream initialisation.
   * Otherwise it won't start until it observes the first value from `source`.
   * @param options 
   */
  timeoutValue: <TTriggerValue>(options: TimeoutValueOptions<TTriggerValue>) => Wrapped<TIn | TTriggerValue>
  /**
   * 'Pings' reactive (if it supports it) if a value is not received within a given interval.
   * Behaviour can be stopped using an abort signal.
   * @param options 
   * @returns 
   */
  timeoutPing: (options: TimeoutPingOptions) => Wrapped<TIn>

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
  onValue: (callback: (value: TIn) => void) => void

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
  debugLabel?: string
  onStart: () => void
  onStop: () => void
};

export type InitLazyStreamInitedOptions<T> = InitLazyStreamOptions & {
  initialValue: T
}

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
   * data as well as signals. Use `onValue` if you
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
  /**
   * Subscribes to a reactive's values.
   * Returns a function that unsubscribes.
   * @param handler
   */
  onValue(handler: (value: V) => void): Unsubscriber

  dispose(reason: string): void
  isDisposed(): boolean
  set?(value: V): void
}

/**
 * A reactive that can be 'pinged' to produce a value.
 * 
 * Use {@link isPingable} to check if a reactive is pingable.
 * 
 * Pingable reactives are returned from
 * * interpolate
 * * computeWithPrevious
 * * valueToPing
 */
export type ReactivePingable<V> = Reactive<V> & {
  ping(): void
}

export type Unsubscriber = () => void;

export type ReactiveNonInitial<V> = Reactive<V> & {
  last(): V | undefined
}

export type ReactiveWritable<TIn, TOut = TIn> = Reactive<TOut> & {
  set(value: TIn): void
}

export type ReactiveInitial<V> = Reactive<V> & {
  last(): V
}

export type ReactiveFinite = {
  isDone(): boolean
}

export type ReactiveArray<V> = ReactiveWritable<Array<V>> & {
  push(value: V): void
  deleteAt(index: number): void
  deleteWhere(filter: (value: V) => boolean): number
  setAt(index: number, value: V): void
  insertAt(index: number, value: V): void
  onArray(handler: (changes: Passed<Array<ChangeRecord<number>>>) => void): () => void
}
export type ObjectFieldHandler = { value: any, fieldName: string, pattern: string };

export type ReactiveDiff<V> = Reactive<V> & ReactiveWritable<V> & {
  /**
   * Notifies when the value of `fieldName` is changed.
   * 
   * Use the returned function to unsubscribe.
   * @param fieldName 
   * @param handler 
   */
  onField(fieldName: string, handler: (result: ObjectFieldHandler) => void): () => void
  /**
   * Notifies of which field(s) were changed.
   * If you just care about the whole, changed data use the `value` event.
   * 
   * Use the returned function to unsubscribe.
   * @param changes 
   */
  onDiff(changes: (changes: Array<Immutable.PathDataChange<any>>) => void): () => void
  /**
   * Updates the reactive with some partial key-value pairs.
   * Keys omitted are left the same as the current value.
   * @param changedPart 
   * @returns Returns new value
   */
  update(changedPart: RecursivePartial<V>): V
  /**
   * Updates a particular field by its path
   * @param field 
   * @param value 
   */
  updateField(field: string, value: any): void
}

export type ReactiveStream<V> = Reactive<V> & ReactiveWritable<V> & {
  //through_(message: Passed<V>): void
  /**
   * Removes all the subscribers from this stream.
   */
  removeAllSubscribers(): void
  /**
   * Dispatches a signal
   * @param signal 
   * @param context 
   */
  signal(signal: SignalKinds, context?: string): void
}

export type ReactiveInitialStream<V> = ReactiveStream<V> & ReactiveInitial<V>;

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

// export type PipeSet<In, Out> = [
//   Reactive<In>,
//   ...Array<Reactive<any> & ReactiveWritable<any>>,
//   ReactiveWritable<Out> & Reactive<any>
// ]
export type PipeSet<In, Out> = [
  Reactive<In>,
  ...Array<Reactive<any> & ReactiveWritable<any>>
]

export type InitStreamOptions = {
  /**
   * Optional label to associate with this stream. Useful for debugging.
   */
  debugLabel: string
  /**
   * Called when there is a subscriber after there were no subscribers.
   * Useful for 'startup' types of things that we want to run only when someone is actually listening.
   * 
   * During the lifeycle of a stream, this could be called multiple times. Eg if all subscribers are removed
   * next time someone subscribes it will get called again.
   * @returns 
   */
  onFirstSubscribe: () => void
  /**
   * Called when there are no longer any subscribers. Useful for shutting down
   * activities now that no-one is listening.
   * 
   * During the lifecycle of a stream, this could be called multiple times.
   * @returns
   */
  onNoSubscribers: () => void
  /**
   * Called whenever the stream disposes. Useful for cleaning up.
   * @param reason 
   * @returns 
   */
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
  { [ K in keyof T ]: T[ K ] extends Reactive<infer V> ? V :
    T[ K ] extends Wrapped<infer V> ? V :
    T[ K ] extends Generator<infer V> ? V :
    T[ K ] extends AsyncGenerator<infer V> ? V :
    T[ K ] extends IterableIterator<infer V> ? V :
    T[ K ] extends AsyncIterableIterator<infer V> ? V :
    T[ K ] extends Array<infer V> ? V :
    never };

export type RxValueTypeObjectOrUndefined<T extends Record<string, ReactiveOrSource<any>>> =
  { [ K in keyof T ]: T[ K ] extends Reactive<infer V> ? V | undefined :
    T[ K ] extends Wrapped<infer V> ? V | undefined :
    T[ K ] extends Generator<infer V> ? V | undefined :
    T[ K ] extends AsyncGenerator<infer V> ? V | undefined :
    T[ K ] extends IterableIterator<infer V> ? V | undefined :
    T[ K ] extends AsyncIterableIterator<infer V> ? V | undefined :
    T[ K ] extends Array<infer V> ? V | undefined :
    never };

export type RxValueTypeRx<T extends Record<string, ReactiveOrSource<any>>> =
  { [ K in keyof T ]: T[ K ] extends Reactive<infer V> ? Reactive<V> :
    T[ K ] extends Wrapped<infer V> ? Reactive<V> :
    T[ K ] extends Generator<infer V> ? Reactive<V> :
    T[ K ] extends AsyncGenerator<infer V> ? Reactive<V> :
    T[ K ] extends IterableIterator<infer V> ? Reactive<V> :
    T[ K ] extends AsyncIterableIterator<infer V> ? Reactive<V> :
    T[ K ] extends Array<infer V> ? Reactive<V> :
    never };

export type PrimitiveValueTypeObject<T extends Record<string, Primitive>> =
  { [ K in keyof T ]:
    T[ K ] extends number ? number | undefined :
    T[ K ] extends string ? string | undefined :
    T[ K ] extends boolean ? boolean | undefined :
    T[ K ] extends bigint ? bigint | undefined :
    never };


