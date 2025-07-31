import type { IsEqual, Interval, IsEqualContext } from "@ixfx/core";
import type { CombineLatestOptions, InitLazyStreamOptions, Lazy, Reactive, UpstreamOptions } from '../types.js';


export type TriggerValue<TTriggerValue> = {
  value: TTriggerValue
}
/**
 * Options for the 'count' source.
 */
export type CountOptions = {
  /**
   * Determines when counting starts
   * @defaultValue 'initial'
   */
  lazy: Lazy,
  /**
   * Amount to increment by
   * @defaultValue 1
   */
  amount: number,
  /**
   * Where to begin counting
   * @defaultValue 0
   */
  offset: number,
  /**
   * How long to wait before incrementing.
   * @defaultValue 1 second
   */
  interval: Interval,
  /**
   * Abort signal to trigger the source to close.
   */
  signal: AbortSignal
}
/**
 * Function which returns a result. Or promised result.
 * 
 * `abort` value is a callback to exit out of looped execution.
 */
export type FunctionFunction<T> = ((abort: (reason: string) => void) => T) | ((abort: (reason: string) => void) => Promise<T>);


export type ArrayOptions = {
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

/**
 * Function which returns a result. Or promised result.
 * Takes a `value` as first parameter, and callback to signal an abort as the second.
 */
export type PingedFunctionFunction<T, TSource> = ((value: TSource, abort: (reason: string) => void) => T) | ((value: TSource, abort: (reason: string) => void) => Promise<T>);



/**
 * Trigger that calls a `fn`.
 * If `fn` returns _undefined_, it means the trigger is complete
 */
export type TriggerFunction<TTriggerValue> = {
  fn: () => TTriggerValue
}

export type TriggerGenerator<TTriggerValue> = {
  gen: IterableIterator<TTriggerValue>
}

/**
 * A trigger can be a value, a function or generator. Value triggers never complete.
 * 
 * A trigger function is considered complete if it returns undefined.
 * A trigger generator is considered complete if it returns done.
 * 
 */
export type Trigger<TTriggerValue> = TriggerValue<TTriggerValue> | TriggerFunction<TTriggerValue> | TriggerGenerator<TTriggerValue>;

export type TimeoutPingOptions = Interval & {
  /**
   * If abort signals, it will disable
   */
  abort?: AbortSignal
};

export type TimeoutValueOptions<TTriggerValue> = Trigger<TTriggerValue> & {
  /**
   * Whether to repeatedly trigger even if upstream source doesn't emit values.
   * When _false_ (default) it will emit a max of one value after a source value if `interval` is reached.
   * When _true_, it will continue emitting values at `interval`.
   * Default: false
   */
  repeat?: boolean

  /**
   * Interval before emitting trigger value
   * Default: 1s
   */
  interval: Interval
  /**
   * If _true_ (default) start the timeout
   * immediately, even before the first value.
   * If _false_, it won't timeout until the first 
   * upstream value happens.
   */
  immediate?: boolean
}

/**
 * Options when creating a reactive object.
 */
export type ObjectOptions<V extends Record<string, unknown>> = {
  /**
   * _false_ by default.
   * If _true_, inherited fields are included. This is necessary for event args, for example.
   */
  deepEntries: boolean
  /**
   * Uses JSON.stringify() by default.
   * Fn that returns _true_ if two values are equal, given a certain path.
   */
  eq: IsEqualContext<V>
}

export type ValueToPingOptions<TUpstream> = {
  /**
   * If set, this function acts as a threshold gate.
   * If the function returns _true_ the upstream value will trigger a ping
   * Otherwise the value won't trigger a ping.
   * 
   * By default all values trigger a ping.
   * @param value 
   * @returns 
   */
  gate: (value: TUpstream) => boolean
  /**
   * Laziness
   * * start: only begins on first subscriber. Keeps running even when there are no subscribers
   * * very: only begins on first subscriber. Stops looping if there are no subscribers
   * * never: begins calling function when initalised and doesn't stop until Reactive is disposed
   */
  lazy: Lazy,
  /**
    * If specified, signal is checked to prevent function execution.
    * Also used for aborting a looped fromFunction.
  */
  signal: AbortSignal
}

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

/**
 * Options when creating a reactive object.
 */
export type ArrayObjectOptions<V> = {

  /**
   * Uses JSON.stringify() by default.
   * Fn that returns _true_ if two values are equal, given a certain path.
   */
  eq: IsEqual<V>
}

export type FunctionOptions = Partial<InitLazyStreamOptions> & {
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
   * If _true_, no automatic calling of function will happen, it will only
   * be executed if the reactive gets a ping
   * When this is set, 'interval' is ignored. 'maximumRepeats' and 'predelay' still apply.
   * Default: _false_
  */
  manual: boolean
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

export type GeneratorOptions = {
  traceLifecycle: boolean
  /**
   * Wait between reading from generator
   * Default: 5ms
   */
  readInterval: Interval
  /**
   * Timeout when waiting for a value
   * Default: `{ mins: 5 }`
   */
  readTimeout: Interval
  /**
   * If _true_, only accesses the generator if there is a subscriber.
   * Default: true
   */
  lazy: Lazy,
  signal: AbortSignal
  /**
   * Behaviour when reactive stops, for example due to having no subscribers
   * * continue: iteration continues through array where it left off
   * * reset: iteration begins from start of array
   */
  whenStopped: `continue` | `reset`
}

export type EventSourceOptions = {
  /**
   * If true, behaves like Source.object where event
   * properties are compared and source only
   * emits where there is a change.
   * 
   * Default: _false_
   */
  diff?: boolean

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

export type EventSourceTriggerOptions = EventSourceOptions & {
  /**
   * If _true_ sends an initial trigger when starting
   * Default: false
   */
  fireInitial: boolean
}

export type EventPluckedFieldOptions<T> = {
  lazy?: Lazy
  initialValue: T
}

export type EventPluckedFieldOptions2<TDomSource, TValueDestination> = {
  lazy?: Lazy
  initialValue: TValueDestination
  domToValue: (value: TDomSource | undefined) => TValueDestination | undefined
  valueToDom: (value: TValueDestination) => TDomSource
}

export type DerivedFunction<TOutput> = (...args: unknown[]) => TOutput;
export type DerivedOptions<TResult, T> = {
  ignoreIdentical: boolean
  eq: (a: TResult, b: TResult) => boolean
} & CombineLatestOptions & UpstreamOptions<T>;
