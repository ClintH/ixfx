/**
 * Apples `fn` to every key of `obj` which is numeric.
 * ```js
 * const o = {
 *  name: 'john',
 *  x: 10,
 *  y: 20
 * };
 * const o2 = applyToValues(o, (v) => v * 2);
 * 
 * // Yields: { name: 'john', x: 20, y: 40 }
 * ```
 * @param obj 
 * @param apply 
 * @returns 
 */
export const applyToValues = <T extends Record<string, any>>(object: T, apply: (v: number) => number): T => {
  const o: T = { ...object };
  for (const [ key, value ] of Object.entries(object)) {
    if (typeof value === `number`) {
      // Run number through function
      //eslint-disable-next-line functional/immutable-data
      (o as any)[ key ] = apply(value);
    } else {
      // Copy value
      //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-unsafe-assignment
      (o as any)[ key ] = value;
    }
  }
  return o;
}