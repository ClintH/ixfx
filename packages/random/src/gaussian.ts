import { calculateNonZero } from "./non-zero.js";
import type { RandomSource } from "./types.js";

/**
 * Returns a random number with gaussian (ie. bell-curved) distribution
 * 
 * @example Random number between 0..1 with gaussian distribution
 * ```js
 * gaussian();
 * ```
 * 
 * @example Distribution can be skewed
 * ```js
 * gaussian(10);
 * ```
 * 
 * Use {@link gaussianSource} if you want a function with skew value baked-in.
 * @param skew Skew factor. Defaults to 1, no skewing. Above 1 will skew to left, below 1 will skew to right
 * @returns 
 */
export const gaussian = (skew = 1): number => gaussianSource(skew)();

/**
 * Returns a function that generates a gaussian-distributed random number
 * @example
 * Random number between 0..1 with gaussian distribution
 * ```js
 * // Create function
 * const r = gaussianSource();
 *
 * // Generate random value
 * r();
 * ```
 *
 * @example
 * Pass the random number generator elsewhere
 * ```js
 * const r = gaussianSource(10);
 *
 * // Randomise array with gaussian distribution
 * Arrays.shuffle(r);
 * ```
 * 
 * If you want to fit a value to a gaussian curve, see Modulation.gaussian instead.
 * @param skew
 * @returns
 */
export const gaussianSource = (skew = 1): RandomSource => {
  const min = 0;
  const max = 1;
  // Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve

  const compute = (): number => {
    const u = calculateNonZero();
    const v = calculateNonZero();
    let result = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);

    result = result / 10 + 0.5; // Translate to 0 -> 1
    if (result > 1 || result < 0) {
      result = compute(); //;gaussian(skew); // resample between 0 and 1 if out of range
    } else {
      result = Math.pow(result, skew); // Skew
      result *= max - min; // Stretch to fill range
      result += min; // offset to min
    }
    return result;
  };
  return compute;
};