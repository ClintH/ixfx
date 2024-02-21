import { intervalToMs, type Interval } from './IntervalType.js';
import { sleep } from './Sleep.js';

import { type AsyncPromiseOrGenerator } from './Types.js';

export type IntervalOpts = {
  /**
   * Sleep a fixed period of time regardless of how long each invocation of 'produce' takes
   */
  readonly fixed?: Interval;
  /**
   * Minimum interval. That is, only sleep if there is time left over after 'produce'
   * is invoked.
   */
  readonly minimum?: Interval;
  /**
   * Optional signal to abort
   */
  readonly signal?: AbortSignal;
  /**
   * When to perform delay. Default is before 'produce' is invoked.
   */
  readonly delay?: `before` | `after`;
};
/**
 * Generates values from `produce` with a time delay.
 * `produce` can be a simple function that returns a value, an async function, or a generator.
 * If `produce` returns _undefined_, generator exits.
 * 
 * @example Produce a random number every 500ms:
 * ```
 * const randomGenerator = interval(() => Math.random(), 500);
 * for await (const r of randomGenerator) {
 *  // Random value every 1 second
 *  // Warning: does not end by itself, a `break` statement is needed
 * }
 * ```
 *
 * @example Return values from a generator every 500ms:
 * ```js
 * import { interval } from 'https://unpkg.com/ixfx/dist/flow.js'
 * import { count } from 'https://unpkg.com/ixfx/dist/generators.js'
 * for await (const v of interval(count(10), { fixed: 1000 })) {
 *  // Do something with `v`
 * }
 * ```
 *
 * Options allow either fixed interval (wait this long between iterations), or a minimum interval (wait at least this long).
 * The latter is useful if `produce` takes some time - it will only wait the remaining time or not at all.
 *
 * If you just want to loop at a certain speed, consider using {@link continuously} instead.
 *
 * If the AbortSignal is triggered, an exception will be thrown, stopping iteration.
 * @template V Returns value of `produce` function
 * @param produce Function, generator to use
 * @param opts Options
 * @template V Data type
 * @returns
 */
export const interval = async function* <V>(
  produce: AsyncPromiseOrGenerator<V> | ArrayLike<V>,
  optsOrFixedMs: IntervalOpts | number = {}
): AsyncGenerator<V> {
  //eslint-disable-next-line functional/no-let
  let cancelled = false;
  const opts =
    typeof optsOrFixedMs === `number`
      ? { fixed: optsOrFixedMs }
      : optsOrFixedMs;

  const signal = opts.signal;
  const when = opts.delay ?? `before`;
  //eslint-disable-next-line functional/no-let
  let sleepMs = intervalToMs(opts.fixed) ?? intervalToMs(opts.minimum, 0);
  //eslint-disable-next-line functional/no-let
  let started = performance.now();

  const minIntervalMs = opts.minimum ? intervalToMs(opts.minimum) : undefined;
  const doDelay = async () => {
    const elapsed = performance.now() - started;
    if (typeof minIntervalMs !== `undefined`) {
      sleepMs = Math.max(0, minIntervalMs - elapsed);
    }
    if (sleepMs) {
      await sleep({ millis: sleepMs, signal });
    }
    started = performance.now();
    if (signal?.aborted) throw new Error(`Signal aborted ${ signal.reason }`);
  };

  // Get an iterator over array
  if (Array.isArray(produce)) produce = produce.values();

  const isGenerator =
    typeof produce === `object` &&
    `next` in produce &&
    typeof produce.next === `function`;

  try {
    while (!cancelled) {
      if (when === `before`) await doDelay();
      //if (cancelled) return;
      if (typeof produce === `function`) {
        // Returns V or Promise<V>
        const result = await produce();
        if (typeof result === `undefined`) return; // Done
        yield result;
      } else if (isGenerator) {
        // Generator
        const result = await (produce as AsyncGenerator<V>).next();
        if (result.done) return;
        yield result.value;
      } else {
        throw new Error(
          `produce param does not seem to return a value/Promise and is not a generator?`
        );
      }

      if (when === `after`) await doDelay();
    }
  } finally {
    cancelled = true;
  }
};
