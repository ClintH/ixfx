import { number as guardNumber } from '../Guards.js';
import { type NumberFunction } from './index.js';

/**
 * Scales a percentage-scale number, ie: `v * t`.
 * The utility of this function is that it sanity-checks that
 *  both parameters are in the 0..1 scale.
 * @param v Value
 * @param t Scale amount
 * @returns Scaled value
 */
export const proportion = (
  v: number | NumberFunction,
  t: number | NumberFunction
) => {
  if (typeof v === `function`) v = v();
  if (typeof t === `function`) t = t();

  guardNumber(v, `percentage`, `v`);
  guardNumber(t, `percentage`, `t`);
  return v * t;
};
