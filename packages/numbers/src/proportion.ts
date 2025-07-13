import { numberTest, resultThrow } from "@ixfx/guards";

/**
 * Scales a percentage-scale number, ie: `v * t`.
 * The utility of this function is that it sanity-checks that
 *  both parameters are in the 0..1 scale.
 * @param v Value
 * @param t Scale amount
 * @returns Scaled value
 */
export const proportion = (
  v: number | (() => number),
  t: number | (() => number)
) => {
  if (typeof v === `function`) v = v();
  if (typeof t === `function`) t = t();

  resultThrow(
    numberTest(v, `percentage`, `v`),
    numberTest(t, `percentage`, `t`)
  );
  return v * t;
};
