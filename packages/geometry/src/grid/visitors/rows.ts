import type { Grid, GridCell, GridNeighbour, GridNeighbourSelectionLogic, GridVisitorOpts, JaggedGrid } from "../types.js";
import { lastCellRowwise } from "../geometry.js";
import { isJaggedGrid } from "../guards.js";

/**
 * Visit by following rows. Normal order is left-to-right, top-to-bottom.
 * @param options Options
 */
export function rowLogic(options: Partial<GridVisitorOpts> = {}): GridNeighbourSelectionLogic {
  const reversed = options.reversed ?? false;
  return {
    select: (nbos: readonly GridNeighbour[]) =>
      nbos.find(n => n[0] === (reversed ? `w` : `e`)),
    getNeighbours: reversed ? getNeighboursReverse : getNeighboursRegular,
  };
}

function getNeighboursReverse(grid: Grid, cell: GridCell): readonly GridNeighbour[] {
  if (isJaggedGrid(grid))
    return getNeighboursReverseJagged(grid, cell);

  // WALKING BACKWARD ALONG ROW
  if (cell.x > 0) {
    // All fine, step to the left
    cell = { x: cell.x - 1, y: cell.y };
  } else {
    // At the beginning of a row
    if (cell.y > 0) {
      // Wrap to next row up
      cell = { x: grid.cols - 1, y: cell.y - 1 };
    } else {
      // Wrap to end of grid
      cell = { x: grid.cols - 1, y: grid.rows - 1 };
    }
  }
  return [[`w`, cell]];
}

function getNeighboursRegular(grid: Grid, cell: GridCell): readonly GridNeighbour[] {
  if (isJaggedGrid(grid))
    return getNeighboursRegularJagged(grid, cell);
  // WALKING FORWARD ALONG ROWS, TOP-TO-BOTTOM
  if (cell.x < grid.rows - 1) {
    // All fine, step to the right
    cell = { x: cell.x + 1, y: cell.y };
  } else {
    // At the end of a row

    if (cell.y < grid.rows - 1) {
      // More rows available, wrap to next row down
      cell = { x: 0, y: cell.y + 1 };
    } else {
      // No more rows available, wrap to start of the grid
      cell = { x: 0, y: 0 };
    }
  }
  return [[`e`, cell]];
}

function getNeighboursRegularJagged(grid: JaggedGrid, cell: GridCell): readonly GridNeighbour[] {
  // WALKING ROW-WISE LEFT-TO-RIGHT, TOP-TO-BOTTOM
  // 0, 1
  // 2, 3, 4
  // 5
  let x = cell.x + 1;
  if (x < grid.rows[cell.y]) {
    // This row has the column, no problem
    return [[`e`, { x, y: cell.y }]];
  }

  // Need to wrap to next row
  x = 0;
  const y = cell.y + 1;
  if (y >= grid.rows.length) {
    // No more rows, wrap to start of grid
    return [[`e`, { x: 0, y: 0 }]];
  }
  return [[`e`, { x, y }]];
}

function getNeighboursReverseJagged(grid: JaggedGrid, cell: GridCell): readonly GridNeighbour[] {
  // WALKING BACKWARD ALONG ROW, BOTTOM-TO-TOP
  let x = cell.x - 1;
  let y = cell.y;
  if (x < 0) {
    // Beginning of row, wrap to higher row
    if (y <= 0) {
      // No more rows, wrap to end
      return [[`w`, lastCellRowwise(grid)]];
    }
    y--;
    x = grid.rows[y] - 1;
  }

  if (x >= 0 && x < grid.rows[y]) {
    // Column is valid for this row
    return [[`w`, { x, y }]];
  }
  return getNeighboursReverseJagged(grid, cell);
}