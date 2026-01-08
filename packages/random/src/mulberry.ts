/**
 * Generates deterministic pseudo-random numbers using the mulberry32 technique.
 * Uses 0 (inclusive)...1 (exclusive) scale like ``ath.random()`.
 * 
 * By default it uses a fixed seed, so each time it's used it always produces
 * the same sequence of random values.
 * ```js
 * // Get the function
 * const r = mulberrySource();
 * 
 * // Generate a number
 * r(); // 0..1
 * ```
 * 
 * To create a more properly random source, use the time as the seed:
 * ```js
 * const r = mulberrySource(Date.now());
 * ```
 * @param seed 
 * @returns 
 */
export function mulberrySource(seed = 123456789) {
  let t = seed >>> 0; // force to uint32

  return (): number => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}