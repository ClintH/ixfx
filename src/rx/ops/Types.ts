import type { Interval } from '../../flow/IntervalType.js';
import type { InitStreamOptions } from '../Types.js';
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
export type TransformOpts = InitStreamOptions;

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

export type AnnotationElapsed = {
  elapsedMs: number
}

export type SplitOptions = {
  quantity: number
}
export type FieldOptions<V> = InitStreamOptions & {
  /**
   * If `field` is missing on a value, this value is used in its place.
   * If not set, no value is emitted when the field is missing.
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