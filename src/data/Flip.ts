import { throwNumberTest } from '../Guards.js';
import type { NumberFunction } from './Types.js';

/**
 * Flips a percentage-scale number: `1 - v`.
 *
 * The utility of this function is that it sanity-checks
 * that `v` is in 0..1 scale.
 *
 * ```js
 * flip(1);   // 0
 * flip(0.5); // 0.5
 * flip(0);   // 1
 * ```
 * @param v
 * @returns
 */
export const flip = (v: number | NumberFunction) => {
  if (typeof v === `function`) v = v();
  throwNumberTest(v, `percentage`, `v`);
  return 1 - v;
};
