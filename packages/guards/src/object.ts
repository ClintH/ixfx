import type { Result } from "./types.js";

/**
 * Tests_if `value` is a plain object
 * 
 * ```js
 * isPlainObject(`text`); // false
 * isPlainObject(document); // false
 * isPlainObject({ hello: `there` }); // true
 * ```
 * @param value 
 * @returns 
 */
export const testPlainObject = (value: unknown): Result<object, string> => {
  if (typeof value !== `object` || value === null) return { success: false, error: `Value is null or not object type` };
  const prototype = Object.getPrototypeOf(value);
  const t = (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
  if (t) return { success: true, value };
  return { success: false, error: `Fancy object` };
}

/**
 * Tests if `value` is primitive value (bigint,number,string or boolean) or plain object
 * @param value 
 * @returns 
 */
export const testPlainObjectOrPrimitive = (value: unknown): Result<object | bigint | number | string | boolean, string> => {
  const t = typeof value;
  if (t === `symbol`) return { success: false, error: `Symbol type` };
  if (t === `function`) return { success: false, error: `Function type` };
  if (t === `bigint`) return { success: true, value: value as bigint };
  if (t === `number`) return { success: true, value: value as number };
  if (t === `string`) return { success: true, value: value as string };
  if (t === `boolean`) return { success: true, value: value as boolean };
  return testPlainObject(value);
}