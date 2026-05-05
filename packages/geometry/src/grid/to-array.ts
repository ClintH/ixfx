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
 *
 * If the input is a jagged grid, the returned array will be jagged as well.
 * @param grid Grid
 * @param initialValue Initial value
 * @returns
 */

import type { Grid } from "./types.js";
import { isJaggedGrid } from "./guards.js";

export function toArray2d<V>(grid: Grid, initialValue?: V): V[][] {
  if (isJaggedGrid(grid)) {
    const returnValue: V[][] = [];
    for (let row = 0; row < grid.rows.length; row++) {
      const colCount = grid.rows[row];
      returnValue[row] = Array.from<V>({ length: colCount });
      if (initialValue) {
        for (let col = 0; col < colCount; col++) {
          returnValue[row][col] = initialValue;
        }
      }
    }
    return returnValue;
  } else {
    const returnValue: V[][] = [];
    for (let row = 0; row < grid.rows; row++) {
      returnValue[row] = Array.from<V>({ length: grid.cols });
      if (initialValue) {
        for (let col = 0; col < grid.cols; col++) {
          returnValue[row][col] = initialValue;
        }
      }
    }
    return returnValue;
  }
}