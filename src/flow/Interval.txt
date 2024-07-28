import type { ValueType } from '../data/Types.js';
import { resolve, type ResolveToValue } from '../data/Resolve.js';
import { intervalToMs, type Interval } from './IntervalType.js';
import { sleep } from './Sleep.js';

/**
 * Options for interval
 */
export type IntervalOpts = Readonly<{
  /**
   * Sleep a fixed period of time regardless of how long each invocation of 'produce' takes
   */
  fixed: Interval;
  /**
   * Minimum interval. That is, only sleep if there is time left over after 'produce'
   * is invoked.
   */
  minimum: Interval;
  /**
   * Optional signal to abort
   */
  signal: AbortSignal;
  /**
   * When to perform delay. Default is before 'produce' is invoked.
   * Default: 'before'
   */
  delay: `before` | `after`;

  /**
   * Maximum times to repeat (default: no limit)
   */
  repeats: number
  /**
   * Function to call when initialising
   * @returns 
   */
  onStart: () => void

  /**
   * Function to call when done (or an error occurs)
   * @returns 
   */
  onComplete: (withError: boolean) => void
}>;

/**
 * Generates values from `produce` with a time delay.
 * `produce` can be a simple function that returns a value, an async function, or a generator.
 * If `produce` returns _undefined_, generator exits.
 * 
 * @example
 * Produce a random number every 500ms
 * ```js
 * const randomGenerator = interval(() => Math.random(), 500);
 * for await (const r of randomGenerator) {
 *  // Random value every 1 second
 *  // Warning: does not end by itself, a `break` statement is needed
 * }
 * ```
 *
 * @example
 * Return values from a generator every 500ms
 * ```js
 * import { interval } from 'https://unpkg.com/ixfx/dist/flow.js'
 * import { count } from 'https://unpkg.com/ixfx/dist/numbers.js'
 * for await (const v of interval(count(10), { fixed: 1000 })) {
 *  // Do something with `v`
 * }
 * ```
 *
 * Options allow either fixed interval (wait this long between iterations), or a minimum interval (wait at least this long). The latter is useful if `produce` takes some time - it will only wait the remaining time or not at all.
 *
 * If the AbortSignal is triggered, an exception will be thrown, stopping iteration.
 * 
 * @see {@link continuously}: loop that runs at a constant speed. Able to be started and stopped
 * @see {@link repeat}: run a function a certain number of times, collecting results
 *
 * @param produce Function/generator to use
 * @param optsOrFixedMs Options for interval, or millisecond delay
 * @typeParam V - Data type
 * @returns Returns value of `produce` function
 */
export const interval = async function* <V extends ValueType>(
  produce: ResolveToValue<V> | ArrayLike<V>,
  optsOrFixedMs: Partial<IntervalOpts> | number = {}
): AsyncGenerator<V> {
  const opts =
    typeof optsOrFixedMs === `number`
      ? { fixed: optsOrFixedMs }
      : optsOrFixedMs;

  const signal = opts.signal;
  const when = opts.delay ?? `before`;
  const repeats = opts.repeats ?? undefined;
  const minIntervalMs = opts.minimum ? intervalToMs(opts.minimum) : undefined;
  const onStart = opts.onStart ?? (() => {/* no-op*/ })
  const onComplete = opts.onComplete ?? (() => {/* no-op*/ })

  let cancelled = false;
  let sleepMs = intervalToMs(opts.fixed, intervalToMs(opts.minimum, 0));
  let started = performance.now();
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

  // const isGenerator =
  //   typeof produce === `object` &&
  //   `next` in produce &&
  //   typeof produce.next === `function`;

  onStart();

  let errored = true;
  let count = 0;

  try {
    while (!cancelled) {
      if (when === `before`) await doDelay();
      const result = await resolve<V>(produce);
      if (typeof result === `undefined`) break; // Done
      yield result;
      // if (typeof produce === `function`) {
      //   // Returns V or Promise<V>
      //   const result = await produce();
      //   if (typeof result === `undefined`) break; // Done
      //   yield result;
      // } else if (isGenerator) {
      //   // Generator
      //   const result = await (produce as AsyncGenerator<V>).next();
      //   if (result.done) break;
      //   yield result.value;
      // } else {
      //   throw new Error(
      //     `produce param does not seem to return a value/Promise and is not a generator?`
      //   );
      // }

      if (when === `after`) await doDelay();
      count++;
      if (repeats !== undefined && repeats >= count) break;
    }
    errored = false
  } finally {
    cancelled = true;
    onComplete(errored);
  }
};
