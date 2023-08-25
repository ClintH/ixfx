export type NumberGuardRange =
  /**
   * No range checking
   */
  | ``
  /**
   * Can be any number, except zero
   */
  | `nonZero`
  | `positive`
  | `negative`
  /**
   * Must be above zero
   */
  | `aboveZero`
  | `belowZero`
  | `percentage`
  | `bipolar`;

type GuardResultOk = Readonly<readonly [true: boolean]>;
type GuardResultFail = Readonly<readonly [false: boolean, reason: string]>;
type GuardResult = GuardResultFail | GuardResultOk;

/**
 * Throws an error if `t` is not a number or within specified range.
 * Use an empty string for no special range constraints.
 * Alternatives: {@link integer} for additional integer check, {@link percent} for percentage-range.
 *
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
  if (value === null) return [false, `Parameter ${parameterName} is null`];
  if (typeof value === `undefined`) {
    return [false, `Parameter ${parameterName} is undefined`];
  }
  if (Number.isNaN(value)) {
    return [false, `Parameter '${parameterName}' is NaN`];
  }
  if (typeof value !== `number`) {
    return [false, `Parameter '${parameterName}' is not a number (${JSON.stringify(value)})`];
  }
  switch (range) {
    case `positive`: {
      if (value < 0) {
        return [false, `Parameter '${parameterName}' must be at least zero (${value})`];
      }
      break;
    } case `negative`: {
      if (value > 0) {
        return [false, `Parameter '${parameterName}' must be zero or lower (${value})`];
      }
      break;
    }
    case `aboveZero`: {
      if (value <= 0) {
        return [false, `Parameter '${parameterName}' must be above zero (${value})`]

      }
      break;
    }
    case `belowZero`: {
      if (value >= 0) {
        return [false, `Parameter '${parameterName}' must be below zero (${value})`];
      }
      break;
    }
    case `percentage`: {
      if (value > 1 || value < 0) {
        return [false, `Parameter '${parameterName}' must be in percentage range (0 to 1). (${value})`]
      }
      break;
    }
    case `nonZero`: {
      if (value === 0) {
        return [false, `Parameter '${parameterName}' must non-zero. (${value})`];
      }
      break;
    }
    case `bipolar`: {
      if (value > 1 || value < -1) {
        return [false, `Parameter '${parameterName}' must be in bipolar percentage range (-1 to 1). (${value})`];
      }
      break;
    }
  }
  return [true];
};

export const throwNumberTest = (value?: unknown,
  range: NumberGuardRange = ``,
  parameterName = `?`) => {
  throwFromResult(numberTest(value, range, parameterName));
}
/**
 * Test a number, returning _true_ if it passes, _false_ if not.
 * Compared to {@link number} which by default throws an exception.
 * @param value
 * @param range
 * @returns
 */
// export const numberTry = (
//   value?: number,
//   range: NumberGuardRange = ``
// ): boolean => {
//   return number(value, range, ``, false);
// };

/**
 * Throws if `value` is _undefined_ or _null_.
 * @param value
 * @param paramName
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nullUndef = (value: any, parameterName = `?`): GuardResult => {
  if (typeof value === `undefined`) {
    return [false, `${parameterName} param is undefined`];
  }
  if (value === null) return [false, `${parameterName} param is null`];
  return [true];
};

export const throwFromResult = (test: GuardResultFail | GuardResultOk) => {
  if (test[0]) return false;
  else throw new Error(test[1]);
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
 * Throws an error if `value` is not an integer, or does not meet guard criteria.
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
  if (!r[0]) return r;
  if (!Number.isInteger(value)) {
    return [false, `Parameter ${parameterName} is not an integer`];
  }
  return [true];
};

export const throwIntegerTest = (value: number | undefined,
  range: NumberGuardRange = ``,
  parameterName = `?`) => {
  throwFromResult(integerTest(value, range, parameterName));
}
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
    return r[0] ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
  return Number.parseInt(value);
};

/**
 * Returns true if parameter is an array of strings
 * @param value
 * @returns
 */
export const isStringArray = (value: unknown): boolean => {
  if (!Array.isArray(value)) return false;
  return !value.some((v) => typeof v !== `string`);
};

/**
 * Throws an error if parameter is not an array
 * @param value
 * @param paramName
 */
export const arrayTest = (value: unknown, parameterName = `?`): GuardResult => {
  if (!Array.isArray(value)) {
    return [false, `Parameter '${parameterName}' is expected to be an array'`];
  }
  return [true];
};

export const throwArrayTest = (value: unknown, parameterName = `?`) => {
  throwFromResult(arrayTest(value, parameterName));
}

/** Throws an error if parameter is not defined */
export const defined = <T>(argument: T | undefined): argument is T =>
  argument !== undefined;
