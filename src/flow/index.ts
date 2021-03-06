import { number as guardNumber} from "../Guards.js";
import {sleep} from "./Sleep.js";

import * as StateMachine from './StateMachine.js';
import * as Timer from './Timer.js';

export {StateMachine};
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

export type HasCompletion = {
  get isDone(): boolean;
}

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
export const forEach = <V>(iterator:IterableIterator<V>|ReadonlyArray<V>, fn:(v?:V)=>boolean|void) => {
  //eslint-disable-next-line functional/no-loop-statement
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
export const forEachAsync = async function <V> (iterator:AsyncIterableIterator<V>|ReadonlyArray<V>, fn:(v?:V)=>Promise<boolean>|Promise<void>, intervalMs?:number) {
  if (Array.isArray(iterator)) {
    // Handle array
    //eslint-disable-next-line functional/no-loop-statement
    for (const x of iterator) {
      const r = await fn(x);
      if (intervalMs) await sleep(intervalMs);
      if (typeof r === `boolean` && !r) break;
    }
  } else {
    // Handle an async iterator
    //eslint-disable-next-line functional/no-loop-statement
    for await (const x of iterator) {
      const r = await fn(x);
      if (intervalMs) await sleep(intervalMs);
      if (typeof r === `boolean` && !r) break;
    }
  }
};

export type RepeatPredicate = (repeats:number, valuesProduced:number)=>boolean;
/**
 * Runs `fn` a certain number of times, accumulating result into an array.
 * If `fn` returns undefined, the result is ignored.
 * 
 * ```js
 * // Results will be an array with five random numbers
 * const results = repeat(5, () => Math.random());
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
 * 
 * @param countOrPredicate Number of repeats or function returning false when to stop 
 * @param fn Function to run, must return a value to accumulate into array or _undefined_
 * @returns Array of accumulated results
 */
export const repeat = <V>(countOrPredicate:number|RepeatPredicate, fn:()=>V|undefined):readonly V[] => {
  // Unit tested: expected return array length
  //eslint-disable-next-line functional/no-let
  let repeats, valuesProduced;
  repeats = valuesProduced = 0;
  const ret = [];

  if (typeof countOrPredicate === `number`) {
    guardNumber(countOrPredicate, `positive`, `countOrPredicate`);
    //eslint-disable-next-line functional/no-loop-statement
    while (countOrPredicate-- > 0) {
      repeats++;
      const v = fn();
      if (v === undefined) continue;
      //eslint-disable-next-line functional/immutable-data
      ret.push(v);
      valuesProduced++;
    }
  } else {
    //eslint-disable-next-line functional/no-loop-statement
    while (countOrPredicate(repeats, valuesProduced)) {
      repeats++;
      const v = fn();
      if (v === undefined) continue;
      //eslint-disable-next-line functional/immutable-data
      ret.push(v);
      valuesProduced++;
    }
  }
  return ret;
};


try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = {...(window as any).ixfx, Flow: {StateMachine, Timer, forEach, forEachAsync, repeat}};
  }
} catch { /* no-op */ }
