import type { GenFactoryNoInput } from "./Types.js"

import { toArray as AsyncToArray } from "../IterableAsync.js";

/**
 * Async function that returns the chain as an array of values
 * ```js
 * const values = await asArray(tick( { interval: 1000, loops: 5 }));
 * // After 5 seconds, values will be a set of timestamps.
 * ```
 * @param valueToWrap 
 * @returns 
 */
export async function asArray<Out>(valueToWrap: AsyncGenerator<Out> | GenFactoryNoInput<Out>): Promise<Array<Out>> {
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;
  return AsyncToArray(outputType);
}