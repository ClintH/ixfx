/**
 * Returns a 'flattened' copy of array, un-nesting arrays one level
 * ```js
 * flatten([1, [2, 3], [[4]] ]);
 * // Yields: [ 1, 2, 3, [4]];
 * ```
 * @param array
 * @returns
 */
export const flatten = (array: ReadonlyArray<any> | Array<any>): Array<any> =>
  [ ...array ].flat();