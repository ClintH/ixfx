import { throwNumberTest } from "../util/GuardNumbers.js";
import type { RandomSource } from "./Types.js";

/**
 * Chance of returning `a` or `b`, based on probability `p`.
 * 
 * `p` sets the weighting for picking `b`. The higher the value (up to 1),
 * the more likely `b` will be picked.
 * 
 * ```js
 * // 50% of the time it will return 100, 50% 110
 * chance(0.5, 100, 110);
 * // 90% of the time it will yield 110, 10% it will yield 100
 * chance(0.9, 100, 110);
 * ```
 * 
 * All parameters can be either a function returning a value, or a value.
 * @param p 
 * @param initial 
 * @param compute 
 * @param randomSource 
 * @returns 
 */
export const chance = <T>(p: number | (() => number), a: T | (() => T), b: T | (() => T), randomSource?: RandomSource): T => {
  const source = randomSource ?? Math.random;
  const resolve = <V>(x: V | (() => V)): V => {
    if (typeof x === `function`) return (x as () => V)();
    return x;
  }

  const pp = resolve(p);
  throwNumberTest(pp, `percentage`, `p`);

  if (source() <= pp) {
    return resolve(b);
  } else {
    return resolve(a);
  }
}