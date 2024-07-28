import { throwNumberTest } from "../util/GuardNumbers.js";
import type { ValueType } from '../data/Types.js';
import { resolve, resolveSync, type ResolveToValue, type ResolveToValueSync } from '../data/Resolve.js';
import { intervalToMs, type Interval } from './IntervalType.js';
import { sleep } from './Sleep.js';
import type { RequireOnlyOne } from "src/TsUtil.js";

export type RepeatDelayOpts = RepeatOpts & Readonly<Partial<{
  /**
 * Sleep a fixed period of time regardless of how long each invocation of 'produce' takes
 */
  delay: Interval;
  /**
   * Minimum interval. That is, only sleep if there is time left over after 'produce'
   * is invoked.
   */
  delayMinimum: Interval;

  /**
 * When to perform delay. Default is before 'produce' is invoked.
 * Default: 'before'
 */
  delayWhen: `before` | `after` | `both`;
}>>


/**
 * Options for repeat
 */
export type RepeatOpts = Partial<Readonly<{
  /**
   * By default, if the callback returns
   * _undefined_ the repeating exits. Set this to _true_ to
   * ignore undefined values
   * @default false
   */
  allowUndefined: boolean
  /**
   * Optional signal to abort
   */
  signal: AbortSignal;

  /**
   * Maximum times to repeat (default: no limit)
   */
  count: number
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
}>>;


/**
 * Generates values from `produce` with a time delay.
 * `produce` can be a simple function that returns a value, an async function, or a generator.
 * If `produce` returns _undefined_, generator exits.
 * 
 * @example
 * Produce a random number every 500ms
 * ```js
 * const randomGenerator = repeat(() => Math.random(), 500);
 * for await (const r of randomGenerator) {
 *  // Random value every 1 second
 *  // Warning: does not end by itself, a `break` statement is needed
 * }
 * ```
 *
 * @example
 * Return values from a generator every 500ms
 * ```js
 * import { repeat } from 'https://unpkg.com/ixfx/dist/flow.js'
 * import { count } from 'https://unpkg.com/ixfx/dist/numbers.js'
 * for await (const v of repeat(count(10), { fixed: 1000 })) {
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
 * @param opts
 * @typeParam T - Data type
 * @returns Returns value of `produce` function
 */
export async function* repeat<T extends ValueType>(
  produce: ResolveToValue<T> | ArrayLike<T>,
  opts: RepeatDelayOpts
): AsyncGenerator<T> {
  const signal = opts.signal ?? undefined;
  const delayWhen = opts.delayWhen ?? `before`;
  const count = opts.count ?? undefined;
  const allowUndefined = opts.allowUndefined ?? false;
  const minIntervalMs = opts.delayMinimum ? intervalToMs(opts.delayMinimum) : undefined;

  let cancelled = false;
  let sleepMs = intervalToMs(opts.delay, intervalToMs(opts.delayMinimum, 0));
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

  if (Array.isArray(produce)) produce = produce.values();

  if (opts.onStart) opts.onStart();

  let errored = true;
  let loopedTimes = 0;
  try {
    while (!cancelled) {
      loopedTimes++;
      if (delayWhen === `before` || delayWhen === `both`) await doDelay();
      const result = await resolve<T>(produce);
      if (typeof result === `undefined` && !allowUndefined) {
        cancelled = true;
      } else {
        yield result;
        if (delayWhen === `after` || delayWhen === `both`) await doDelay();
        if (count !== undefined && loopedTimes >= count) cancelled = true;
      }
    }
    errored = false
  } finally {
    cancelled = true;
    if (opts.onComplete) opts.onComplete(errored);
  }
};


/**
 * Generates values from `produce` with a time delay.
 * `produce` can be a simple function that returns a value, an function, or a generator.
 * If `produce` returns _undefined_, generator exits.
 * 
 * This is the synchronous version. {@link repeat} allows for delays between loops
 * as well as asynchronous callbacks. 
 *
 * If the AbortSignal is triggered, an exception will be thrown, stopping iteration.
 * 
 * @param produce Function/generator to use
 * @param opts Options
 * @typeParam T - Data type
 * @returns Returns value of `produce` function
 */
export function* repeatSync<T extends ValueType>(
  produce: ResolveToValueSync<T> | ArrayLike<T>,
  opts: RepeatOpts
) {
  const signal = opts.signal ?? undefined;
  const count = opts.count ?? undefined;
  const allowUndefined = opts.allowUndefined ?? false;
  let cancelled = false;

  if (Array.isArray(produce)) produce = produce.values();

  if (opts.onStart) opts.onStart();

  let errored = true;
  let loopedTimes = 0;

  try {
    while (!cancelled) {
      loopedTimes++;
      const result = resolveSync<T>(produce);
      if (typeof result === `undefined` && !allowUndefined) {
        cancelled = true;
      } else {
        yield result;
        if (count !== undefined && loopedTimes >= count) cancelled = true;
        if (signal?.aborted) cancelled = true;
      }
    }
    errored = false
  } finally {
    cancelled = true;
    if (opts.onComplete) opts.onComplete(errored);
  }
};

/**
 * Logic for continuing repeats
 */
// export type RepeatPredicate = (
//   repeats: number,
//   valuesProduced: number
// ) => boolean;


/**
 * Calls and waits for the async function `fn` repeatedly, yielding each result asynchronously.
 * Use {@link repeat} if `fn` does not need to be awaited.
 *
 * ```js
 * // Eg. iterate
 * const r = Flow.repeat(5, async () => Math.random());
 * for await (const v of r) {
 *
 * }
 * // Eg read into array
 * const results = await Array.fromAsync(Flow.repeatAwait(5, async () => Math.random()));
 * ```
 *
 * The number of repeats is determined by the first parameter. If it's a:
 * - number: how many times to repeat
 * - function: it gets called before each repeat, if it returns _false_ repeating stops.
 *
 * Using a fixed number of repeats:
 * ```js
 * // Calls - and waits - for Flow.sleep(1) 5 times
 * await Flow.repeatAwait(5, async () => {
 *    // some kind of async function where we can use await
 *    // eg. sleep for 1s
 *    await Flow.sleep(1);
 * });
 * ```
 *
 * Using a function to dynamically determine number of repeats. The function gets
 * passed the number of repeats so far as well as the number of values produced. This
 * is count of non-undefined results from `cb` that is being repeated.
 *
 * ```js
 * async function task() {
 *  // do something
 * }
 *
 * await Flow.repeatAwait(
 *  (repeats, valuesProduced) => {
 *    // Logic for deciding whether to repeat or not
 *    if (repeats > 5) return false; // Stop repeating
 *  },
 *  task
 * );
 * ```
 *
 * In the above cases we're not using the return value from `fn`. This would look like:
 * ```js
 * const g = Flow.repeatAwait(5, async () => Math.random);
 * for await (const v of g) {
 *  // Loops 5 times, v is the return value of calling `fn` (Math.random)
 * }
 * ```
 * @param countOrPredicate Number of times to repeat, or a function that returns _false_ to stop the loop.
 * @param fn Function to execute. Asynchronous functions will be awited
 * @typeParam V - Return type of repeating function
 * @returns Asynchronous generator of `fn` results.
 */
// export function repeatAwait<V>(countOrPredicate: number | RepeatPredicate, fn: (repeats: number, valuesProduced: number) => Promise<V | undefined> | V): AsyncIterable<V> {
//   return typeof countOrPredicate === `number` ? repeatTimesAwaited(countOrPredicate, fn) : repeatWhileAwaited(countOrPredicate, fn);
// }

/**
 * Calls `fn` repeatedly, yielding each result.
 * Use {@link repeatAwait} if `fn` is asynchronous and you want to wait for it.
 *
 * The number of repeats is determined by the first parameter. If it's a:
 * - number: how many times to repeat
 * - function: it gets called before each repeat, if it returns _false_ repeating stops.
 *
 * Example: using a fixed number of repeats
 * ```js
 * // Results will be an array with five random numbers
 * const results = [...repeat(5, () => Math.random())];
 *
 * // Or as an generator (note also the simpler expression form)
 * for (const result of repeat(5, Math.random)) {
 * }
 * ```
 *
 * Example: Using a function to dynamically determine number of repeats
 * ```js
 * function task() {
 * }
 *
 * Flow.repeat(
 *  (repeats, valuesProduced) => {
 *    if (repeats > 5) return false; // Stop repeating
 *  },
 *  task
 * );
 * ```
 *
 * In the above cases we're not using the return value from `fn`. To do so,
 * this would look like:
 * ```js
 * const g = Flow.repeat(5, () => Math.random);
 * for (const v of g) {
 *  // Loops 5 times, v is the return value of calling `fn` (Math.random)
 * }
 * ```
 *
 * Alternatives:
 * * {@link Flow.forEach | Flow.forEach} - if you don't need return values
 * * {@link Flow.interval} - if you want to repeatedly call something with an interval between
 * @param countOrPredicate Numnber of repeats, or a function that returns _false_ for when to stop.
 * @param fn Function to execute. Asynchronous functions will be awited
 * @typeParam V - Return type of repeating function
 * @returns Asynchronous generator of `fn` results.
 */
// export function repeat<V>(countOrPredicate: number | RepeatPredicate, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
//   return typeof countOrPredicate === `number` ? repeatTimes(countOrPredicate, fn) : repeatWhile(countOrPredicate, fn);
// }


/**
 * Calls `fn` until `predicate` returns _false_. Awaits result of `fn` each time.
 * Yields result of `fn` asynchronously
 * @param predicate
 * @param fn
 * @typeParam V - Return type of repeating function
 */
// async function* repeatWhileAwaited<V>(predicate: RepeatPredicate, fn: (repeats: number, valuesProduced: number) => Promise<V | undefined> | V): AsyncGenerator<V> {
//   let repeats = 0;
//   let valuesProduced = 0;
//   while (predicate(repeats, valuesProduced)) {
//     repeats++;
//     const v = await fn(repeats, valuesProduced);
//     if (v === undefined) continue;
//     yield v;
//     valuesProduced++;
//   }
// }

/**
 * Calls `fn` until `predicate` returns _false_. Yields result of `fn`.
 * @param predicate Determiner for whether repeating continues
 * @param fn Function to call
 * @typeParam V - Return type of repeating function
 */
// function* repeatWhile<V>(predicate: RepeatPredicate, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
//   let repeats = 0;
//   let valuesProduced = 0;
//   while (predicate(repeats, valuesProduced)) {
//     repeats++;
//     const v = fn(repeats, valuesProduced);
//     if (v === undefined) continue;
//     yield v;
//     valuesProduced++;
//   }
// }

/**
 * Calls `fn`, `count` number of times, waiting for the result of `fn`.
 * Yields result of `fn` asynchronously
 * @param count Number of times to run
 * @param fn Function to run
 * @typeParam V - Return type of repeating function
 */
// async function* repeatTimesAwaited<V>(count: number, fn: (repeats: number, valuesProduced: number) => Promise<V | undefined> | V | undefined) {
//   throwNumberTest(count, `positive`, `count`);
//   let valuesProduced = 0;
//   let repeats = 0;
//   while (count-- > 0) {
//     repeats++;
//     const v = await fn(repeats, valuesProduced);
//     if (v === undefined) continue;
//     yield v;
//     valuesProduced++;
//   }
// }

/**
 * Calls `fn`, `count` times. Assumes a synchronous function. Yields result of `fn`.
 *
 * Note that if `fn` returns _undefined_ repeats will stop.
 * @typeParam V - Return type of repeating function
 * @param count Number of times to run
 * @param fn Function to run
 */
// function* repeatTimes<V>(count: number, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
//   throwNumberTest(count, `positive`, `count`);
//   let valuesProduced = 0;
//   let repeats = 0;
//   while (count-- > 0) {
//     //console.log(`Flow.repeatTimes count: ${ count } repeats: ${ repeats } values: ${ valuesProduced }`);
//     repeats++;
//     const v = fn(repeats, valuesProduced);
//     if (v === undefined) continue;
//     yield v;
//     valuesProduced++;
//   }
// }


/**
 * Repeatedly calls `fn`, reducing via `reduce`.
 *
 * ```js
 * repeatReduce(10, () => 1, (acc, v) => acc + v);
 * // Yields: 10
 *
 * // Multiplies random values against each other 10 times
 * repeatReduce(10, Math.random, (acc, v) => acc * v);
 * // Yields a single number
 * ```
 * @param countOrPredicate Number of times to run, or function to keep running
 * @param fn Function to call
 * @param initial Initial value
 * @param reduce Function to reduce value
 * @typeParam V - Return type of repeating function
 * @returns Final result
 */
// export const repeatReduce = <V>(
//   countOrPredicate: number | RepeatPredicate,
//   fn: () => V | undefined,
//   reduce: (accumulator: V, value: V) => V,
//   initial: V
// ): V => {

//   return IterableReduce(repeat(countOrPredicate, fn), reduce, initial);

//   // if (typeof countOrPredicate === `number`) {
//   //   throwNumberTest(countOrPredicate, `positive`, `countOrPredicate`);
//   //   while (countOrPredicate-- > 0) {
//   //     const v = fn();
//   //     if (v === undefined) continue;
//   //     initial = reduce(initial, v);
//   //   }
//   // } else {
//   //   //eslint-disable-next-line functional/no-let
//   //   let repeats, valuesProduced;
//   //   repeats = valuesProduced = 0;
//   //   while (countOrPredicate(repeats, valuesProduced)) {
//   //     repeats++;
//   //     const v = fn();
//   //     if (v === undefined) continue;
//   //     initial = reduce(initial, v);
//   //     valuesProduced++;
//   //   }
//   // }
//   // return initial;
// };