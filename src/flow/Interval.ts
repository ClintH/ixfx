import { sleep } from './Sleep.js';
import { numberTry } from '../Guards.js';
import { type AsyncPromiseOrGenerator } from './index.js';

/**
 * Interval types allows for more expressive coding, rather than embedding millisecond values.
 *
 * eg: { mins: 5} rather than 5*60*1000 or worse, 300000
 *
 * Fields are cumulative. { secs: 2, millis: 1 } will equal 2001 milliseconds.
 *
 * Use {@link intervalToMs} to resolve an {@link Interval} to milliseconds. Use {@link Elapsed.toString} to get a human-readable version.
 */
export type Interval =
  | number
  | {
      readonly millis?: number;
      readonly secs?: number;
      readonly hours?: number;
      readonly mins?: number;
    };

export function intervalToMs(i: Interval | undefined): number | undefined;
export function intervalToMs(
  i: Interval | undefined,
  defaultNumber: number
): number;
/**
 * Return the millisecond value of an Interval.
 * ```js
 * intervalToMs(100); // 100
 * intervalToMs({ millis: 100 }); // 100
 * ```
 *
 * Use `defaultNumber` to return a default in the case of
 * undefined or invalid input.
 *
 * ```js
 * intervalToMs(undefined); // undefined
 * intervalToMs(undefined, 100); // 100
 * ```
 *
 * If no default is provided, an exception is thrown.
 * @param i Interval
 * @param defaultNumber Default value if `i` is undefined
 * @returns Milliseconds, or undefined
 */
export function intervalToMs(
  i: Interval | undefined,
  defaultNumber?: number
): number | undefined {
  if (isInterval(i)) {
    // Number given, must be millis?
    if (typeof i === 'number') return i;

    //eslint-disable-next-line functional/no-let
    let ms = i.millis ?? 0;
    ms += (i.hours ?? 0) * 60 * 60 * 1000;
    ms += (i.mins ?? 0) * 60 * 1000;
    ms += (i.secs ?? 0) * 1000;
    return ms;
  } else {
    if (typeof defaultNumber !== 'undefined') return defaultNumber;
    throw new Error(`Not a valid interval: ${i}`);
  }
}

export function isInterval(i: number | Interval | undefined): i is Interval {
  if (i === undefined) return false;
  if (i === null) return false;
  if (typeof i === `number`) {
    if (Number.isNaN(i)) return false;
    if (!Number.isFinite(i)) return false;
    return true;
  } else if (typeof i !== 'object') return false;

  const hasMillis = 'millis' in i;
  const hasSecs = 'secs' in i;
  const hasMins = 'mins' in i;
  const hasHours = 'hours' in i;
  if (hasMillis) {
    if (!numberTry(i.millis)) return false;
  }
  if (hasSecs) {
    if (!numberTry(i.secs)) return false;
  }
  if (hasMins) {
    if (!numberTry(i.mins)) return false;
  }
  if (hasHours) {
    if (!numberTry(i.hours)) return false;
  }
  if (hasMillis || hasSecs || hasHours || hasMins) return true;
  return false;
}

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
  readonly delay?: 'before' | 'after';
};
/**
 * Generates values from `produce` with a time delay.
 * `produce` can be a simple function that returns a value, an async function, or a generator.
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
    typeof optsOrFixedMs === 'number'
      ? { fixed: optsOrFixedMs }
      : optsOrFixedMs;

  const signal = opts.signal;
  const when = opts.delay ?? 'before';
  //eslint-disable-next-line functional/no-let
  let sleepMs = intervalToMs(opts.fixed) ?? intervalToMs(opts.minimum, 0);
  //eslint-disable-next-line functional/no-let
  let started = performance.now();

  const minIntervalMs = opts.minimum ? intervalToMs(opts.minimum) : undefined;
  const doDelay = async () => {
    const elapsed = performance.now() - started;
    if (typeof minIntervalMs !== 'undefined') {
      sleepMs = Math.max(0, minIntervalMs - elapsed);
    }
    if (sleepMs) {
      await sleep({ millis: sleepMs, signal });
    }
    started = performance.now();
    if (signal?.aborted) throw new Error(`Signal aborted ${signal?.reason}`);
  };

  // Get an iterator over array
  if (Array.isArray(produce)) produce = produce.values();

  const isGenerator =
    typeof produce === `object` &&
    `next` in produce &&
    typeof produce.next === `function`;

  try {
    while (!cancelled) {
      if (when === 'before') await doDelay();
      if (cancelled) return;
      if (typeof produce === `function`) {
        // Returns V or Promise<V>
        const result = await produce();
        if (typeof result === 'undefined') return; // Done
        yield result;
      } else if (isGenerator) {
        // Generator
        const result = await (produce as any).next();
        if (result.done) return;
        yield result.value;
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
