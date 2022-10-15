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
 * // Make a generator that counts to 10
 * const counter = count(10);
 * for await (const v of interval(counter, 1000)) {
 *  // Do something with `v`
 * }
 * ```
 * 
 * If you just want to loop at a certain speed, consider using {@link continuously} instead.
 * @template V Returns value of `produce` function
 * @param intervalMs Interval between execution
 * @param produce Function to call
 * @template V Data type
 * @returns
 */
export const interval = async function*<V>(produce:IntervalAsync<V>, intervalMs:number) {
  //eslint-disable-next-line functional/no-let
  let cancelled = false;
  try {
    while (!cancelled) {
      await sleep(intervalMs);
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