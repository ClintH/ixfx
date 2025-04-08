/**
 * Returns _true_ if array contains duplicate instances.
 * Use {@link containsDuplicateValues} if you'd rather compare by value.
 * @param array 
 * @returns 
 */
export const containsDuplicateInstances = <V>(array: Array<V> | ReadonlyArray<V>): boolean => {
  if (!Array.isArray(array)) throw new Error(`Parameter needs to be an array`);
  for (let index = 0; index < array.length; index++) {
    for (let x = 0; x < array.length; x++) {
      if (index === x) continue;
      if (array[ index ] === array[ x ]) return true;
    }
  }
  return false;
}