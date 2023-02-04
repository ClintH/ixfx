import { sleep } from "./Sleep.js";

export type IntervalAsync<V> = (()=>V|Promise<V>) | Generator<V>;
/**
 * Generates values from `produce` with `intervalMs` time delay. 
 * `produce` can be a simple function that returns a value, an async function, or a generator.
 * 
 * @example Produce a random number every 500ms:
 * ```
 * const randomGenerator = interval(() => Math.random(), 1000);
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
 * // Make a generator that counts to 10
 * const counter = count(10);
 * for await (const v of interval(counter, 1000)) {
 *  // Do something with `v`
 * }
 * ```
 * 
 * In the above example, it won't work to create the generator in the for-of loop:
 * ```js
 * for await (const v of interval(count(10), 1000)) { .. }
 * ```
 * In this case, the count will keep being recreated. Instead, use {@link eachIterval}.
 * 
 * If you just want to loop at a certain speed, consider using {@link continuously} instead.
 * @template V Returns value of `produce` function
 * @param intervalMs Interval between execution
 * @param produce Function to call
 * @param signal AbortSignal to cancel long sleeps
 * @template V Data type
 * @returns
 */
export const interval = async function*<V>(produce:IntervalAsync<V>, intervalMs:number, signal:AbortSignal) {
  //eslint-disable-next-line functional/no-let
  let cancelled = false;
  try {
    while (!cancelled) {
      await sleep(intervalMs, signal);
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
          throw new Error(`interval: produce param does not seem to be a generator?`);
        }
      } else {
        throw new Error(`produce param does not seem to return a value/Promise and is not a generator?`);
      }
    }
  } finally {
    cancelled = true;
  }
};

/**
 * Essentially runs a `for await` loop over `produce`, invoking `callback` for each item with
 * a given `intervalMs` delay.
 * ```js
 * eachInterval(count(5), 1000, (index) => {
 *  // Count to 5 over 5 seconds
 * });
 * ```
 * 
 * If `callback` returns false, the loop exits at next iteration. If there is a long-running
 * sleep period, pass in an AbortSignal so it can be stopped.
 * @param iterable Thing to for-of over
 * @param intervalMs Interval between `callback` invocation
 * @param callback Function to run with each thing in `iterable`
 * @param signal AbortSignal to cancel sleep & loop
 */
export const eachInterval = async function<V> (iterable:AsyncIterable<V>, intervalMs:number, callback:(v:V)=>boolean|void, signal?:AbortSignal) {
  for await (const v of iterable) {
    const r = await callback(v);
    if (typeof r === `boolean` && !r) break;
    await sleep(intervalMs, undefined, signal);
  }
};