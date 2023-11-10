import { throwFromResult, integerTest } from "../Guards.js";

export function round(decimalPlaces: number, v: number): number;
export function round(decimalPlaces: number): (v: number) => number;

/**
 * Rounds a number.
 *
 * If one parameter is given, it's the decimal places,
 * and a rounding function is returned:
 * ```js
 * const r = round(2);
 * r(10.12355); // 10.12
 * ```
 *
 * If two parameters are given, the first is decimal places,
 * the second the value to round.
 * ```js
 * round(2, 10.12355); // 10.12
 * ```
 * @param decimalPlaces
 * @returns
 */
export function round(a: number, b?: number) {
  throwFromResult(integerTest(a, `positive`, `decimalPlaces`));

  //eslint-disable-next-line functional/no-let
  let rounder;
  if (a === 0) rounder = Math.round;
  else {
    const p = Math.pow(10, a);
    rounder = (v: number) => Math.floor(v * p) / p;
  }

  return b === undefined ? rounder : rounder(b);
}