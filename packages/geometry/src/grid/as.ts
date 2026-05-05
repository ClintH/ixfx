import type { Grid, GridCell, JaggedGrid } from "./types.js";
import { resultThrow } from "@ixfx/guards";
import { cells } from "./enumerators/cells.js";
import { CellPlaceholder, isJaggedGrid, testCell, testGrid } from "./guards.js";

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
export function *rows(grid: Grid, start?: GridCell): Generator<GridCell[], void, unknown> {
  if (!start)
    start = { x: 0, y: 0 };
  resultThrow(testGrid(grid), testCell(start));

  let row = start.y;
  let rowCells: GridCell[] = [];

  for (const c of cells(grid, start)) {
    if (c.y === row) {
      rowCells.push(c);
    } else {
      yield rowCells;
      rowCells = [c];
      row = c.y;
    }
  }
  if (rowCells.length > 0)
    yield rowCells;
}

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
 *
 * In the case of jagged arrays, it might be that some rows don't have
 * column as long as its peers. In those cases, it returns {@link PlaceholderCell} ({x: NaN, y: NaN}) for those positions.
 * @param grid
 * @param start
 */
export function *columns(grid: Grid, start?: GridCell): Generator<GridCell[], void, unknown> {
  if (!start)
    start = { x: 0, y: 0 };
  resultThrow(testGrid(grid), testCell(start));

  if (isJaggedGrid(grid)) {
    const cols = getMaxColumnLength(grid);
    for (let x = start.x; x < cols; x++) {
      const colCells: GridCell[] = [];
      for (let y = start.y; y < grid.rows.length; y++) {
        if (x < grid.rows[y]) {
          colCells.push({ x, y });
        } else {
          colCells.push(CellPlaceholder);
        }
      }
      yield colCells;
    }
  } else {
    for (let x = start.x; x < grid.cols; x++) {
      const colCells: GridCell[] = [];
      for (let y = start.y; y < grid.rows; y++) {
        colCells.push({ x, y });
      }
      yield colCells;
    }
  }
}

export function getMaxColumnLength(grid: JaggedGrid): number {
  let cols = 0;
  for (const colCount of grid.rows) {
    if (colCount > cols)
      cols = colCount;
  }
  return cols;
}