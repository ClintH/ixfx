import { numberTest, resultThrow } from "@ixfx/guards";
import type { RandomSource } from "./types.js";

/**
 * Chance of returning `a` or `b`, based on threshold `p`.
 * 
 * `p` sets the threshold for picking `b`. The higher the value (up to 1),
 * the more likely `b` will be picked.
 * 
 * ```js
 * // 50% of the time it will return 100, 50% 110
 * chance(0.5, 100, 110);
 * // 90% of the time it will yield 110, 10% it will yield 100
 * chance(0.9, 100, 110);
 * ```
 * 
 * @param p Threshold to choose option B (value or function)
 * @param a Value or function for option A
 * @param b Value or function for option B
 * @param randomSource Source of random numbers
 * @returns 
 */
export const chance = <T>(p: number | (() => number), a: T | (() => T), b: T | (() => T), randomSource?: RandomSource): T => {
  const source = randomSource ?? Math.random;
  const resolve = <V>(x: V | (() => V)): V => {
    if (typeof x === `function`) return (x as () => V)();
    return x;
  }

  const pp = resolve(p);

  resultThrow(numberTest(pp, `percentage`, `p`));

  if (source() <= pp) {
    return resolve(b);
  } else {
    return resolve(a);
  }
}