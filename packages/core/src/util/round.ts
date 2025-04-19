import { throwIntegerTest } from "@ixfx/guards";

export function round(decimalPlaces: number, v: number, roundUp?: boolean): number;
export function round(decimalPlaces: number, roundUp?: boolean): (v: number) => number;

/**
 * Rounds a number.
 *
 * If one parameter is given, it's the decimal places,
 * and a rounding function is returned:
 * ```js
 * import { round } from 'https://unpkg.com/ixfx/dist/numbers.js';
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
export function round(a: number, b?: number | boolean, roundUp?: boolean) {
  throwIntegerTest(a, `positive`, `decimalPlaces`);

  const up = (typeof b === `boolean`) ? b : (roundUp ?? false)
  let rounder;
  if (a === 0) {
    rounder = Math.round;
  } else {
    const p = Math.pow(10, a);
    if (up) {
      rounder = (v: number) => Math.ceil(v * p) / p;
    } else {
      rounder = (v: number) => Math.floor(v * p) / p;
    }
  }
  if (typeof b === `number`) return rounder(b);
  return rounder;
}

