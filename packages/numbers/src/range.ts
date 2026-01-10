import { scaler } from "./scale.js";
import type { NumberScaler, NumericRange } from "./types.js";


/**
 * Computes min/max based on a new value and previous range.
 * Returns existing object reference if value is within existing range.
 * 
 * If `value` is not a number, by default it will be ignored. Use the 'nonNumberHandling' param to set it
 * to throw an error instead if you want to catch that
 * @param value Value to compare against range
 * @param previous Previous range
 * @param nonNumberHandling 'skip' (default), non numbers are ignored; 'error' an error is thrown
 * @returns 
 */
export function rangeMergeValue(value: number | undefined, previous: NumericRange, nonNumberHandling: `skip` | `error` = `skip`): NumericRange {
  if (typeof value === `number`) {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      if (nonNumberHandling === `error`) throw new TypeError(`Param 'value' is NaN or infinite, and nonNumberHandling is set to 'error'`);
      return previous;
    }

    // Skip creating an object if it's in range
    if (value >= previous.min && value <= previous.max) return previous;

    // Return new range
    return {
      min: Math.min(value, previous.min),
      max: Math.max(value, previous.max),
    }
  } else if (nonNumberHandling === `error`) {
    throw new TypeError(`Param 'value' is not a number (type: '${ typeof value }') and nonNumberHandling is set to 'error'`);
  }
  return previous;
}

/**
 * Returns a function that scales values in a range, by default on 0..1 scale.
 * ```js
 * const range = { min: 10, max: 20 }
 * const s = rangeScaler(range);
 * s(15); // 0.5
 * ```
 * @param range Range to scale on
 * @param outMax Output range max. Default: 1
 * @param outMin Output range min. Default: 0
 * @param easing Easing function: Default: none
 * @param clamped Whether input values should be clamped if they exceed range. Default: true
 * @returns 
 */
export function rangeScaler(range: NumericRange, outMax = 1, outMin = 0, easing?: (v: number) => number, clamped = true): NumberScaler {
  return scaler(range.min, range.max, outMin, outMax, easing, clamped)
}

/**
 * Expands a range to encompass a new range.
 * Returns `existingRange` if `newRange` is within it.
 * @param newRange 
 * @param existingRange 
 * @returns 
 */
export function rangeMergeRange(newRange: NumericRange, existingRange: NumericRange): NumericRange {
  if (newRange.max <= existingRange.max && newRange.min >= existingRange.min) return existingRange;
  return {
    min: Math.min(newRange.min, existingRange.min),
    max: Math.max(newRange.max, existingRange.max)
  }
}

/**
 * Returns an empty range:
 * ```js
 * { 
 *  min: Number.MAX_SAFE_INTEGER, 
 *  max: Number.MIN_SAFE_INTEGER 
 * }
 * ```
 * @returns 
 */
export const rangeInit = (): NumericRange => ({ min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER });

/**
 * Returns _true_ if ranges `a` and `b` have identical min/max values.
 * Returns _false_ if not, or if either/both values are _undefined_
 * @param a 
 * @param b 
 * @returns 
 */
export const rangeIsEqual = (a: NumericRange | undefined, b: NumericRange | undefined): boolean => {
  if (typeof a === `undefined`) return false;
  if (typeof b === `undefined`) return false;
  return (a.max === b.max && a.min === b.min);
}

/**
 * Returns _true_ if range 'a' is within or same as range 'b'.
 * Returns _false_ if not or if either/both ranges are _undefined_
 * @param a 
 * @param b 
 * @returns 
 */
export const rangeIsWithin = (a: NumericRange | undefined, b: NumericRange | undefined): boolean => {
  if (typeof a === `undefined`) return false
  if (typeof b === `undefined`) return false
  if (a.min >= b.min && a.max <= b.max) return true;
  return false;
}

/**
 * Keeps track of min/max values.
 * 
 * ```js
 * const s = rangeStream();
 * s.seen(10);  // { min: 10, max: 10}
 * s.seen(5);   // { min:5, max: 10}
 * ```
 * 
 * When calling `seen`, non-numbers, or non-finite numbers are silently ignored.
 * 
 * ```js
 * s.reset();   // Reset
 * s.min/s.max; // Current min/max
 * s.range;     // Current { min, max }
 * ```
 * @param initWith 
 * @returns 
 */
export const rangeStream = (initWith: NumericRange = rangeInit()): {
  seen: (v: any) => {
    min: number;
    max: number;
  }; reset: () => void; readonly range: {
    min: number;
    max: number;
  }; readonly min: number; readonly max: number;
} => {
  let { min, max } = initWith;
  const seen = (v: any): {
    min: number;
    max: number;
  } => {
    if (typeof v === `number`) {
      if (!Number.isNaN(v) && Number.isFinite(v)) {
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
    }
    return { min, max }
  }
  const reset = (): void => {
    min = Number.MAX_SAFE_INTEGER;
    max = Number.MIN_SAFE_INTEGER;
  }

  return {
    seen, reset,
    get range(): {
      min: number;
      max: number;
    } {
      return { min, max }
    },
    get min(): number {
      return min;
    },
    get max(): number {
      return max;
    }
  }
}

/**
 * Iterates over `values` finding the min/max.
 * By default non-numbers, as well as NaN and infinite values are skipped.
 * @param values 
 * @param nonNumberHandling 
 * @returns 
 */
export function rangeCompute(values: Iterable<any>, nonNumberHandling: `skip` | `error` = `skip`): NumericRange {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let position = 0;
  for (const v of values) {
    if (typeof v === `number`) {
      if (Number.isNaN(v) || !Number.isFinite(v)) {
        if (nonNumberHandling === `error`) throw new Error(`Value NaN or infinite at position: ${ position }`);
        continue;
      }
    } else {
      if (nonNumberHandling === `error`) throw new Error(`Contains non number value. Type: '${ typeof v }' Position: ${ position }`);
      continue;
    }
    if (v < min) min = v;
    if (v > max) max = v;
    position++;
  }
  return { min, max };
}
