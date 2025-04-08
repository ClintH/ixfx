//import { intervalToMs, type Interval } from './IntervalType.js';
//import { elapsedMillisecondsAbsolute, relative } from './Timer.js';

export type Since = () => number;

/**
 * Returns elapsed time since the initial call.
 * ```js
 * // Record start
 * const elapsed = Stopwatch.since();
 *
 * // Get elapsed time in millis
 * // since Elapsed.since()
 * elapsed(); // Yields number
 * ```
 *
 * If you want to initialise a stopwatch, but not yet start it, consider:
 * ```js
 * // Init
 * let state = {
 *  clicked: Stopwatch.infinity()
 * };
 *
 * state.click(); // Returns a giant value
 *
 * // Later, when click happens:
 * state = { click: Stopwatch.since() }
 * ```
 *
 * See also:
 * * {@link once} if you want to measure a single period, and stop it.
 * * {@link interval} time _between_ calls
 * @returns
 */
export const since = (): Since => {
  const start = performance.now();
  return (): number => {
    return performance.now() - start;
  };
};

/**
 * Returns the interval between the start and each subsequent call.
 * 
 * ```js
 * const interval = Stopwatch.interval();
 * interval(); // Time from Stopwatch.interval()
 * interval(); // Time since last interval() call
 * ```
 * 
 * See also:
 * * {@link since}: time since first call
 * * {@link once}: time between two events
 * @returns 
 */
export const interval = (): Since => {
  let start = performance.now();
  return (): number => {
    const now = performance.now();
    const x = now - start;
    start = now;
    return x;
  }
}
/**
 * Returns elapsed time since initial call, however
 * unlike {@link since}, timer stops when first invoked.
 *
 * ```js
 * const elapsed = Stopwatch.once();
 * // ...do stuff
 * elapsed(); // Yields time since Stopwatch.once() was called
 * // ...do more stuff
 * elapsed(); // Is still the same number as above
 * ```
 * 
 * See also:
 * * {@link since}: elapsed time
 * * {@link interval}: time _between_ calls
 * @returns
 */
export const once = (): Since => {
  const start = Date.now();
  //eslint-disable-next-line functional/no-let
  let stoppedAt = 0;
  return (): number => {
    if (stoppedAt === 0) {
      stoppedAt = Date.now() - start;
    }
    return stoppedAt;
  };
};
/**
 * Returns a function that reports an 'infinite' elapsed time.
 * this can be useful as an initialiser for `Stopwatch.since` et al.
 *
 * ```js
 * // Init clicked to be an infinite time
 * let clicked = Stopwatch.infinity();
 *
 * document.addEventListener('click', () => {
 *  // Now that click has happened, we can assign it properly
 *  clicked = Stopwatch.since();
 * });
 * ```
 * @returns
 */
export const infinity = (): Since => {
  return (): number => {
    return Number.POSITIVE_INFINITY;
  };
};

