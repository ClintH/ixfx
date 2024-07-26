import { numberTest, throwNumberTest } from "../util/GuardNumbers.js";
import { round } from "./Round.js";

/**
 * Returns a function that checks if a value is within range of a base value
 * ```js
 * const tenPercent = isApprox(0.1);
 * // Check if 101 is within 10% range of 100
 * tenPercent(100, 101); 
 * ```
 * @param rangePercent 
 */
export function isApprox(
  rangePercent: number
): (baseValue: number, value: number) => boolean;

/**
 * Returns a function to check if a value is within range of a base value
 * ```js
 * const close = isApprox(0.1, 100);
 * // Check if 101 is within 10% range of 100
 * close(101);
 * ```
 * @param rangePercent 
 * @param baseValue 
 */
export function isApprox(
  rangePercent: number,
  baseValue: number,
): (value: number) => boolean;

/**
 * Returns _true/false_ if `value` is within `rangePercent` of `baseValue`.
 * 
 * ```js
 * isApprox(0.1, 100, 101);
 * ```
 * @param rangePercent 
 * @param baseValue 
 * @param value 
 */
export function isApprox(
  rangePercent: number,
  baseValue: number,
  value: number
): boolean;


/**
 * Checks if a value is within range of a base value
 * 
 * ```js
 * // Check if 101 is within 10% of 100
 * isApprox(0.1, 100, 101);
 * 
 * // Gets a function to compare some value of 10% range to 100
 * const c = isApprox(0.1,100);
 * c(101);
 * 
 * // Gets a function to compare some base value and value to 10% range
 * const c = isApprox(0.1);
 * c(100, 101);
 * ```
 * 
 * Throws an error if range or base values are NaN.
 * If value being checked is NaN or infinity, _false_ is returned.
 * @param rangePercent 
 * @param baseValue 
 * @param v 
 * @returns 
 */
export function isApprox(
  rangePercent: number,
  baseValue?: number,
  v?: number
) {
  throwNumberTest(rangePercent, `percentage`, `rangePercent`);

  // Round percentages to avoid floating point nonsense
  const range = Math.floor(rangePercent * 100);
  const test = (base: number, value: number): boolean => {
    try {
      if (typeof value !== `number`) return false;
      if (Number.isNaN(value)) return false;
      if (!Number.isFinite(value)) return false;

      // Round value
      const diff = Math.abs(value - base)
      const relative = base === 0 ? Math.floor(diff * 100) : Math.floor((diff / base) * 100);
      //console.log(`v: ${ value } base: ${ base } rel: ${ relative } range: ${ range } diff: ${ diff }`);
      return relative <= range;
    } catch {
      return false;
    }
  };

  if (baseValue === undefined) return test;
  throwNumberTest(baseValue, ``, `baseValue`);
  if (v === undefined) {
    return (value: number) => test(baseValue, value);
  } else {
    return test(baseValue, v);
  }
}
