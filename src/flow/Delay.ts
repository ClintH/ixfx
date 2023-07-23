import { sleep } from './Sleep.js';

export type DelayOpts = {
  readonly intervalMs: number;
  readonly signal?: AbortSignal;
  readonly delay: 'before' | 'after' | 'both';
};
/**
 * Pauses execution for `timeoutMs` after which the asynchronous `callback` is executed and awaited.
 * Use {@link delayIterable} to step through an iterable with delays
 *
 * @example Pause and wait for function
 * ```js
 * const result = await delay(async () => Math.random(), 1000);
 * console.log(result); // Prints out result after one second
 * ```
 *
 * If `await` is omitted, the function will run after the provided timeout, and code will continue to run.
 *
 * @example Schedule a function without waiting
 * ```js
 * delay(async () => {
 *  console.log(Math.random())
 * }, 1000);
 * // Prints out a random number after 1 second.
 * ```
 *
 * {@link delay} and {@link sleep} are similar. `delay()` takes a parameter of what code to execute after the timeout, while `sleep()` just resolves after the timeout.
 *
 *
 * If you want to be able to cancel or re-run a delayed function, consider using
 * {@link timeout} instead.
 *
 * @template V
 * @see {@link delayIterable} To delay iteration
 * @param callback What to run after `timeoutMs`
 * @return Returns result of `callback`.
 */
export const delay = async <V>(
  callback: () => Promise<V>,
  //eslint-disable-next-line functional/prefer-immutable-types
  opts: DelayOpts
): Promise<V> => {
  await sleep(opts);
  return Promise.resolve(await callback());
};

/**
 * Async iterable over an input iterable with delay
 * Use {@link delay} to return a result after some delay
 * ```js
 * for await (const i of delayIterable(count(10), { intervalMs: 1000, delay: 'before' })) {
 *  // Prints 0..9 with one second between
 * }
 * ```
 * @param iter
 * @param opts
 */
export async function* delayIterable<V>(
  iter: AsyncIterable<V> | Iterable<V>,
  //eslint-disable-next-line functional/prefer-immutable-types
  opts: DelayOpts
) {
  const intervalMs = opts.intervalMs;
  const delayWhen = opts.delay;
  const signal = opts.signal;

  for await (const v of iter) {
    // Pre-delay
    if (delayWhen === 'before' || delayWhen === 'both') {
      await sleep({ millis: intervalMs, signal });
      if (signal?.aborted) break;
    }

    // Yield value
    yield v;

    // Post-delay
    if (delayWhen === 'after' || delayWhen === 'both') {
      await sleep({ millis: intervalMs, signal });
      if (signal?.aborted) break;
    }
  }
}

/**
 * Async generator that loops via `requestAnimationFrame`.
 *
 * ```
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
 * ```
 * const loop = delayAnimationLoop();
 * for await (const o of loop) {
 *  // Do something...
 *  // Warning: loops forever
 * }
 * ```
 */
//eslint-disable-next-line func-style
async function* delayAnimationLoop() {
  //eslint-disable-next-line functional/no-let,@typescript-eslint/no-explicit-any
  let resolve: any;
  //eslint-disable-next-line functional/no-let
  let p = new Promise<undefined>((r) => (resolve = r));
  //eslint-disable-next-line functional/no-let
  let timer = 0;
  const callback = () => {
    resolve();
    p = new Promise<undefined>((r) => (resolve = r));
  };

  try {
    while (true) {
      timer = window.requestAnimationFrame(callback);
      yield await p;
    }
  } finally {
    resolve();
    window.cancelAnimationFrame(timer);
  }
}

/**
 * Async generator that loops at a given `timeoutMs`.
 *
 * @example Loop runs every second
 * ```
 * // Loop forever
 * (async () => {
 *  const loop = delayLoop(1000);
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
 * for await (const o of loop) {
 *  // Do something...
 *  // Warning: loops forever
 * }
 * ```
 * @param timeoutMs Delay. If 0 is given, `requestAnimationFrame` is used over `setTimeout`.
 */
//eslint-disable-next-line func-style
export async function* delayLoop(timeoutMs: number) {
  if (timeoutMs === 0) return yield* delayAnimationLoop();

  //eslint-disable-next-line functional/no-let,@typescript-eslint/no-explicit-any
  let resolve: any;
  //eslint-disable-next-line functional/no-let
  let p = new Promise<undefined>((r) => (resolve = r));
  //eslint-disable-next-line functional/no-let
  let timer = 0;
  const callback = () => {
    resolve();
    p = new Promise<undefined>((r) => (resolve = r));
  };

  try {
    while (true) {
      timer = window.setTimeout(callback, timeoutMs);
      yield await p;
    }
  } finally {
    resolve();
    window.clearTimeout(timer);
  }
}
