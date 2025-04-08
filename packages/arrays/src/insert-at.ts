/**
 * Inserts `values` at position `index`, shuffling remaining
 * items further down.
 * @param data 
 * @param index 
 * @param values 
 * @returns 
 */
export const insertAt = <V>(
  data: readonly V[] | V[],
  index: number,
  ...values: V[]
): V[] => {
  if (!Array.isArray(data)) {
    throw new TypeError(`Param 'data' is not an arry`);
  }
  return [ ...data.slice(0, index), ...values, ...data.slice(index + 1) ];
};