import { numberTest, resultThrow } from "@ixfx/guards";

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
export const flip = (v: number | (() => number)) => {
  if (typeof v === `function`) v = v();
  resultThrow(numberTest(v, `percentage`, `v`));
  return 1 - v;
};
