import type { GenFactoryNoInput } from "./types.js";

/**
 * Returns the most recent value from the chain/generator, or
 * `initialValue` (defaulting to _undefined_) if no value
 * has been emitted yet.
 * 
 * ```js
 * const ticker = asValue(tick({ interval: 1000 }));
 * x = ticker(); // Get the most recent value
 * ```
 * 
 * Every time it's called, it fetches a new value from the generator, assuming
 * it isn't already awaiting a result.
 * 
 * In the meantime, the last value (or `initialValue`) is returned.
 * @param valueToWrap Value to wrap
 * @param initialValue Initial value
 * @returns 
 */
export function asValue<V>(valueToWrap: AsyncGenerator<V> | GenFactoryNoInput<V>, initialValue?: V) {
  let lastValue: V | undefined = initialValue;
  let awaiting = false;
  const outputType = (typeof valueToWrap === `function`) ? valueToWrap() : valueToWrap;

  function asValue(): V | undefined {
    if (!awaiting) {
      awaiting = true;
      outputType.next().then(v => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        lastValue = v.value;
        awaiting = false;
      }).catch((error: unknown) => {
        awaiting = false;
        throw error;
      });
    }
    return lastValue;
  }
  return asValue;
}