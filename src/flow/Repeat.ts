import { throwNumberTest } from '../Guards.js';

export type RepeatPredicate = (
  repeats: number,
  valuesProduced: number
) => boolean;



export function repeatAsync<V>(countOrPredicate: number | RepeatPredicate, fn: (repeats: number, valuesProduced: number) => Promise<V | undefined>): AsyncGenerator<V> {
  return typeof countOrPredicate === `number` ? repeatTimesAsync(countOrPredicate, fn) : repeatWhileAsync(countOrPredicate, fn);
}

function repeatSync<V>(countOrPredicate: number | RepeatPredicate, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
  return typeof countOrPredicate === `number` ? repeatTimesSync(countOrPredicate, fn) : repeatWhileSync(countOrPredicate, fn);
}

/**
 * Runs `fn` a certain number of times, yielding results. Use {@link repeatAsync} to use async `fn`.
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
 * If you don't need to accumulate return values, consider {@link Numbers.count | Numbers.count} with {@link Flow.forEach | Flow.forEach}.
 * If you want to have a waiting period between each repetition, consider {@link Flow.interval}.
 * @param countOrPredicate Number of repeats or function returning false when to stop
 * @param fn Function to run, must return a value to accumulate into array or _undefined_
 * @returns Yields results, one at a time
 */
export function repeat<V>(countOrPredicate: number | RepeatPredicate, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
  return repeatSync(countOrPredicate, fn);
}

export async function* repeatWhileAsync<V>(predicate: RepeatPredicate, fn: (repeats: number, valuesProduced: number) => Promise<V | undefined>): AsyncGenerator<V> {
  let repeats = 0;
  let valuesProduced = 0;
  while (predicate(repeats, valuesProduced)) {
    repeats++;
    const v = await fn(repeats, valuesProduced);
    if (v === undefined) continue;
    yield v;
    valuesProduced++;
  }
}

export function* repeatWhileSync<V>(predicate: RepeatPredicate, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
  let repeats = 0;
  let valuesProduced = 0;
  while (predicate(repeats, valuesProduced)) {
    repeats++;
    const v = fn(repeats, valuesProduced);
    if (v === undefined) continue;
    yield v;
    valuesProduced++;
  }
}
async function* repeatTimesAsync<V>(count: number, fn: (repeats: number, valuesProduced: number) => Promise<V | undefined> | V | undefined) {
  throwNumberTest(count, `positive`, `count`);
  let valuesProduced = 0;
  let repeats = 0;
  while (count-- > 0) {
    repeats++;
    const v = await fn(repeats, valuesProduced);
    if (v === undefined) continue;
    yield v;
    valuesProduced++;
  }
}

function* repeatTimesSync<V>(count: number, fn: (repeats: number, valuesProduced: number) => V | undefined): Generator<V> {
  throwNumberTest(count, `positive`, `count`);
  let valuesProduced = 0;
  let repeats = 0;
  while (count-- > 0) {
    repeats++;
    const v = fn(repeats, valuesProduced);
    if (v === undefined) continue;
    yield v;
    valuesProduced++;
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
  reduce: (accumulator: V, value: V) => V
): V => {
  if (typeof countOrPredicate === `number`) {
    throwNumberTest(countOrPredicate, `positive`, `countOrPredicate`);
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