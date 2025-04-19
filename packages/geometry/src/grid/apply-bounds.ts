import { clampIndex } from "@ixfx/numbers";
import { guardCell, guardGrid } from "./guards.js";
import type { GridBoundsLogic, GridCell, Grid } from "./types.js";

/**
 * Calculates a legal position for a cell based on
 * `grid` size and `bounds` wrapping logic.
 * @param grid 
 * @param cell 
 * @param wrap 
 * @returns 
 */
export const applyBounds = function (
  grid: Grid,
  cell: GridCell,
  wrap: GridBoundsLogic = `undefined`
): GridCell | undefined {
  guardGrid(grid, `grid`);
  guardCell(cell, `cell`);

  let x = cell.x;
  let y = cell.y;
  switch (wrap) {
    case `wrap`: {
      x = x % grid.cols;
      y = y % grid.rows;
      if (x < 0) x = grid.cols + x;
      else if (x >= grid.cols) {
        x -= grid.cols;
      }
      if (y < 0) y = grid.rows + y;
      else if (y >= grid.rows) {
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
    case `undefined`: {
      if (x < 0 || y < 0) return;
      if (x >= grid.cols || y >= grid.rows) return;
      break;
    }
    case `unbounded`: {
      break;
    }
    default: {
      throw new Error(`Unknown BoundsLogic '${ wrap }'. Expected: wrap, stop, undefined or unbounded`);
    }
  }
  return Object.freeze({ x, y });
};