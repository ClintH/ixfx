export type AsyncPromiseOrGenerator<V> =
  | (() => Promise<V> | Promise<undefined>)
  | (() => V | undefined)
  | Generator<V>
  | IterableIterator<V>
  | AsyncIterableIterator<V>
  | AsyncGenerator<V>
  | AsyncIterable<V>
  | Iterable<V>;

import { number as guardNumber } from '../Guards.js';
import { sleep } from './Sleep.js';

import * as StateMachine from './StateMachine.js';
import * as Timer from './Timer.js';

/**
 * State Machine
 * See [here for usage](../classes/Flow.StateMachine.StateMachine.html).
 *
 * * {@link StateMachine.driver}: Drive a state machine
 * * {@link StateMachine.init}: Create a state machine from initial state and machine description
 * * {@link fromList}: Create a state machine from a simple list of states
 */
export { StateMachine };
export * from './Timer.js';

export * from './Interval.js';
export * from './Timeout.js';
export * from './UpdateOutdated.js';
export * from './Continuously.js';
export * from './Debounce.js';
export * from './Throttle.js';
export * from './Sleep.js';
export * from './WaitFor.js';
export * from './Delay.js';
export * from './Every.js';
export * from './RunOnce.js';
export * from './Retry.js';
//export * from './Poll.js';

import * as Elapsed from './Elapsed.js';
export { Elapsed };
export { TaskQueue } from './TaskQueue.js';

export type HasCompletion = {
  get isDone(): boolean;
};

/**
 * Iterates over `iterator` (iterable/array), calling `fn` for each value.
 * If `fn` returns _false_, iterator cancels.
 *
 * Over the default JS `forEach` function, this one allows you to exit the
 * iteration early.
 *
 * @example
 * ```js
 * forEach(count(5), () => console.log(`Hi`));  // Prints `Hi` 5x
 * forEach(count(5), i => console.log(i));      // Prints 0 1 2 3 4
 * forEach([0,1,2,3,4], i => console.log(i));   // Prints 0 1 2 3 4
 * ```
 *
 * Use {@link forEachAsync} if you want to use an async `iterator` and async `fn`.
 * @param iterator Iterable or array
 * @typeParam V Type of iterable
 * @param fn Function to call for each item. If function returns _false_, iteration cancels
 */
export const forEach = <V>(
  iterator: IterableIterator<V> | ReadonlyArray<V>,
  fn: (v?: V) => boolean | void
) => {
  for (const x of iterator) {
    const r = fn(x);
    if (typeof r === `boolean` && !r) break;
  }
};

/**
 * Iterates over an async iterable or array, calling `fn` for each value, with optional
 * interval between each loop. If the async `fn` returns _false_, iterator cancels.
 *
 * Use {@link forEach} for a synchronous version.
 *
 * ```
 * // Prints items from array every second
 * await forEachAsync([0,1,2,3], i => console.log(i), 1000);
 * ```
 *
 * @example Retry `doSomething` up to five times, with 5 seconds between each attempt
 * ```
 * await forEachAsync(count(5), i=> {
 *  try {
 *    await doSomething();
 *    return false; // Succeeded, exit early
 *  } catch (ex) {
 *    console.log(ex);
 *    return true; // Keep trying
 *  }
 * }, 5000);
 * ```
 * @param iterator Iterable thing to loop over
 * @param fn Function to invoke on each item. If it returns _false_ loop ends.
 * @typeParam V Type of iterable
 */
export const forEachAsync = async function <V>(
  iterator: AsyncIterableIterator<V> | ReadonlyArray<V>,
  fn: (v?: V) => Promise<boolean> | Promise<void>,
  intervalMs?: number
) {
  if (Array.isArray(iterator)) {
    // Handle array
    for (const x of iterator) {
      const r = await fn(x);
      if (intervalMs) await sleep(intervalMs);
      if (typeof r === `boolean` && !r) break;
    }
  } else {
    // Handle an async iterator
    for await (const x of iterator) {
      const r = await fn(x);
      if (intervalMs) await sleep(intervalMs);
      if (typeof r === `boolean` && !r) break;
    }
  }
};

export type RepeatPredicate = (
  repeats: number,
  valuesProduced: number
) => boolean;
/**
 * Runs `fn` a certain number of times, yielding results.
 * If `fn` returns undefined, the result is ignored, but loop continues.
 *
 * ```js
 * // Results will be an array with five random numbers
 * const results = [...repeat(5, () => Math.random())];
 *
 * // Or as an generator (note also the simpler expression form)
 * for (const result of repeat(5, Math.random)) {
 * }
 * ```
 *
 * Repeats can be specified as an integer (eg. 5 for five repeats), or a function
 * that gives _false_ when repeating should stop.
 *
 * ```js
 * // Keep running `fn` until we've accumulated 10 values
 * // Useful if `fn` sometimes returns _undefined_
 * const results = repeat((repeats, valuesProduced) => valuesProduced < 10, fn);
 * ```
 *
 * If you don't need to accumulate return values, consider {@link Generators.count | Generators.count} with {@link Flow.forEach | Flow.forEach}.
 * If you want to have a waiting period between each repetition, consider {@link Flow.interval}.
 * @param countOrPredicate Number of repeats or function returning false when to stop
 * @param fn Function to run, must return a value to accumulate into array or _undefined_
 * @returns Yields results, one at a time
 */
export function* repeat<V>(
  countOrPredicate: number | RepeatPredicate,
  fn: () => V | undefined
) {
  // Unit tested: expected return array length
  //eslint-disable-next-line functional/no-let
  let repeats, valuesProduced;
  repeats = valuesProduced = 0;

  if (typeof countOrPredicate === `number`) {
    guardNumber(countOrPredicate, `positive`, `countOrPredicate`);
    while (countOrPredicate-- > 0) {
      repeats++;
      const v = fn();
      if (v === undefined) continue;
      yield v;
      valuesProduced++;
    }
  } else if (typeof countOrPredicate === 'function') {
    while (countOrPredicate(repeats, valuesProduced)) {
      repeats++;
      const v = fn();
      if (v === undefined) continue;
      yield v;
      valuesProduced++;
    }
  } else {
    throw new Error(
      `countOrPredicate should be a number or function. Got: ${typeof countOrPredicate}`
    );
  }
}

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
 * @param countOrPredicate
 * @param fn
 * @param initial
 * @param reduce
 * @returns
 */
export const repeatReduce = <V>(
  countOrPredicate: number | RepeatPredicate,
  fn: () => V | undefined,
  initial: V,
  reduce: (acc: V, value: V) => V
): V => {
  if (typeof countOrPredicate === `number`) {
    guardNumber(countOrPredicate, `positive`, `countOrPredicate`);
    while (countOrPredicate-- > 0) {
      const v = fn();
      if (v === undefined) continue;
      initial = reduce(initial, v);
    }
  } else {
    //eslint-disable-next-line functional/no-let
    let repeats, valuesProduced;
    repeats = valuesProduced = 0;
    while (countOrPredicate(repeats, valuesProduced)) {
      repeats++;
      const v = fn();
      if (v === undefined) continue;
      initial = reduce(initial, v);
      valuesProduced++;
    }
  }
  return initial;
};

try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = {
      ...(window as any).ixfx,
      Flow: { StateMachine, Timer, forEach, forEachAsync, repeat },
    };
  }
} catch {
  /* no-op */
}
