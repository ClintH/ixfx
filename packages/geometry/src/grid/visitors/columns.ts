import type { Grid, GridCell, GridNeighbour, GridNeighbourSelectionLogic, GridVisitorOpts, JaggedGrid } from "../types.js";
import { findIndex, findIndexReverse } from "@ixfx/arrays";
import { lastCellColumnwise } from "../geometry.js";
import { isJaggedGrid } from "../guards.js";

/**
 * Visits cells running down columns, left-to-right.
 * When `reverse` option is provided, we go up columns, right-to-left instead.
 *
 * The `getNeigbours` function only ever returns a single cell.
 *
 * Returns an object with two functions, all of which are pure functions.
 * That is, the result of `columnLogic` has no internal state.
 * @param opts Options
 * @returns Visitor generator
 */
export function columnLogic(opts: Partial<GridVisitorOpts> = {}): GridNeighbourSelectionLogic {
  const reversed = opts.reversed ?? false;
  return {
    select: nbos => nbos.find(n => n[0] === (reversed ? `n` : `s`)),
    getNeighbours: (reversed ? getNeighboursReverse : getNeighboursRegular),
  };
}

function getNeighboursRegular(grid: Grid, cell: GridCell): readonly GridNeighbour[] {
  if (isJaggedGrid(grid))
    return getNeighboursRegularJagged(grid, cell);

  // WALK DOWN COLUMNS, LEFT-TO-RIGHT
  const rows = grid.rows;
  if (cell.y < rows - 1) {
    // Easy case, move down by one
    cell = { x: cell.x, y: cell.y + 1 };
  } else {
    // End of column
    const nextCol = cell.x + 1;
    if (cell.x < grid.cols - 1) {
      // Move to next column and start at top
      cell = { x: nextCol, y: 0 };
    } else {
      // Move to start of grid
      cell = { x: 0, y: 0 };
    }
  }
  return [[`s`, cell]];
}

function getNeighboursRegularJagged(grid: JaggedGrid, cell: GridCell): readonly GridNeighbour[] {
  // WALK DOWN COLUMNS, LEFT-TO-RIGHT
  // Jagged grid
  // 0,
  // 2, 3, 4
  // 5, X
  const rows = grid.rows.length;
  let y = cell.y;
  let x = cell.x;
  if (cell.y < rows - 1) {
    // Move down one row
    y++;
  } else {
    // No more rows, move to next column
    y = 0;
    x++;
  }

  // Check validity of column
  if (x >= grid.rows[y]) {
    // Row doesn't have this column
    if (y >= rows) {
      // Reset
      return [[`s`, { x: 0, y: 0 }]];
    }

    // Skip ahead to next row with this column
    y = findIndex(grid.rows, colCount => colCount > x, y);
    if (y === -1) {
      // No more rows with this column, reset
      return [[`s`, { x: 0, y: 0 }]];
    }
  }
  return [[`s`, { x, y }]];
}
function getNeighboursReverseJagged(grid: JaggedGrid, cell: GridCell): readonly GridNeighbour[] {
  // WALK UP COLUMNS, RIGHT-TO-LEFT
  // Jagged grid
  // 0, 1
  // 2, 3, 4
  // 5
  const rows = grid.rows.length;
  let y = cell.y;
  let x = cell.x;
  if (cell.y > 0) {
    // Not at top, move up one row
    y--;
  } else {
    // At the top, move to bottom of next column
    x--;
    y = rows - 1;
  }

  if (x < 0) {
    // No more columns, reset to last cell
    return [[`n`, lastCellColumnwise(grid)]];
  }

  // Check validity of column
  if (x < grid.rows[y]) {
    // All good
    return [[`n`, { x, y }]];
  }

  // Not enough columns in this row. Skip up to next
  y = findIndexReverse(grid.rows, colCount => colCount > x, y);
  if (y > -1) {
    // All good
    return [[`n`, { x, y }]];
  }

  // Can't find another row with this column, need to move back one column and start from beginning
  return getNeighboursReverseJagged(grid, { x: x - 1, y: rows - 1 });
}

function getNeighboursReverse(grid: Grid, cell: GridCell): readonly GridNeighbour[] {
  if (isJaggedGrid(grid))
    return getNeighboursReverseJagged(grid, cell);

  // WALK UP COLUMN, RIGHT-TO-LEFT
  if (cell.y > 0) {
    // Easy case
    cell = { x: cell.x, y: cell.y - 1 };
  } else {
    // Top of column
    if (cell.x === 0) {
      // Top-left corner, need to wrap
      cell = { x: grid.cols - 1, y: grid.rows - 1 };
    } else {
      cell = { x: cell.x - 1, y: grid.rows - 1 };
    }
  }
  return [[`n`, cell]];
}