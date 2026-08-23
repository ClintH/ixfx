import type { RandomSource } from './types.js';

export type NoiseKind = `simplex`;

/**
 * Returns a function that samples a noise field in two dimensions.
 *
 * ```js
 * const f = noise2d(`simplex`);
 * const v = f(0.5, 0.5); // Get noise value at this location
 * ```
 * @param fn Name of noise function to use. Currently only `simplex` is supported.
 * @param randomSource Random number generator
 * @returns Function to compute noise
 */
export async function noise2d(fn: NoiseKind, randomSource?: RandomSource): Promise<NoiseFunction2d> {
  if (fn === `simplex`) {
    const m = await import(`./contrib/simplex.js`);
    return m.createNoise2D(randomSource);
  } else {
    throw new Error(`Unknown noise kind '${fn}'. Expecting: simplex`);
  }
}

/**
 * Samples the noise field in two dimensions
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @returns a number in the interval [-1, 1]
 */
export type NoiseFunction2d = (x: number, y: number) => number;
