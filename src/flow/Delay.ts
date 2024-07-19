import { intervalToMs, type Interval } from './IntervalType.js';
import { sleep } from './Sleep.js';

/**
 * Delay options
 */
export type DelayOpts = Interval & {
  /**
   * Signal for cancelling delay
   */
  readonly signal?: AbortSignal;
  /**
   * When delay is applied. "before" is default.
   */
  readonly delay?: `before` | `after` | `both`;
};

/**
 * Pauses execution for interval after which the asynchronous `callback` is executed and awaited.
 * Must be called with `await` if you want the pause effect.
 *
 * @example Pause and wait for function
 * ```js
 * const result = await delay(async () => Math.random(), 1000);
 * console.log(result); // Prints out result after one second
 * ```
 *
 * If the `interval` option is a number its treated as milliseconds. {@link Interval} can also be used:
 * ```js
 * const result = await delay(async () => Math.random(), { mins: 1 });
 * ```
 *
 * If `await` is omitted, the function will run after the provided timeout, and code will continue to run.
 *
 * @example Schedule a function without waiting
 * ```js
 * await delay(async () => {
 *  console.log(Math.random())
 * }, 1000);
 * // Prints out a random number after 1 second.
 * ```
 *
 * {@link delay} and {@link sleep} are similar. `delay()` takes a parameter of what code to execute after the timeout, while `sleep()` just resolves after the timeout.
 *
 * Optionally takes an AbortSignal to cancel delay.
 * ```js
 * const ac = new AbortController();
 * // Super long wait
 * await delay(someFn, { signal: ac.signal, hours: 1 }}
 * ...
 * ac.abort(); // Cancels long delay
 * ```
 *
 * It also allows choice of when delay should happen.
 * If you want to be able to cancel or re-run a delayed function, consider using
 * {@link timeout} instead.
 *
 * @template V
 * @param callback What to run after interval
 * @param optsOrMillis Options for delay, or millisecond delay. By default delay is before `callback` is executed.
 * @return Returns result of `callback`.
 */
export const delay = async <V>(
  callback: () => Promise<V>,
  //eslint-disable-next-line functional/prefer-immutable-types
  optsOrMillis: DelayOpts | number
): Promise<V> => {
  const opts =
    typeof optsOrMillis === `number` ? { millis: optsOrMillis } : optsOrMillis;
  const delayWhen = opts.delay ?? `before`;
  if (delayWhen === `before` || delayWhen === `both`) {
    await sleep(opts);
  }
  const r = Promise.resolve(await callback());
  if (delayWhen === `after` || delayWhen === `both`) {
    await sleep(opts);
  }
  return r;
};

/**
 * Iterate over a source iterable with some delay between results.
 * Delay can be before, after or both before and after each result from the
 * source iterable.
 *
 * Since it's an async iterable, `for await ... of` is needed.
 *
 * ```js
 * const opts = { intervalMs: 1000, delay: 'before' };
 * const iterable = count(10);
 * for await (const i of delayIterable(iterable, opts)) {
 *  // Prints 0..9 with one second between
 * }
 * ```
 *
 * Use {@link delay} to return a result after some delay
 *
 * @param iter
 * @param opts
 */
// export async function* delayIterable<V>(
//   iter: AsyncIterable<V> | Iterable<V>,
//   //eslint-disable-next-line functional/prefer-immutable-types
//   opts: DelayOpts
// ) {
//   const intervalMs = intervalToMs(opts);
//   const delayWhen = opts.delay;
//   const signal = opts.signal;

//   for await (const v of iter) {
//     // Pre-delay
//     if (delayWhen === 'before' || delayWhen === 'both') {
//       await sleep({ millis: intervalMs, signal });
//       if (signal?.aborted) break;
//     }

//     // Yield value
//     yield v;

//     // Post-delay
//     if (delayWhen === 'after' || delayWhen === 'both') {
//       await sleep({ millis: intervalMs, signal });
//       if (signal?.aborted) break;
//     }
//   }
// }

/**
 * Async generator that loops via `requestAnimationFrame`.
 *
 * We can use `for await of` to run code:
 * ```js
 * const loop = delayAnimationLoop();
 * for await (const o of loop) {
 *  // Do something...
 *  // Warning: loops forever
 * }
 * // Warning: execution doesn't continue to this point
 * // unless there is a 'break' in loop.
 * ```
 * 
 * Or use the generator in manually:
 * ```js
 * // Loop forever
 * (async () => {
 *  const loop = delayAnimationLoop();
 *  while (true) {
 *    await loop.next();
 *
 *    // Do something...
 *    // Warning: loops forever
 *  }
 * })();
 * ```
 * 
 * Practically, these approaches are not so useful
 * because execution blocks until the loop finishes.
 * 
 * Instead, we might want to continually loop a bit
 * of code while other bits of code continue to run.
 * 
 * The below example shows how to do this.
 * 
 * ```js
 * setTimeout(async () => {
 *  for await (const _ of delayAnimationLoop()) {
 *    // Do soething at animation speed
 *  }
 * });
 * 
 * // Execution continues while loop also runs
 * ```
 *
 */
//eslint-disable-next-line func-style
async function* delayAnimationLoop() {
  let resolve: ((value?: undefined) => void) | undefined;
  let p = new Promise<undefined>((r) => (resolve = r));
  let timer = 0;
  const callback = () => {
    if (resolve) resolve();
    p = new Promise<undefined>((r) => (resolve = r));
  };

  try {
    while (true) {
      timer = globalThis.requestAnimationFrame(callback);
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const _ = await p;
      yield _;
    }
  } finally {
    if (resolve) resolve();
    globalThis.cancelAnimationFrame(timer);
  }
}

/**
 * Async generator that loops at a given interval.
 * Alternatives:
 * * {@link delay} to run a single function after a delay
 * * {@link sleep} pause execution
 * * {@link interval} iterate over an iterable with a given delay
 * * {@link continuously} to start/stop/adjust a constantly running loop
 *
 * @example Loop runs every second
 * ```
 * // Loop forever
 * (async () => {
 *  const loop = delayLoop(1000);
 *  // or: loop = delayLoop({ secs: 1 });
 *  while (true) {
 *    await loop.next();
 *
 *    // Do something...
 *    // Warning: loops forever
 *  }
 * })();
 * ```
 *
 * @example For Await loop every second
 * ```
 * const loop = delayLoop(1000);
 * // Or: const loop = delayLoop({ secs: 1 });
 * for await (const o of loop) {
 *  // Do something...
 *  // Warning: loops forever
 * }
 * ```
 * @param timeout Delay. If 0 is given, `requestAnimationFrame` is used over `setTimeout`.
 */
//eslint-disable-next-line func-style
export async function* delayLoop(timeout: Interval) {
  const timeoutMs = intervalToMs(timeout);
  if (typeof timeoutMs === `undefined`) throw new Error(`timeout is undefined`);
  if (timeoutMs < 0) throw new Error(`Timeout is less than zero`);
  if (timeoutMs === 0) return yield* delayAnimationLoop();

  let resolve: ((value?: undefined) => void) | undefined;
  let p = new Promise<undefined>((r) => (resolve = r));
  let timer: ReturnType<typeof globalThis.setTimeout> | undefined;
  const callback = () => {
    if (resolve) resolve();
    p = new Promise<undefined>((r) => (resolve = r));
  };

  try {
    while (true) {
      timer = globalThis.setTimeout(callback, timeoutMs);
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const _ = await p;
      yield _;
    }
  } finally {
    if (resolve) resolve();
    if (timer !== undefined) globalThis.clearTimeout(timer);
    timer = undefined;
  }
}
