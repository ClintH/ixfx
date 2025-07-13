import type { Interval } from '@ixfx/core';
import type { InitStreamOptions } from '../types.js';
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

/**
 * Transform options
 */
export type TransformOpts = InitStreamOptions & { traceInput: boolean, traceOutput: boolean };

export type ChunkOptions = InitStreamOptions & {
  /**
   * If _true_ (default) remaining results are yielded
   * if source closes. If _false_, only chunks that meet
   * `elapsed` or `quantity` are emitted.
   */
  returnRemainder: boolean
  /**
   * Amount of time to gather results for a chunk.
   * 'elapsed' and 'quantity' is ORed. Meaning a chunk will the minimum of
   * 'elapsed' and 'quantity'
   */
  elapsed: Interval
  /**
   * Number of items to gather for a chunk.
   * 'elapsed' and 'quantity' is ORed. Meaning a chunk will the minimum of
   * 'elapsed' and 'quantity'
   */
  quantity: number
}

export type DebounceOptions = InitStreamOptions & {
  /**
   * Minimum time between events. Default 50ms
   */
  elapsed: Interval
}

export type FilterPredicate<In> = (value: In) => boolean;
export type ThrottleOptions = InitStreamOptions & {
  elapsed: Interval
}

// export type AnnotationElapsed = {
//   elapsedMs: number
// }

export type SplitOptions = {
  quantity: number
}
export type FieldOptions<TSource, TValue> = InitStreamOptions & {
  /**
   * If `field` is missing on a value, it is query from this object instead.
   * If this also is missing, `fallbackFieldValue` is attempted.
   */
  fallbackObject: TSource
  /**
   * If `field` is missing on a value and `fallbackObject` (if specified), 
   * this value is used in its place.
   * If not set, no value is emitted when the field is missing.
   */
  fallbackFieldValue: TValue
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


export type OpAsAnnotation = {
  annotate: true
}

export type OpMathOptions = Partial<InitStreamOptions> & {
  annotate?: boolean
  /**
   * If _true_ (default) operations that return _undefined_ do not emit a value.
   * If _false_, _undefined_ is potentially emitted
   */
  skipUndefined?: boolean
  /**
   * If _true_ (default) operations only emit a value if it has changed.
   * In the case of `max()`, for example, a stream of '1, 2, 3, 2, 1' would emit '1, 2, 3'.
   * If _false_ was used, same input would emit '1, 2, 3, 3, 3'
   */
  skipIdentical?: boolean
}