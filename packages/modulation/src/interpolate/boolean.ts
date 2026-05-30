import type { BooleanInterpolateOptions } from "./types.js";
import { get as getEasing } from '../easing.js';
/**
 * Returns an interpolator function between two boolean values.
 *
 * Defaults to 0.5 as the threshold:
 * ```js
 * const i = interpolatorBoolean(false, true);
 * i(0); // false
 * i(0.5); // true
 * i(0.6); // true
 * ```
 *
 * You can also specify a different threshold:
 * ```js
 * const i = interpolatorBoolean(false, true, { threshold: 0.8 });
 * i(0.7); // false
 * i(0.8); // true
 * i(0.9); // true
 * ```
 *
 * @param a
 * @param b
 * @param options
 * @returns Interpolator function
 */
export function interpolatorBoolean(a: boolean, b: boolean, options?: BooleanInterpolateOptions): (amount: number) => boolean {
  const threshold = options?.threshold ?? 0.5;
  return (amount: number) => {
    const processedAmount = options?.easing ? getEasing(options.easing)?.(amount) ?? amount : amount;
    if (processedAmount === undefined)
      throw new Error(`Easing function '${options?.easing}' not found`);
    if (options?.transform) {
      if (typeof options.transform !== `function`)
        throw new Error(`Param 'transform' is expected to be a function. Got: ${typeof options.transform}`);
      return options.transform(amount) < 0.5 ? a : b;
    }
    return processedAmount < threshold ? a : b;
  };
}
