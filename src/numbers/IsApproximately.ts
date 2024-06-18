import { throwNumberTest } from "../util/GuardNumbers.js";
import { round } from "./Round.js";

export function isApproximately(
  baseValue: number,
  rangePercent: number
): (v: number) => boolean;

export function isApproximately(
  baseValue: number,
  rangePercent: number,
  v: number
): boolean;

/**
 * Returns a function that yields _true_ if a value is within
 * a percentage range of a base value.
 *
 * ```js
 * // Allow 10% above or below
 * const closeTo100 = isApproximately(100, 0.1); // returns a function
 * closeTo100(100); // true
 * closeTo100(101); // true;
 * closeTo100(90); // true;
 * closeTo100(80); // false;
 * ```
 *
 * `isApproximately` returns a function, but if a third value is provided,
 * it returns true/false, testing the value:
 * ```js
 * isApproximately(100, 0.1, 101); // True
 * ```
 * If the tested value is not a number, _false_ is returned
 * (because it is not, in fact approximately `baseValue`).
 *
 * For baseValues between -2 and 2, the calculated difference is rounded down
 * to 5 decimal places to avoid weird JS floating point math.
 * @param baseValue
 * @param rangePercent
 * @returns
 */
export function isApproximately(
  baseValue: number,
  rangePercent: number,
  v?: number
) {
  throwNumberTest(rangePercent, `percentage`, `rangePercent`);
  throwNumberTest(baseValue, ``, `baseValue`);

  const diff = baseValue * rangePercent;
  const test = (v: number): boolean => {
    try {
      throwNumberTest(v, ``, `v`);

      //eslint-disable-next-line functional/no-let
      let diffV = Math.abs(v - baseValue);
      if (Math.abs(baseValue) <= 2) {
        diffV = round(5, diffV);
      }
      return diffV <= diff;
    } catch {
      return false;
    }
  };

  return v === undefined ? test : test(v);
}
