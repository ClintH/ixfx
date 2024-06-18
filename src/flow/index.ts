
import { sleep } from './Sleep.js';
import * as StateMachine from './StateMachine.js';
import * as Timer from './Timer.js';

export * as Elapsed from './Elapsed.js';
export * from './DispatchList.js';
export * from './Types.js';
/**
 * State Machine
 * See [here for usage](../classes/Flow.StateMachine.StateMachine.html).
 *
 * * {@link StateMachine.driver}: Drive a state machine
 * * {@link StateMachine.init}: Create a state machine from initial state and machine description
 * * {@link fromList}: Create a state machine from a simple list of states
 */
export * as StateMachine from './StateMachine.js';

export * from './Timer.js';

export * from './Interval.js';
export * from './IntervalType.js';
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
export * from './Types.js';
export * from './RequestResponseMatch.js';
export * from './TaskQueueMutable.js';
export * from './SyncWait.js';
export * from './PromiseFromEvent.js';

import { repeatAwait, repeat } from './Repeat.js';
export { repeatAwait, repeat, type RepeatPredicate } from './Repeat.js';


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
 * 
 * Alternatives:
 * * {@link repeat}/{@link repeatAwait}: if you want to call something a given number of times and get the result
 * @param iterator Iterable or array
 * @typeParam V Type of iterable
 * @param fn Function to call for each item. If function returns _false_, iteration cancels
 */
export const forEach = <V>(
  iterator: IterableIterator<V> | ReadonlyArray<V>,
  fn: (v?: V) => boolean
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
 * ```
 * // Retry up to five times, with 5 seconds between each attempt
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


try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = {
      ...(window as any).ixfx,
      Flow: { StateMachine, Timer, forEach, forEachAsync, repeatAwait, repeat },
    };
  }
} catch {
  /* no-op */
}

