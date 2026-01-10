import type { GenFactoryNoInput, GenOrData } from "./types.js";

/**
 * Calls `callback` whenever the chain/generator produces a value.
 * 
 * When using `asCallback`, call it with `await` to let generator 
 * run its course before continuing:
 * ```js
 * await asCallback(tick({ interval:1000, loops:5 }), x => {
 *  // Gets called 5 times, with 1000ms interval
 * });
 * console.log(`Hi`); // Prints after 5 seconds
 * ```
 * 
 * Or if you skip the `await`, code continues and callback will still run:
 * ```js
 * asCallback(tick({ interval: 1000, loops: 5}), x => {
 *  // Gets called 5 times, with 1000ms interval
 * });
 * console.log(`Hi`); // Prints immediately
 * ```
 * @param valueToWrap 
 * @param callback 
 */
export async function asCallback<V>(valueToWrap: GenOrData<V> | GenFactoryNoInput<V>, callback: (v: V) => unknown, onDone?: () => void): Promise<void> {
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;
  for await (const value of outputType) {
    callback(value);
  }
  if (onDone) onDone();
}