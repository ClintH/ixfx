import type { Reactive } from "./Types.js";

/**
 * A stream that caches its last value
 */
export type CacheStream<T> = {
  /**
   * Clears the last cached value
   * @returns 
   */
  resetCachedValue: () => void
  /**
   * Gets the cached value, if available
   * @returns 
   */
  last: () => T | undefined
}

/**
 * A {@link CacheStream} with an initial value
 */
export type CacheStreamInitial<T> = CacheStream<T> & {
  last: () => T
}

/**
 * Wraps an input stream to cache values, and provide an initial value
 * @param r Input stream
 * @param initialValue Initial value
 */
export function cache<TValue, RT extends Reactive<TValue>>(r: RT, initialValue: TValue): CacheStreamInitial<TValue> & RT;

/**
 * Wrapes an input stream to cache values, optionally providing an initial value
 * @param r 
 * @param initialValue 
 * @returns 
 */
export function cache<TValue, RT extends Reactive<TValue>>(r: RT, initialValue: TValue | undefined): CacheStream<TValue> & RT {
  let lastValue: TValue | undefined = initialValue;
  r.onValue(value => {
    lastValue = value;
  });
  return {
    ...r,
    last() {
      return lastValue
    },
    resetCachedValue() {
      lastValue = undefined;
    }
  }
}