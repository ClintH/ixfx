import type { GridCell, Grid, GridReadable } from "./types.js";
import { cells } from "./enumerators/cells.js";

/**
 * Enumerate rows of grid, returning all the cells in the row
 * as an array
 *
 * ```js
 * for (const row of Grid.As.rows(shape)) {
 *  // row is an array of Cells.
 *  // [ {x:0, y:0}, {x:1, y:0} ... ]
 * }
 * ```
 * 
 * Use `Grid.values` to convert the returned iterator into values:
 * ```js
 * for (const v of Grid.values(Grid.rows(shape))) {
 * }
 * ```
 * @param grid
 * @param start
 */
export const rows = function* (grid: Grid, start?: GridCell): Generator<GridCell[], void, unknown> {
  if (!start) start = { x: 0, y: 0 }
  let row = start.y;
  let rowCells: Array<GridCell> = [];

  for (const c of cells(grid, start)) {
    if (c.y === row) {
      rowCells.push(c);
    } else {
      yield rowCells;
      rowCells = [ c ];
      row = c.y;
    }
  }
  if (rowCells.length > 0) yield rowCells;
};

/**
 * Enumerate columns of grid, returning all the cells in the
 * same column as an array.
 * 
 * ```js
 * for (const col of Grid.As.columns(grid)) {
 * }
 * ```
 * 
 * Use `Grid.values` to convert into values
 * ```js
 * for (const value of Grid.values(Grid.As.columns(grid))) {
 * }
 * ```
 * @param grid 
 * @param start 
 */
export function* columns(grid: Grid, start?: GridCell): Generator<GridCell[], void, unknown> {
  if (!start) start = { x: 0, y: 0 };
  for (let x = start.x; x < grid.cols; x++) {
    let colCells: Array<GridCell> = [];
    for (let y = start.y; y < grid.rows; y++) {
      colCells.push({ x, y });
    }
    yield colCells;
  }
}