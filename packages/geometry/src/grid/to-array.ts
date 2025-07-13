
/**
 * Returns a two-dimensional array according to `grid`
 * size.
 *
 * ```js
 * const a = Grids.toArray({ rows: 3, cols: 2 });
 * Yields:
 * [ [_,_] ]
 * [ [_,_] ]
 * [ [_,_] ]
 * ```
 *
 * `initialValue` can be provided to set the value
 * for all cells.
 * @param grid Grid
 * @param initialValue Initial value
 * @returns
 */

import type { Grid } from "./types.js";

export const toArray2d = <V>(grid: Grid, initialValue?: V): V[][] => {
  const returnValue:V[][] = [];
  for (let row = 0; row < grid.rows; row++) {
    returnValue[ row ] = Array.from<V>({ length: grid.cols });
    if (initialValue) {
      for (let col = 0; col < grid.cols; col++) {
        returnValue[ row ][ col ] = initialValue;
      }
    }
  }
  return returnValue;
};