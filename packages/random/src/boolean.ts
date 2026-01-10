import type { RandomBooleanOptions, RandomSource } from "./types.js";

/**
 * Returns a function that generates a random boolean.
 * 
 * By default, threshold is 0.5.
 * 
 * ```js
 * const r = booleanSource(); // Create source
 * 
 * r(); // Generate a random boolean
 * ```
 * 
 * Getting a function can be useful if you want to reuse the random generation
 * with the same parameters. If you just want a value directly, use {@link boolean}
 * @param options 
 * @returns Function that produces a random boolean
 */
export const booleanSource = (options: RandomBooleanOptions = {}): () => boolean => {
  const source = options.source ?? Math.random;
  const threshold = options.threshold ?? 0.5;
  return (): boolean => {
    if (source() > threshold) return true;
    return false;
  }
}

/**
 * Returns a random boolean value.
 * 
 * If you need to generate several values with the same setting,
 * consider using {@link booleanSource}.
 * 
 * @param options By default uses a threshold of 0.5
 * @returns Random boolean value (true/false) 
 */
export const boolean = (options: RandomBooleanOptions = {}): boolean => booleanSource(options)();
