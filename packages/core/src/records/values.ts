/**
 * Yields numerical values based on the an input of objects and the property to use.
 * 
 * ```js
 * const data = [
 *  { size: 10 },  { size: 20 }, { size: 0 }
 * ]
 * [...enumerateNumericalValues(data, `size`)]; // [ 10, 20, 0 ]
 * ```
 * 
 * If any of objects has a non numerical value for `propertyName`, a TypeError is thrown.
 * @param records 
 * @param propertyName 
 * @returns 
 */
export function* enumerateNumericalValues(records: Record<string, unknown>[], propertyName: string) {
  for (const rec of records) {
    const fieldValue = rec[ propertyName ];
    if (typeof fieldValue !== `number`) {
      throw new TypeError(`Property value was not a number. Property: ${ propertyName } Value: ${ fieldValue } Type: ${ typeof fieldValue }`);
    }
    yield fieldValue;
  }
}