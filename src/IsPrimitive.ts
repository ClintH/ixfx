import type { Primitive, PrimitiveOrObject } from "./PrimitiveTypes.js";

/**
 * Returns _true_ if `value` is number, string, bigint or boolean.
 * Returns _false_ if `value` is an object, null, undefined
 * @param value Value to check
 * @returns _True_ if value is number, string, bigint or boolean.
 */
export function isPrimitive(value: any): value is Primitive {
  if (typeof value === `number`) return true;
  if (typeof value === `string`) return true;
  if (typeof value === `bigint`) return true;
  if (typeof value === `boolean`) return true;
  return false;
}

export function isPrimitiveOrObject(value: any): value is PrimitiveOrObject {
  if (isPrimitive(value)) return true;
  if (typeof value === `object`) return true;
  return false;
}