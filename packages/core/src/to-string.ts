
// Via Vuejs
// eslint-disable-next-line @typescript-eslint/unbound-method
const objectToString = Object.prototype.toString
const toTypeString = (value: unknown): string =>
  objectToString.call(value)
export const isMap = (value: unknown): value is Map<any, any> =>
  toTypeString(value) === `[object Map]`
export const isSet = (value: unknown): value is Set<any> =>
  toTypeString(value) === `[object Set]`

/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
export const toStringDefault = <V>(itemToMakeStringFor: V): string =>
  typeof itemToMakeStringFor === `string`
    ? itemToMakeStringFor
    : JSON.stringify(itemToMakeStringFor);

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultToString = (object: any): string => {
  //ECMA specification: http://www.ecma-international.org/ecma-262/6.0/#sec-tostring
  if (object === null) return `null`;
  if (typeof object === `boolean` || typeof object === `number`) {
    return object.toString();
  }

  if (typeof object === `string`) return object;
  if (typeof object === `symbol`) throw new TypeError(`Symbol cannot be converted to string`);
  return JSON.stringify(object);
};