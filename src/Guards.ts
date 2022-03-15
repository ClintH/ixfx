
export type NumberGuardRange = 
/**
 * No range checking
 */
  `` | 
  /**
   * Can be any number, except zero
   */
  `nonZero` | 
  `positive` | 
  `negative` | 
  /**
   * Must be above zero
   */
  `aboveZero` | 
  `belowZero` | 
  `percentage` | 
  `bipolar`;

/**
 * Throws an error if `t` is not a number or within specified range. 
 * Alternatives: {@link integer} for additional integer check, {@link percentage}.
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
export const number = (value:number, range:NumberGuardRange = ``, paramName = `?`):boolean => {
  if (Number.isNaN(value)) throw new Error(`Parameter '${paramName}' is NaN`);
  if (typeof value !== `number`) throw new Error(`Parameter '${paramName}' is not a number (${value})`);
  switch (range) {
  case `positive`:
    if (value < 0) throw new Error(`Parameter '${paramName}' must be at least zero (${value})`);
    break;
  case `negative`:
    if (value > 0) throw new Error(`Parameter '${paramName}' must be zero or lower (${value})`);
    break;
  case `aboveZero`:
    if (value <= 0) throw new Error(`Parameter '${paramName}' must be above zero (${value})`);
    break;
  case `belowZero`:
    if (value >= 0) throw new Error(`Parameter '${paramName}' must be below zero (${value})`);
    break;
  case `percentage`:
    if (value > 1 || value < 0) throw new Error(`Parameter '${paramName}' must be in percentage range (0 to 1). (${value})`);
    break;
  case `nonZero`:
    if (value === 0) throw new Error(`Parameter '${paramName}' must non-zero. (${value})`);
    break;
  case `bipolar`:
    if (value > 1 || value < -1) throw new Error(`Parameter '${paramName}' must be in bipolar percentage range (-1 to 1). (${value})`);
    break;
  }
  return true;
};

/**
 * Throws an error if `value` is not in the range of 0-1.
 * Equiv to `number(value, `percentage`);`
 * 
 * This is the same as calling ```number(t, `percentage`)```
 * @param value Value to check
 * @param paramName Param name for customising exception message
 * @returns 
 */
export const percent = (value: number, paramName = `?`) => number(value, `percentage`, paramName);

/**
 * Throws an error if `value` is not an integer, or does not meet guard criteria.
 * See {@link number} for guard details, or use that if integer checking is not required.
 * @param value Value to check
 * @param paramName Param name for customising exception message
 * @param range Guard specifier.
 */
export const integer = (value:number, range:NumberGuardRange = ``, paramName = `?`) => {
  // Unit tested
  number(value, range, paramName);
  if (!Number.isInteger(value)) throw new Error(`Paramter ${paramName} is not an integer`);
};

/**
 * Returns true if parameter is an array of strings
 * @param value 
 * @returns 
 */
export const isStringArray = (value:unknown):boolean => {
  if (!Array.isArray(value)) return false;
  return value.find(v => typeof v !== `string`) === undefined;
};

/**
 * Throws an error if parameter is not an array
 * @param value
 * @param paramName 
 */
export const array = (value: unknown, paramName = `?`): void => {
  if (!Array.isArray(value)) throw new Error(`Parameter '${paramName}' is expected to be an array'`);
};

/** Throws an error if parameter is not defined */
export const defined = <T>(argument: T | undefined): argument is T => argument !== undefined;
