import type { GenFactoryNoInput } from "../types.js";

/**
 * Produce a value from a callback. When
 * the callback returns _undefined_ it is considered done.
 * 
 * ```js
 * const callback = () => Math.random();
 * 
 * const f = Chains.From.func(callback);
 * for await (const v of f) {
 *  // v is a new random number
 * }
 * ```
 * 
 * In the context of a chain:
 * ```js
 * let produced = 0;
 * const chain = Chains.chain<number, string>(
 *  // Produce incrementing numbers
 *  Chains.From.func(() => produced++),
 *  // Convert to `x:0`, `x:1` ...
 *  Chains.transform(v => `x:${ v }`),
 *  // Take first 5 results
 *  Chains.cap(5)
 * );
 * const data = await Chains.asArray(chain);
 * ```
 * @param callback 
 * @returns 
 */

export function func<Out>(callback: () => Promise<Out> | Out): GenFactoryNoInput<Out> {
  async function* fromFunction(): AsyncGenerator<Out> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      const v = await callback();
      if (typeof v === `undefined`) break;
      yield v;
    }
  }

  fromFunction._name = `fromFunction`;

  fromFunction._type = `GenFactoryNoInput` as const;
  return fromFunction;
}
