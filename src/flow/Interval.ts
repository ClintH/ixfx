import { sleep } from './Sleep.js';
import { type AsyncPromiseOrGenerator } from './index.js';

export type Interval =
  | number
  | {
      readonly millis?: number;
      readonly secs?: number;
      readonly hrs?: number;
      readonly mins?: number;
    };

export const intervalToMs = (
  i: Interval | undefined,
  defaultNumber?: number
): number | undefined => {
  if (typeof i === 'undefined') return defaultNumber;
  if (typeof i === 'number') return i;
  //eslint-disable-next-line functional/no-let
  let ms = i.millis ?? 0;
  ms += (i.hrs ?? 0) * 60 * 60 * 1000;
  ms += (i.mins ?? 0) * 60 * 1000;
  ms += (i.secs ?? 0) * 1000;
  return ms;
};

export type IntervalOpts = {
  /**
   * Sleep a fixed period of time regardless of how long each invocation of 'produce' takes
   */
  readonly fixedIntervalMs?: Interval;
  /**
   * Minimum interval. That is, only sleep if there is time left over after 'produce'
   * is invoked.
   */
  readonly minIntervalMs?: Interval;
  /**
   * Optional signal to abort
   */
  readonly signal?: AbortSignal;
  /**
   * When to perform delay. Default is before 'produce' is invoked.
   */
  readonly delay?: 'before' | 'after';
};
/**
 * Generates values from `produce` with `intervalMs` time delay.
 * `produce` can be a simple function that returns a value, an async function, or a generator.
 *
 * @example Produce a random number every 500ms:
 * ```
 * const randomGenerator = interval(() => Math.random(), { fixedIntervalMs: 1000 });
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
 * for await (const v of interval(count(10), { fixedIntervalMs: 1000 })) {
 *  // Do something with `v`
 * }
 * ```
 *
 * Options allow either fixed interval (wait this long between each callback), or a minimum interval (wait at least this long).
 * The latter is useful if `produce` takes some time or sleeps. In this case, `interval` will only wait the remaining time,
 * or otherwise not wait at all.
 *
 * If you just want to loop at a certain speed, consider using {@link continuously} instead.
 *
 * If the AbortSignal is triggered, an exception will be thrown, stopping iteration.
 * @template V Returns value of `produce` function
 * @param produce Function to call
 * @param opts Options
 * @template V Data type
 * @returns
 */
export const interval = async function* <V>(
  produce: AsyncPromiseOrGenerator<V>,
  opts: IntervalOpts = {}
) {
  //eslint-disable-next-line functional/no-let
  let cancelled = false;
  const signal = opts.signal;
  const when = opts.delay ?? 'before';
  //eslint-disable-next-line functional/no-let
  let sleepMs =
    intervalToMs(opts.fixedIntervalMs) ?? intervalToMs(opts.minIntervalMs, 0);
  //eslint-disable-next-line functional/no-let
  let started = performance.now();

  const minIntervalMs = intervalToMs(opts.minIntervalMs);
  const doDelay = async () => {
    const elapsed = performance.now() - started;
    if (typeof minIntervalMs !== 'undefined') {
      sleepMs = Math.max(0, minIntervalMs - elapsed);
    }
    //console.log(`sleepMs: ${sleepMs} min: ${opts.minIntervalMs} elapsed: ${elapsed}`);
    if (sleepMs) {
      await sleep({ millis: sleepMs, signal });
    }
    started = performance.now();
    if (signal?.aborted) throw new Error(`Signal aborted ${signal?.reason}`);
  };

  try {
    while (!cancelled) {
      if (when === 'before') await doDelay();
      if (cancelled) return;
      if (typeof produce === `function`) {
        // Returns V or Promise<V>
        const result = await produce();
        yield result;
      } else if (typeof produce === `object`) {
        // Generator, perhaps?
        if (`next` in produce && `return` in produce && `throw` in produce) {
          const result = await produce.next();
          if (result.done) return;
          yield result.value;
        } else {
          throw new Error(
            `interval: produce param does not seem to be a generator?`
          );
        }
      } else {
        throw new Error(
          `produce param does not seem to return a value/Promise and is not a generator?`
        );
      }

      if (when === 'after') await doDelay();
    }
  } finally {
    cancelled = true;
  }
};
