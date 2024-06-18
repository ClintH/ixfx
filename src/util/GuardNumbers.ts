import { throwFromResult } from "./GuardThrowFromResult.js";
import type { GuardResult, NumberGuardRange } from "./GuardTypes.js";

/**
 * Returns true if `x` is a power of two
 * @param x
 * @returns True if `x` is a power of two
 */
export const isPowerOfTwo = (x: number) => Math.log2(x) % 1 === 0;


/**
 * Returns `fallback` if `v` is NaN, otherwise returns `v`.
 *
 * Throws if `v` is not a number type.
 * @param v
 * @param fallback
 * @returns
 */
export const ifNaN = (v: number, fallback: number): number => {
  // ✔️ Unit tested

  if (Number.isNaN(v)) return fallback;
  if (typeof v !== `number`) {
    throw new TypeError(`v is not a number. Got: ${ typeof v }`);
  }
  return v;
};

/**
 * Parses `value` as an integer, returning it if it meets the `range` criteria.
 * If not, `defaultValue` is returned.
 *
 * ```js
 * const i = integerParse('10', 'positive');    // 10
 * const i = integerParse('10.5', 'positive');  // 10
 * const i = integerParse('0', 'nonZero', 100); // 100
 * ```
 *
 * NaN is returned if criteria does not match and no default is given
 * ```js
 * const i = integerParse('10', 'negative');    // NaN
 * ```
 *
 * @param value
 * @param range
 * @param defaultValue
 * @returns
 */
export const integerParse = (
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  range: NumberGuardRange = ``,
  defaultValue: number = Number.NaN
): number => {
  // ✔️ Unit tested
  if (value === undefined) return defaultValue;
  if (value === null) return defaultValue;
  try {
    const parsed = Number.parseInt(value);
    const r = integerTest(parsed, range, `parsed`);
    return r[ 0 ] ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
  return Number.parseInt(value);
};


/**
 * Checks if `t` is not a number or within specified range.
 * Returns `[false, reason:string]` if invalid or `[true]` if valid.
 * Use {@link throwNumberTest} to throw an error rather than return result.
 * 
 * Alternatives: {@link integer} for additional integer check, {@link percent} for percentage-range.
 *
 * * (empty, default): must be a number type and not NaN.
 * * positive: must be at least zero
 * * negative: must be zero or lower
 * * aboveZero: must be above zero
 * * belowZero: must be below zero
 * * percentage: must be within 0-1, inclusive
 * * nonZero: can be anything except zero
 * * bipolar: can be -1 to 1, inclusive
 * @param value Value to check
 * @param paramName Name of parameter (for more helpful exception messages)
 * @param range Range to enforce
 * @returns
 */
export const numberTest = (
  value?: unknown,
  range: NumberGuardRange = ``,
  parameterName = `?`,
): GuardResult => {
  if (value === null) return [ false, `Parameter '${ parameterName }' is null` ];
  if (typeof value === `undefined`) {
    return [ false, `Parameter '${ parameterName }' is undefined` ];
  }
  if (Number.isNaN(value)) {
    return [ false, `Parameter '${ parameterName }' is NaN` ];
  }
  if (typeof value !== `number`) {
    return [ false, `Parameter '${ parameterName }' is not a number (${ JSON.stringify(value) })` ];
  }
  switch (range) {
    case `positive`: {
      if (value < 0) {
        return [ false, `Parameter '${ parameterName }' must be at least zero (${ value })` ];
      }
      break;
    } case `negative`: {
      if (value > 0) {
        return [ false, `Parameter '${ parameterName }' must be zero or lower (${ value })` ];
      }
      break;
    }
    case `aboveZero`: {
      if (value <= 0) {
        return [ false, `Parameter '${ parameterName }' must be above zero (${ value })` ]

      }
      break;
    }
    case `belowZero`: {
      if (value >= 0) {
        return [ false, `Parameter '${ parameterName }' must be below zero (${ value })` ];
      }
      break;
    }
    case `percentage`: {
      if (value > 1 || value < 0) {
        return [ false, `Parameter '${ parameterName }' must be in percentage range (0 to 1). (${ value })` ]
      }
      break;
    }
    case `nonZero`: {
      if (value === 0) {
        return [ false, `Parameter '${ parameterName }' must non-zero. (${ value })` ];
      }
      break;
    }
    case `bipolar`: {
      if (value > 1 || value < -1) {
        return [ false, `Parameter '${ parameterName }' must be in bipolar percentage range (-1 to 1). (${ value })` ];
      }
      break;
    }
  }
  return [ true ];
};

/**
 * Checks if `t` is not a number or within specified range.
 * Throws if invalid. Use {@link numberTest} to test without throwing.
 *
* * (empty, default): must be a number type and not NaN.
* * positive: must be at least zero
* * negative: must be zero or lower
* * aboveZero: must be above zero
* * belowZero: must be below zero
* * percentage: must be within 0-1, inclusive
* * nonZero: can be anything except zero
* * bipolar: can be -1 to 1, inclusive
* 
 * Alternatives: {@link integer} for additional integer check, {@link percent} for percentage-range.
 * @param value Value to test
 * @param range Range
 * @param parameterName Name of parameter 
 */
export const throwNumberTest = (value?: unknown,
  range: NumberGuardRange = ``,
  parameterName = `?`) => {
  throwFromResult(numberTest(value, range, parameterName));
}

/**
 * Returns test of `value` being in the range of 0-1.
 * Equiv to `number(value, `percentage`);`
 *
 * This is the same as calling ```number(t, `percentage`)```
 * @param value Value to check
 * @param paramName Param name for customising exception message
 * @returns
 */
export const percentTest = (value: number, parameterName = `?`): GuardResult =>
  numberTest(value, `percentage`, parameterName);

export const throwPercentTest = (value: number, parameterName = `?`) => {
  throwFromResult(percentTest(value, parameterName));
}
/**
 * Checks if `value` an integer and meets additional criteria.
 * See {@link number} for guard details, or use that if integer checking is not required.
 *
 * Note:
 * * `bipolar` will mean -1, 0 or 1.
 * * positive: must be at least zero
 * * negative: must be zero or lower
 * * aboveZero: must be above zero
 * * belowZero: must be below zero
 * * percentage: must be within 0-1, inclusive
 * * nonZero: can be anything except zero
 * @param value Value to check
 * @param paramName Param name for customising exception message
 * @param range Guard specifier.
 */
export const integerTest = (
  value: number | undefined,
  range: NumberGuardRange = ``,
  parameterName = `?`
): GuardResult => {
  // ✔️ Unit tested
  const r = numberTest(value, range, parameterName);
  if (!r[ 0 ]) return r;
  if (!Number.isInteger(value)) {
    return [ false, `Parameter ${ parameterName } is not an integer` ];
  }
  return [ true ];
};

export const throwIntegerTest = (value: number | undefined,
  range: NumberGuardRange = ``,
  parameterName = `?`) => {
  throwFromResult(integerTest(value, range, parameterName));
}
