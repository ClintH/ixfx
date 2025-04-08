import { integerArrayTest } from "./numbers.js";
import type { GuardResult } from "./types.js";

export type ExpectedOpts = {
  minInclusive?: number
  maxInclusive?: number
  minExclusive?: number
  maxExclusive?: number
};

export const rangeIntegerTest = (
  v: Iterable<number>,
  expected: ExpectedOpts
): GuardResult => {
  const r1 = rangeTest(v, expected);
  if (!r1[ 0 ]) return r1;
  return integerArrayTest(v);
};

/**
 * Inclusive range 4-6 = 4, 5, 6
 * Exclusive range 4-6 = 5
 * 
 * @param numbers 
 * @param expected 
 * @returns 
 */
export const rangeTest = (
  numbers: Iterable<number>,
  expected: ExpectedOpts
): GuardResult => {
  for (const v of numbers) {
    if (expected.minExclusive !== undefined) {
      if (v <= expected.minExclusive) {
        return [ false, `Value '${ v }' must be higher than minExclusive: '${ expected.minExclusive }'` ];
      }
    }
    if (expected.minInclusive !== undefined) {
      if (v < expected.minInclusive) {
        return [ false, `Value '${ v }' must be equal or higher than minInclusive: '${ expected.minInclusive }'` ];
      }
    }
    if (expected.maxExclusive !== undefined) {
      if (v >= expected.maxExclusive) {
        return [ false, `Value '${ v }' must be less than maxExclusive: '${ expected.maxExclusive }'` ];
      }
    }
    if (expected.maxInclusive !== undefined) {
      if (v > expected.maxInclusive) {
        return [ false, `Value '${ v }' must be equal or less than maxInclusive: '${ expected.maxInclusive }'` ];
      }
    }
  }
  return [ true ];
};