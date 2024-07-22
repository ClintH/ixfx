import { throwNumberTest } from '../util/GuardNumbers.js';
import { type Interval, intervalToMs } from './IntervalType.js';

export type SleepOpts<V> = Interval & Partial<{
  readonly signal: AbortSignal;
  readonly value: V;
}>;

if (typeof window === `undefined` || !(`requestAnimationFrame` in window)) {
  // eslint-disable-next-line unicorn/no-lonely-if
  if (typeof window === `undefined`) {
    // @ts-expect-error
    globalThis.requestAnimationFrame = (callback) => {
      setTimeout(callback, 1);
    }
  }
}

/**
 * Returns after timeout period.
 *
 * @example In an async function
 * ```js
 * console.log(`Hello`);
 * await sleep(1000);
 * console.log(`There`); // Prints one second after
 * ```
 *
 * @example As a promise
 * ```js
 * console.log(`Hello`);
 * sleep({ millis: 1000 })
 *  .then(() => console.log(`There`)); // Prints one second after
 * ```
 *
 * If a timeout of 0 is given, `requestAnimationFrame` is used instead of `setTimeout`.
 *
 * {@link delay} and {@link sleep} are similar. `delay()` takes a parameter of what code to execute after the timeout, while `sleep()` just resolves after the timeout.
 *
 * A value can be provided, which is returned on awaking:
 * ```js
 * const v = await sleep({ seconds: 1, value: `hello`);
 * // v = `hello`
 * ```
 *
 * Provide an AbortSignal to cancel the sleep and throwing an exception
 * so code after the sleep doesn't happen.
 *
 * ```js
 * const ac = new AbortController();
 * setTimeout(() => { ac.abort(); }, 1000); // Abort after 1s
 *
 * // Sleep for 1min
 * await sleep({ minutes: 1, signal: ac.signal });
 * console.log(`Awake`); // This line doesn't get called because an exception is thrown when aborting
 * ```
 * @param optsOrMillis Milliseconds to sleep, or options
 * @return
 */
export const sleep = <V>(
  optsOrMillis: SleepOpts<V>
): Promise<V | undefined> => {
  const timeoutMs = intervalToMs(optsOrMillis, 1);
  const signal = optsOrMillis.signal;
  const value = optsOrMillis.value;
  throwNumberTest(timeoutMs, `positive`, `timeoutMs`);

  // eslint-disable-next-line unicorn/prefer-ternary
  if (timeoutMs === 0) {
    return new Promise<V | undefined>((resolve) =>
      requestAnimationFrame((_) => {
        resolve(value);
      })
    );
  } else {
    return new Promise<V | undefined>((resolve, reject) => {
      const onAbortSignal = () => {
        clearTimeout(t);
        if (signal) {
          signal.removeEventListener(`abort`, onAbortSignal);
          reject(new Error(signal.reason));
        } else {
          reject(new Error(`Cancelled`));
        }
      }

      if (signal) {
        signal.addEventListener(`abort`, onAbortSignal);
      }
      const t = setTimeout(() => {
        signal?.removeEventListener(`abort`, onAbortSignal);
        if (signal?.aborted) {
          reject(new Error(signal.reason));
          return;
        }
        resolve(value);
      }, timeoutMs);
    });
  }
};

/**
 * Delays until `predicate` returns true.
 * Can be useful for synchronising with other async activities.
 * ```js
 * // Delay until 'count' reaches 5
 * await sleepWhile(() => count >= 5, 100);
 * ```
 * @param predicate 
 * @param checkInterval 
 */
export const sleepWhile = async (predicate: () => boolean, checkInterval: Interval = 100) => {
  while (predicate()) {
    await sleep(checkInterval);
  }
}