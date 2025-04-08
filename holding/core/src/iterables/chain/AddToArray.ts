import type { GenFactoryNoInput } from "./Types.js";

/**
 * Adds values to the provided array as they are produced,
 * mutating array.
 * 
 * ```js
 * const data = [];
 * addToArray(data, tick({ interval: 1000, loops: 5 }));
 * // Execution continues immediately, with `data` mutated over time
 * ```
 * @param valueToWrap 
 * @param array 
 */
export async function addToArray<Out>(array: Array<Out>, valueToWrap: AsyncGenerator<Out> | GenFactoryNoInput<Out>) {
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;
  for await (const value of outputType) {
    array.push(value);
  }
}