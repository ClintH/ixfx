/**
 * Computes the frequency of values by a grouping function.
 * ```js
 * const data = [1,2,3,4,5,6,7,8,9,10];
 * // Returns 'odd' or 'even' for an input value
 * 
 * const groupBy = v => v % 2 === 0 ? `even`:`odd`;
 * 
 * const data = frequencyByGroup(groupBy, data);
 * // Yields map with:
 * //  key: 'even', value: 5
 * //  key: 'odd', value: 5
 * @param groupBy 
 * @param data 
 * @returns 
 */
export const frequencyByGroup = <TValue, TGroup extends string | number>(groupBy: ((value: TValue) => TGroup), data: TValue[]): Map<TGroup, number> => {
  if (!Array.isArray(data)) throw new TypeError(`Param 'array' is expected to be an array. Got type: '${ typeof data }'`);
  const store = new Map<TGroup, number>();

  for (const value of data) {
    const group = groupBy(value);
    if (typeof group !== `string` && typeof group !== `number`) {
      throw new TypeError(`groupBy function is expected to return type string or number. Got type: '${ typeof group }' for value: '${ value }'`);
    }
    let groupValue = store.get(group);
    groupValue ??= 0;
    groupValue++;
    store.set(group, groupValue);
  }
  return store;
}