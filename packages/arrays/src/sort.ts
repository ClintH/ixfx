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

export const sortByProperty = <V, K extends keyof V>(
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