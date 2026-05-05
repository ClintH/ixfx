import type { Grid, GridCell } from "./types.js";
import { isJaggedGrid } from "./guards.js";

/**
 * Returns a key string for a cell instance
 * A key string allows comparison of instances by value rather than reference
 *
 * ```js
 * cellKeyString({x:10,y:20});
 * // Yields: "Cell{10,20}";
 * ```
 * @param v
 */
export const cellKeyString = (v: GridCell): string => `Cell{${v.x},${v.y}}`;

/**
 * Returns a string representation of the grid, handy for debugging.
 *
 * @param grid
 */
export function gridString(grid: Grid): string {
  if (isJaggedGrid(grid)) {
    return `{ rows: ${grid.rows.join(`,`)}}`;
  } else {
    return `{ cols: ${grid.cols} rows: ${grid.rows}}`;
  }
}