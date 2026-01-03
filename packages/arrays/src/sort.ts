import { arrayTest, resultThrow } from '@ixfx/guards';
/**
 * Sorts an array of objects in ascending order
 * by the given property name, assuming it is a number.
 *
 * ```js
 * const data = [
 *  { size: 10, colour: `red` },
 *  { size: 20, colour: `blue` },
 *  { size: 5, colour: `pink` }
 * ];
 * const sorted = Arrays.sortByNumericProperty(data, `size`);
 *
 * Yields items ascending order:
 * [ { size: 5, colour: `pink` }, { size: 10, colour: `red` }, { size: 20, colour: `blue` } ]
 * ```
 * @param data
 * @param propertyName
 * @throws {TypeError} If data is not an array
 */
export const sortByNumericProperty = <V, K extends keyof V>(
  data: readonly V[] | V[],
  propertyName: K
) => [ ...data ].sort((a, b) => {
  resultThrow(arrayTest(data, `data`));
  const av = a[ propertyName ];
  const bv = b[ propertyName ];
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
});

/**
 * Sorts an array of objects by some named property.
 * 
 * ```js
 * const data = [
 *  { size: 10, colour: `red` },
 *  { size: 20, colour: `blue` },
 *  { size: 5, colour: `pink` }
 * ];
 * sortByProperty(data, `colour`);
 * 
 * Yields [
 *  { size: 20, colour: `blue` },
 *  { size: 5, colour: `pink` }
 *  { size: 10, colour: `red` },
 * ]
 * ```
 * 
 * You can also provide a custom comparer that is passed property values.
 * This function should return 0 if values are equal, 1 if `a > b` and -1 if `a < b`.
 * @param data 
 * @param propertyName 
 * @throws {TypeError} If data is not an array
 * @returns 
 */
export const sortByProperty = <V, K extends keyof V>(
  data: readonly V[] | V[],
  propertyName: K,
  comparer?: (a: any, b: any) => number
) => [ ...data ].sort((a, b) => {
  resultThrow(arrayTest(data, `data`));

  const av = a[ propertyName ];
  const bv = b[ propertyName ];
  if (comparer === undefined) {
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  } else {
    return comparer(av, bv);
  }
});