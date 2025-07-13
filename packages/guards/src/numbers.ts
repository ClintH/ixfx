import { resultsCollate } from "./result.js";
import type { NumberGuardRange, Result } from "./types.js";

/**
 * Returns true if `x` is a power of two
 * @param x
 * @returns True if `x` is a power of two
 */
export const isPowerOfTwo = (x: number) => Math.log2(x) % 1 === 0;


/**
 * Returns `fallback` if `v` is NaN, otherwise returns `v`.
 * 
 * Throws if `v` is not a number type, null or undefined
 * @param v
 * @param fallback
 * @returns
 */
export const ifNaN = (v: unknown, fallback: number): number => {
  if (typeof v !== `number`) {
    throw new TypeError(`v is not a number. Got: ${ typeof v }`);
  }
  if (Number.isNaN(v)) return fallback;
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
  value: string | number | null,
  range: NumberGuardRange = ``,
  defaultValue: number = Number.NaN
): number => {
  if (typeof value === `undefined`) return defaultValue;
  if (value === null) return defaultValue;
  try {
    const parsed = Number.parseInt(typeof value === `number` ? value.toString() : value);
    const r = integerTest(parsed, range, `parsed`);
    return r.success ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
};


/**
 * Checks if `t` is not a number or within specified range.
 * Returns `[false, reason:string]` if invalid or `[true]` if valid.
 * Use {@link throwNumberTest} to throw an error rather than return result.
 * 
 * Alternatives: {@link integerTest} for additional integer check, {@link percentTest} for percentage-range.
 *
 * * (empty, default): must be a number type and not NaN.
 * * finite: must be a number, not NaN and not infinite
 * * positive: must be at least zero
 * * negative: must be zero or lower
 * * aboveZero: must be above zero
 * * belowZero: must be below zero
 * * percentage: must be within 0-1, inclusive
 * * nonZero: can be anything except zero
 * * bipolar: can be -1 to 1, inclusive
 * @param value Value to check
 * @param parameterName Name of parameter (for more helpful exception messages)
 * @param range Range to enforce
 * @returns
 */
export const numberTest = (
  value?: unknown,
  range: NumberGuardRange = ``,
  parameterName = `?`,
): Result<number, string> => {
  if (value === null) return { success: false, error: `Parameter '${ parameterName }' is null` };
  if (typeof value === `undefined`) {
    return { success: false, error: `Parameter '${ parameterName }' is undefined` };
  }
  if (Number.isNaN(value)) {
    return { success: false, error: `Parameter '${ parameterName }' is NaN` };
  }
  if (typeof value !== `number`) {
    return { success: false, error: `Parameter '${ parameterName }' is not a number (${ JSON.stringify(value) })` };
  }
  switch (range) {
    case `finite`: {
      if (!Number.isFinite(value)) {
        return { success: false, error: `Parameter '${ parameterName } must be finite (Got: ${ value })` };
      }
      break;
    }
    case `positive`: {
      if (value < 0) {
        return { success: false, error: `Parameter '${ parameterName }' must be at least zero (${ value })` };
      }
      break;
    } case `negative`: {
      if (value > 0) {
        return { success: false, error: `Parameter '${ parameterName }' must be zero or lower (${ value })` };
      }
      break;
    }
    case `aboveZero`: {
      if (value <= 0) {
        return {
          success: false, error: `Parameter '${ parameterName }' must be above zero (${ value })`
        };

      }
      break;
    }
    case `belowZero`: {
      if (value >= 0) {
        return { success: false, error: `Parameter '${ parameterName }' must be below zero (${ value })` };
      }
      break;
    }
    case `percentage`: {
      if (value > 1 || value < 0) {
        return {
          success: false, error: `Parameter '${ parameterName }' must be in percentage range (0 to 1). (${ value })`
        };
      }
      break;
    }
    case `nonZero`: {
      if (value === 0) {
        return { success: false, error: `Parameter '${ parameterName }' must non-zero. (${ value })` };
      }
      break;
    }
    case `bipolar`: {
      if (value > 1 || value < -1) {
        return { success: false, error: `Parameter '${ parameterName }' must be in bipolar percentage range (-1 to 1). (${ value })` };
      }
      break;
    }
  }
  return { success: true, value };
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
 * Alternatives: {@link integerTest} for additional integer check, {@link percentTest} for percentage-range.
 * @param value Value to test
 * @param range Range
 * @param parameterName Name of parameter 
 */
// export const throwNumberTest = (value?: unknown,
//   range: NumberGuardRange = ``,
//   parameterName = `?`) => {
//   throwFromResult(numberTest(value, range, parameterName));
// }

/**
 * Compares two numbers with a given number of decimal places
 * ```js
 * a: 10.123 b: 10.1    decimals: 1 = true
 * a: 10.123 b: 10.2    decimals: 0 = true
 * a: 10.123 b: 10.14   decimals: 1 = true
 * a: 10.123 b: 10.14   decimals: 2 = false
 * ``
 * @param a 
 * @param b 
 * @param decimals How many decimals to include
 * @returns 
 */
export const numberDecimalTest = (a: number, b: number, decimals = 3): Result<number, string> => {
  if (decimals === 0) {
    a = Math.floor(a);
    b = Math.floor(b);
    if (a === b) return { success: true, value: a };
    return { success: false, error: `A is not identical to B` };
  }

  const mult = Math.pow(10, decimals);
  const aa = Math.floor(a * mult);
  const bb = Math.floor(b * mult);
  if (aa !== bb) return { success: false, error: `A is not close enough to B. A: ${ a } B: ${ b } Decimals: ${ decimals }` };
  return { success: true, value: a }
}

/**
 * Returns test of `value` being in the range of 0-1.
 * Equiv to `number(value, `percentage`);`
 *
 * This is the same as calling ```number(t, `percentage`)```
 * @param value Value to check
 * @param parameterName Param name for customising exception message
 * @returns
 */
export const percentTest = (value: number, parameterName = `?`): Result<number, string> =>
  numberTest(value, `percentage`, parameterName);

// export const throwPercentTest = (value: number, parameterName = `?`) => {
//   throwFromResult(percentTest(value, parameterName));
//}
/**
 * Checks if `value` an integer and meets additional criteria.
 * See {@link numberTest} for guard details, or use that if integer checking is not required.
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
 * @param parameterName Param name for customising exception message
 * @param range Guard specifier.
 */
export const integerTest = (
  value: unknown,
  range: NumberGuardRange = ``,
  parameterName = `?`
): Result<number, string> => {
  return resultsCollate(
    numberTest(value, range, parameterName),
    () => {
      if (!Number.isInteger(value)) {
        return { success: false, error: `Param '${ parameterName }' is not an integer` };
      }
      return { success: true, value: value }
    }
  )
};

export const integerArrayTest = (numbers: Iterable<number>): Result<Iterable<number>, string> => {
  for (const v of numbers) {
    if (Math.abs(v) % 1 !== 0) return { success: false, error: `Value is not an integer: ${ v }` };
  }
  return { success: true, value: numbers };
};

/**
 * Returns _true_ if `value` is an integer in number or string form
 * @param value 
 * @returns 
 */
export const isInteger = (value: number | string): boolean => {
  if (typeof value === `string`) value = Number.parseFloat(value);
  const r = integerTest(value);
  return r.success;
}

// export const throwIntegerTest = (value: number | undefined,
//   range: NumberGuardRange = ``,
//   parameterName = `?`) => {
//   throwFromResult(integerTest(value, range, parameterName));
// }

export const numberInclusiveRangeTest = (value: number | undefined, min: number, max: number, parameterName = `?`): Result<number, string> => {
  if (typeof value !== `number`) {
    return { success: false, error: `Param '${ parameterName }' is not a number type. Got type: '${ typeof value }' value: '${ JSON.stringify(value) }'` };
  }
  if (Number.isNaN(value)) {
    return { success: false, error: `Param '${ parameterName }' is not within range ${ min }-${ max }. Got: NaN` };
  }
  if (Number.isFinite(value)) {
    if (value < min) {
      return { success: false, error: `Param '${ parameterName }' is below range ${ min }-${ max }. Got: ${ value }` };
    } else if (value > max) {
      return { success: false, error: `Param '${ parameterName }' is above range ${ min }-${ max }. Got: ${ value }` };
    }
    return { success: true, value };
  } else {
    return { success: false, error: `Param '${ parameterName }' is not within range ${ min }-${ max }. Got: infinite` };
  }
}

// export const throwNumberInclusiveRangeTest = (value: number | undefined, min: number, max: number, parameterName = `?`) => {
//   const r = numberInclusiveRangeTest(value, min, max, parameterName);
//   if (r[ 0 ]) return;
//   throw new Error(r[ 1 ]);
// }