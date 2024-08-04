import { sleep } from "./Sleep.js";

/**
 * Iterates over `iterator` (iterable/array), calling `fn` for each value.
 * If `fn` returns _false_, iterator cancels.
 *
 * Over the default JS `forEachSync` function, this one allows you to exit the
 * iteration early.
 *
 * @example
 * ```js
 * import { forEachSync } from "https://unpkg.com/ixfx/dist/flow.js"
 * forEachSync(count(5), () => console.log(`Hi`));  // Prints `Hi` 5x
 * forEachSync(count(5), i => console.log(i));      // Prints 0 1 2 3 4
 * forEachSync([0,1,2,3,4], i => console.log(i));   // Prints 0 1 2 3 4
 * ```
 *
 * Use {@link forEach} if you want to use an async `iterator` and async `fn`.
 * 
 * Alternatives:
 * * {@link repeat}/{@link repeatSync}: if you want to call something a given number of times and get the result
 * @param iterator Iterable or array
 * @typeParam V Type of iterable
 * @param fn Function to call for each item. If function returns _false_, iteration cancels
 */
export const forEachSync = <V>(
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
 * Use {@link forEachSync} for a synchronous version.
 *
 * ```
 * import { forEach } from "https://unpkg.com/ixfx/dist/flow.js"
 * // Prints items from array every second
 * await forEach([0,1,2,3], i => console.log(i), 1000);
 * ```
 *
 * ```
 * // Retry up to five times, with 5 seconds between each attempt
 * await forEach(count(5), i=> {
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
export const forEach = async function <V>(
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
