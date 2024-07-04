/**
 * Inserts `values` at position `index`, shuffling remaining
 * items further down.
 * @param data 
 * @param index 
 * @param values 
 * @returns 
 */
export const insertAt = <V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  data: ReadonlyArray<V> | Array<V>,
  index: number,
  ...values: Array<V>
): Array<V> => {
  if (!Array.isArray(data)) {
    throw new TypeError(`Param 'data' is not an arry`);
  }
  return [ ...data.slice(0, index), ...values, ...data.slice(index + 1) ];
};