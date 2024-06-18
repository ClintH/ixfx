import type { GenFactoryNoInput } from "./Types.js"

import { toArray as AsyncToArray } from "../IterableAsync.js";
import type { ToArrayOptions } from "../index.js";

/**
 * Async function that returns the chain as an array of values
 * ```js
 * const values = await asArray(tick( { interval: 1000, loops: 5 }));
 * // After 5 seconds, values will be a set of timestamps.
 * ```
 * 
 * If the chain is infinite, be sure to specify limits:
 * ```js
 * // Stop after we have five items
 * const values = await asArray(chain, { limit: 5 });
 * // Stop after 5 seconds has elapsed
 * const values = await asArray(chain, { elapsed: 5000 });
 * ```
 * @param valueToWrap 
 * @returns 
 */
export async function asArray<Out>(valueToWrap: AsyncGenerator<Out> | GenFactoryNoInput<Out>, options: Partial<ToArrayOptions> = {}): Promise<Array<Out>> {
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;
  return AsyncToArray(outputType, options);
}