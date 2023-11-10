import { round } from '../numbers/Round.js';
import { intervalToMs, type Interval } from './IntervalType.js';
import { msElapsedTimer, relativeTimer } from './Timer.js';

export type Since = () => number;

/**
 * Returns elapsed time since initial call.
 * ```js
 * // Record start
 * const elapsed = Elapsed.since();
 *
 * // Get elapsed time in millis
 * elapsed(); // Yields number
 * ```
 *
 * If you want to initialise a elapsed timer, but not yet start it, consider:
 * ```js
 * // Init
 * let state = {
 *  clicked: Elapsed.infinity()
 * };
 *
 * state.click(); // Returns a giant value
 *
 * // Later, when click happens:
 * state = { click: Elapsed.since() }
 * ```
 *
 * Use {@link once} if you want to measure a single period, and stop it.
 * @returns
 */
export const since = (): Since => {
  const start = performance.now();
  return (): number => {
    return performance.now() - start;
  };
};

/**
 * Returns elapsed time since initial call, however
 * timer stops when first invoked.
 *
 * ```js
 * const elapsed = Elapsed.once();
 * // ...do stuff
 * elapsed(); // Yields time since Elapsed.once() was called
 * // ...do more stuff
 * elapsed(); // Is still the same number as above
 * ```
 *
 * Use {@link since} to not have this stopping behaviour.
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
 * this can be useful as an initialiser for `elapsedSince`.
 *
 * ```js
 * // Init clicked to be an infinite time
 * let clicked = Elapsed.infinity();
 *
 * document.addEventListener('click', () => {
 *  // Now that click has happened, we can assign it properly
 *  clicked = Elapsed.since();
 * });
 * ```
 * @returns
 */
export const infinity = (): Since => {
  return (): number => {
    return Number.POSITIVE_INFINITY;
  };
};

/**
 * Returns a function that returns the percentage of timer completion.
 * Starts timing immediately.
 *
 * ```js
 * const timer = Elapsed.progress(1000);
 * timer(); // Returns 0..1
 * ```
 *
 * Note that timer can exceed 1 (100%). To cap it:
 * ```js
 * Elapsed.progress(1000, { clampValue: true });
 * ```
 *
 * Takes an {@link Interval} for more expressive time:
 * ```js
 * const timer = Elapsed.progress({ mins: 4 });
 * ```
 * See also {@link hasElapsedMs}.
 * @param totalMs
 * @returns
 */
export function progress(
  duration: Interval,
  opts: { readonly clampValue?: boolean, readonly wrapValue?: boolean } = {}
): () => number {
  const totalMs = intervalToMs(duration);
  if (!totalMs) throw new Error(`duration invalid`);
  const timerOpts = {
    ...opts,
    timer: msElapsedTimer(),
  };
  const t = relativeTimer(totalMs, timerOpts);
  return () => t.elapsed;
}

export const toString = (millisOrFunction: number | Since | Interval, rounding = 2): string => {
  //eslint-disable-next-line functional/no-let
  let interval: number | undefined = {} = 0;
  if (typeof millisOrFunction === `function`) {
    const intervalResult = millisOrFunction();
    return toString(intervalResult);
  } else if (typeof millisOrFunction === `number`) {
    interval = millisOrFunction;
  } else if (typeof millisOrFunction === `object`) {
    interval = intervalToMs(interval);
  }

  //eslint-disable-next-line functional/no-let
  let ms = intervalToMs(interval);
  if (typeof ms === `undefined`) return `(undefined)`;
  if (ms < 1000) return `${ round(rounding, ms) }ms`;
  ms /= 1000;
  if (ms < 120) return `${ ms.toFixed(1) }secs`;
  ms /= 60;
  if (ms < 60) return `${ ms.toFixed(2) }mins`;
  ms /= 60;
  return `${ ms.toFixed(2) }hrs`;
};
