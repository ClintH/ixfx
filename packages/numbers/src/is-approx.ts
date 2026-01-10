import { numberTest, resultThrow, type Result } from "@ixfx/guards";
import { round } from "./round.js";

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
 * // True
 * isApprox(0.1, 100, 101);
 * isApprox(0.1, 100, 99);
 * isApprox(0.1, 100, 100);
 * 
 * // False
 * isApprox(0.1, 100, 98);
 * isApprox(0.1, 100, 102);
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
  resultThrow(numberTest(rangePercent, `percentage`, `rangePercent`));

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
  resultThrow(numberTest(baseValue, ``, `baseValue`));
  if (v === undefined) {
    return (value: number) => test(baseValue, value);
  } else {
    return test(baseValue, v);
  }
}

// export const isCloseTo = (a: number, b: number, precision = 3):Result<number,string> => {
//   const aa = a.toPrecision(precision);
//   const bb = b.toPrecision(precision);
//   if (aa !== bb) return [ false, `A is not close enough to B. A: ${ a } B: ${ b } Precision: ${ precision }` ];
//   else return [ true ];
// }

/**
 * Yields a function that checks if a value is close to any target value
 * ```js
 * const c = isCloseToAny(1, 10, 20, 30, 40);
 * c(11); // True - within 1 range of 10
 * c(19); // True - within 1 range of 20
 * c(0);  // False
 * ```
 * 
 * Returned function accepts multiple values, returning
 * _true_ if any of them are within range
 * ```js
 * c(0, 1, 11); // Would return true based on 11
 * ```
 * @param allowedRangeAbsolute 
 * @param targets 
 * @returns 
 */
export const isCloseToAny = (allowedRangeAbsolute: number, ...targets: number[]): (...values: number[]) => boolean => {
  const targetsMin = targets.map(t => t - allowedRangeAbsolute);
  const targetsMax = targets.map(t => t + allowedRangeAbsolute);

  return (...values: number[]) => {
    for (const v of values) {
      for (let index = 0; index < targets.length; index++) {
        if (v >= targetsMin[ index ] && v <= targetsMax[ index ]) return true;
      }
    }
    return false;
  }
}