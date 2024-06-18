/**
 * Returns _true_ if `value` is a plain object
 * 
 * ```js
 * isPlainObject(`text`); // false
 * isPlainObject(document); // false
 * isPlainObject({ hello: `there` }); // true
 * ```
 * @param value 
 * @returns 
 */
export const isPlainObject = (value: unknown) => {
  if (typeof value !== `object` || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}

/**
 * Returns _true_ if `value` is primitive value or plain object
 * @param value 
 * @returns 
 */
export const isPlainObjectOrPrimitive = (value: unknown) => {
  const t = typeof value;
  if (t === `symbol`) return false;
  if (t === `function`) return false;
  if (t === `bigint`) return true;
  if (t === `number`) return true;
  if (t === `string`) return true;
  if (t === `boolean`) return true;
  return isPlainObject(value);
}