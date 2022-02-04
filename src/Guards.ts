
export type NumberGuardRange = `` | `positive` | `negative` | `aboveZero` | `belowZero` | `percentage` | `bipolar`;

/**
 * Throws an error if `t` is not a number or within specified range
 * @param t Value to check
 * @param name Name of parameter (for more helpful exception messages)
 * @param range Range to enforce
 * @returns 
 */
export const number = (t:number, range:NumberGuardRange = ``, name = `?`):boolean => {
  if (Number.isNaN(t)) throw new Error(`Parameter '${name}' is NaN`);
  if (typeof t !== `number`) throw new Error(`Parameter '${name}' does not have type of number`);
  switch (range) {
  case `positive`:
    if (t < 0) throw new Error(`Parameter ${name} must be at least zero`);
    break;
  case `negative`:
    if (t > 0) throw new Error(`Parameter ${name} must be zero or lower`);
    break;
  case `aboveZero`:
    if (t <= 0) throw new Error(`Parameter ${name} must be above zero`);
    break;
  case `belowZero`:
    if (t >= 0) throw new Error(`Parameter ${name} must be below zero`);
    break;
  case `percentage`:
    if (t > 1 || t < 0) throw new Error(`Parameter ${name} must be in percentage range (0 to 1)`);
    break;
  case `bipolar`:
    if (t > 1 || t < -1) throw new Error(`Parameter ${name} must be in bipolar percentage range (-1 to 1)`);
    break;
  }
  return true;
};

/**
 * Throws an error if `t` is not in the range of 0-1.
 * 
 * This is the same as calling ```number(t, `percentage`)```
 * @param t 
 * @param name 
 * @returns 
 */
export const percent = (t: number, name = `?`) => number(t, `percentage`, name);

/**
 * Throws an error if `t` is not an integer
 * @param t 
 * @param name 
 * @param range 
 */
export const integer = (t:number, range:NumberGuardRange = ``, name = `?`) => {
  number(t, range, name);
  if (!Number.isInteger(t)) throw new Error(`Paramter ${name} is not an integer`);
};

/**
 * Returns true if parameter is an array of strings
 * @param t 
 * @returns 
 */
export const isStringArray = (t:unknown):boolean => {
  if (!Array.isArray(t)) return false;
  return t.find(v => typeof v !== `string`) === undefined;
};

/**
 * Throws an error if parameter is not an array
 * @param t
 * @param name 
 */
export const array = (t: unknown, name = `?`): void => {
  if (!Array.isArray(t)) throw new Error(`Parameter '${name}' is expected to be an array'`);
};

/** Throws an error if parameter is not defined */
export const defined = <T>(argument: T | undefined): argument is T => argument !== undefined;
