import type { Grid, GridCell } from "../types.js";

import { isJaggedGrid } from "../guards.js";

/**
 * Enumerate rows of a grid as arrays of cell coordinates.
 *
 * Works with Uniform and Jagged grids. In the case of JaggedGrids, the returned rows might be of different lengths.
 * @param grid
 * @param startRow Starting row index, by default 0
 * @param endRowInclusive Ending row index, by default last row of grid (ie grid.rows -1)
 */
export function *rows(grid: Grid, startRow = 0, endRowInclusive?: number): Generator<GridCell[]> {
  if (isJaggedGrid(grid)) {
    const _endRow = endRowInclusive ?? grid.rows.length - 1;
    for (let y = startRow; y <= _endRow; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < grid.rows[y]; x++) {
        row.push({ x, y });
      }
      yield row;
    }
  } else {
    const _endRow = endRowInclusive ?? grid.rows - 1;
    for (let y = startRow; y <= _endRow; y++) {
      const row: GridCell[] = [];
      const colLimit = isJaggedGrid(grid) ? grid.rows[y] : grid.cols;
      for (let x = 0; x < colLimit; x++) {
        row.push({ x, y });
      }
      yield row;
    }
  }
}