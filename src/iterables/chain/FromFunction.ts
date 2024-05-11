import type { GenFactoryNoInput } from "./Types.js";

/**
 * Produce a value from a callback. When
 * the callback returns _undefined_ it is considered done.
 * 
 * ```js
 * const callback = () => Math.random();
 * 
 * const f = Chains.fromFunction(callback);
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
 *  Chains.fromFunction(() => produced++),
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
export function fromFunction<Out>(callback: () => Promise<Out> | Out): GenFactoryNoInput<Out> {
  async function* fromFunction(): AsyncGenerator<Out> {
    while (true) {
      const v = await callback();
      if (v === undefined) break;
      yield v;
    }
  }

  fromFunction._name = `fromFunction`;
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  fromFunction._type = `GenFactoryNoInput` as const;
  return fromFunction;
}
