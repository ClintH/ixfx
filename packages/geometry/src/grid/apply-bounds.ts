import type { Grid, GridBoundsLogic, GridCell, JaggedGrid, UniformGrid } from "./types.js";
import { resultThrow, throwIfFailed } from "@ixfx/guards";
import { clampIndex } from "@ixfx/numbers";
import { isJaggedGrid, testCell, testGrid, testJaggedGrid } from "./guards.js";

export function applyBounds(grid: Grid, cell: GridCell, wrap: GridBoundsLogic): GridCell;
export function applyBounds(grid: Grid, cell: GridCell): GridCell | undefined;
export function applyBounds(grid: Grid, cell: GridCell, wrap: `undefined`): GridCell | undefined;

/**
 * Calculates a legal position for a cell based on
 * `grid` size and `bounds` wrapping logic.
 *
 * May return _undefined_ if `wrap` is `undefined` (default) and `cell` is out of bounds.
 *
 * @param grid
 * @param cell
 * @param wrap
 */
export function applyBounds<T extends GridBoundsLogic>(grid: Grid, cell: GridCell, wrap?: T): GridCell | undefined {
  if (isJaggedGrid(grid)) {
    return applyBoundsJagged(grid, cell, wrap);
  } else {
    return applyBoundsUniform(grid, cell, wrap);
  }
}

function applyBoundsUniform<T extends GridBoundsLogic>(grid: UniformGrid, cell: GridCell, wrap?: T): GridCell | undefined {
  resultThrow(
    testGrid(grid, `grid`),
    testCell(cell, `cell`),
  );
  let x = cell.x;
  let y = cell.y;
  switch (wrap) {
    case `wrap`: {
      x = x % grid.cols;
      y = y % grid.rows;
      if (x < 0) {
        x = grid.cols + x;
      } else if (x >= grid.cols) {
        x -= grid.cols;
      }
      if (y < 0) {
        y = grid.rows + y;
      } else if (y >= grid.rows) {
        y -= grid.rows;
      }
      x = Math.abs(x);
      y = Math.abs(y);
      break;
    }
    case `stop`: {
      x = clampIndex(x, grid.cols);
      y = clampIndex(y, grid.rows);
      break;
    }
    case undefined:
    case `undefined`: {
      if (x < 0 || y < 0)
        return;
      if (x >= grid.cols || y >= grid.rows)
        return;
      break;
    }
    case `unbounded`: {
      break;
    }
    default: {
      throw new Error(`Unknown BoundsLogic '${wrap}'. Expected: 'wrap', 'stop', 'undefined' or 'unbounded'`);
    }
  }
  return Object.freeze({ x, y });
}

/**
 * Returns a legal position for a cell based on `grid` size and `bounds` wrapping logic.
 *
 * When wrapping for JaggedGrids, the row is wrapped first, and then column based on the number of columns for that row.
 * @param grid
 * @param cell
 * @param wrap
 */
function applyBoundsJagged<T extends GridBoundsLogic>(grid: JaggedGrid, cell: GridCell, wrap?: T): GridCell | undefined {
  throwIfFailed(
    testJaggedGrid(grid, `grid`),
    testCell(cell, `cell, grid`),
  );
  let x = cell.x;
  let y = cell.y;
  switch (wrap) {
    case `wrap`: {
      y = y % grid.rows.length;
      x = x % grid.rows[y];
      if (y < 0) {
        y = grid.rows.length + y;
      } else if (y >= grid.rows.length) {
        y -= grid.rows.length;
      }

      if (x < 0) {
        x = grid.rows[y] + x;
      } else if (x >= grid.rows[y]) {
        x -= grid.rows[y];
      }

      x = Math.abs(x);
      y = Math.abs(y);
      break;
    }
    case `stop`: {
      y = clampIndex(y, grid.rows);
      x = clampIndex(x, grid.rows[y]);
      break;
    }
    case undefined:
    case `undefined`: {
      if (x < 0 || y < 0)
        return;
      if (y >= grid.rows.length)
        return;
      if (x >= grid.rows[y])
        return;
      break;
    }
    case `unbounded`: {
      break;
    }
    default: {
      throw new Error(`Unknown BoundsLogic '${wrap}'. Expected: 'wrap', 'stop', 'undefined' or 'unbounded'`);
    }
  }
  return Object.freeze({ x, y });
}