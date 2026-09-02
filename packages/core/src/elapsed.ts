// import { intervalToMs, type Interval } from './IntervalType.js';
// import { elapsedMillisecondsAbsolute, relative } from './Timer.js';

export type Since = { (): number; _type: `since` | `once` | `infinity` | `interval` };

export type ElapsedOptions = {
  skip: number;
};

/**
 * Returns elapsed time since the initial call.
 *
 * ```js
 * // Record start
 * const elapsed = elapsedSince();
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
 *  sinceClicked: elapsedInfinity()
 * };
 *
 * state.sinceClicked(); // Returns a giant value
 *
 * // Later, when click happens:
 * document.addEventListener('click', () => {
 *  state.sinceClicked = elapsedSince();
 * });
 *
 * ```
 *
 * The `skip` option allows you to skip the first N calls to the returned function before starting the timer. For example, if you want to skip the first 2 calls:
 * ```js
 * const elapsed = elapsedSince({ skip: 2 });
 *
 * elapsed(); // First call, timer not started yet. Get NaN
 * elapsed(); // Second call, timer still not started. Get NaN
 * elapsed(); // Third call, returns elapsed time since last `elapsed()` call.
 * ```
 *
 * See also:
 * {@link elapsedOnce} if you want to measure a single period, and stop it.
 * {@link elapsedInterval} time _between_ calls
 *
 * @param options Options to control the elapsed timer. Currently only supports `skip` which will skip the first N calls to the returned function before starting the timer.
 * @returns Since
 */
export function elapsedSince(options: Partial<ElapsedOptions> = {}): Since {
  let skip = options.skip ?? 0;

  // If there's no skipping, record from now
  let start = skip === 0 ? performance.now() : Number.NaN;

  const fn: Since = (): number => {
    if (skip > 0 && Number.isNaN(start)) {
      skip--;
      if (skip === 0) {
        start = performance.now() - skip;
      } else {
        return Number.NaN;
      }
    }
    return performance.now() - start;
  };
  fn._type = `since`;
  return fn;
}

/**
 * Returns the interval between the start and each subsequent call.
 *
 * ```js
 * const interval = elapsedInterval();
 * interval(); // Time from elapsedInterval()
 * interval(); // Time since last interval() call
 * ```
 *
 * See also:
 * {@link elapsedSince}: time since first call
 * {@link elapsedOnce}: time between two events
 * @returns Since
 */
export function elapsedInterval(): Since {
  let start = performance.now();
  const fn: Since = (): number => {
    const now = performance.now();
    const x = now - start;
    start = now;
    return x;
  };
  fn._type = `interval`;
  return fn;
}
/**
 * Returns elapsed time since initial call, however
 * unlike {@link elapsedSince}, timer stops when first invoked.
 *
 * ```js
 * const elapsed = elapsedOnce();
 * // ...do stuff
 * elapsed(); // Yields time since elapsedOnce() was called
 * // ...do more stuff
 * elapsed(); // Is still the same number as above
 * ```
 *
 * See also:
 * {@link elapsedSince}: elapsed time
 * {@link elapsedInterval}: time _between_ calls
 * @returns Since
 */
export function elapsedOnce(): Since {
  const start = Date.now();
  let stoppedAt = 0;
  const fn: Since = (): number => {
    if (stoppedAt === 0) {
      stoppedAt = Date.now() - start;
    }
    return stoppedAt;
  };
  fn._type = `once`;
  return fn;
}
/**
 * Returns a function that reports an 'infinite' elapsed time.
 * this can be useful as an initialiser for `elapsedSince` et al.
 *
 * ```js
 * // Init clicked to be an infinite time
 * let clicked = elapsedInfinity();
 *
 * document.addEventListener('click', () => {
 *  // Now that click has happened, we can assign it properly
 *  clicked = elapsedSince();
 * });
 * ```
 *
 * Use {@link isInfiniteSince} to check if a function is of type `infinity`:
 * ```js
 * let clicked = elapsedInfinity();
 *
 * document.addEventListener('click', () => {
 *  if (isInfiniteSince(clicked)) {
 *   console.log(`First time clicked!`);
 *  }
 *  clicked = elapsedSince();
 * });
 * ```
 *
 * @returns A function that returns `Number.POSITIVE_INFINITY` when called.
 */
export function elapsedInfinity(): Since {
  const fn: Since = (): number => {
    return Number.POSITIVE_INFINITY;
  };
  fn._type = `infinity`;
  return fn;
}

/**
 * Returns _true_ if `fn` appears to be the {@link Since} type, and is of type `infinity`.
 * Returns _false_ if `fn` is not a {@link Since} type, or is of a different type.
 * @param fn
 * @returns
 */
export function isInfiniteSince(fn: Since): boolean {
  if (typeof fn !== `function`)
    return false;
  if (isSince(fn)) {
    return fn._type === `infinity`;
  }
  return false;
}

/**
 * Returns _true_ if `fn` appears to be the {@link Since} type.
 * @param fn
 * @returns Boolean indicating if `fn` is a {@link Since} type.
 */
export function isSince(fn: unknown): fn is Since {
  if (typeof fn !== `function`)
    return false;
  if (typeof (fn as any)._type !== `string`)
    return false;
  return [`since`, `once`, `infinity`, `interval`].includes((fn as any)._type);
}
