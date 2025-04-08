import type { GenFactoryNoInput } from "./Types.js";

/**
 * Treats the chain/generator as a promise
 * 
 * ```js
 * const ticker = asPromise(tick({ interval: 1000 }));
 * const x = await ticker(); //  Waits for 1000ms before giving a value
 * ```
 * 
 * This will only ever return one value. To return multiple values, it's necessary
 * to call `asPromise` and `await` the result in a loop.
 * @param valueToWrap 
 * @returns 
 */
export function asPromise<V>(valueToWrap: AsyncGenerator<V> | GenFactoryNoInput<V>) {
  let lastValue: V | undefined;

  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;

  async function asPromise(): Promise<V | undefined> {
    const v = await outputType.next();
    if (v.done) return;
    lastValue = v.value;
    return lastValue;
  }
  return asPromise;
}