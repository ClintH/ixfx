import { throwIntegerTest } from "@ixfxfun/guards";
import { guardGrid } from "./guards.js";
import { offset } from "./offset.js";
import type { Grid, GridCell, GridBoundsLogic } from "./types.js";

/**
 * Returns the index for a given cell.
 * This is useful if a grid is stored in an array.
 *
 * ```js
 * const data = [
 *  1, 2,
 *  3, 4,
 *  5, 6 ];
 * const cols = 2; // Grid of 2 columns wide
 * const index = indexFromCell(cols, {x: 1, y: 1});
 * // Yields an index of 3
 * console.log(data[index]); // Yields 4
 * ```
 *
 * Bounds logic is applied to cell.x/y separately. Wrapping
 * only ever happens in same col/row.
 * @see cellFromIndex
 * @param grid Grid
 * @param cell Cell to get index for
 * @param wrap Logic for if we hit bounds of grid
 * @returns
 */
export const indexFromCell = (
  grid: Grid,
  cell: GridCell,
  wrap: GridBoundsLogic
): number | undefined => {
  guardGrid(grid, `grid`);

  if (cell.x < 0) {
    switch (wrap) {
      case `stop`: {
        cell = { ...cell, x: 0 };
        break;
      }
      case `unbounded`: {
        throw new Error(`unbounded not supported`);
      }
      case `undefined`: {
        return undefined;
      }
      case `wrap`: {
        //cell = { ...cell, x: grid.cols + cell.x };
        cell = offset(grid, { x: 0, y: cell.y }, { x: cell.x, y: 0 }, `wrap`)!;
        break;
      }
    }
  }
  if (cell.y < 0) {
    switch (wrap) {
      case `stop`: {
        cell = { ...cell, y: 0 };
        break;
      }
      case `unbounded`: {
        throw new Error(`unbounded not supported`);
      }
      case `undefined`: {
        return undefined;
      }
      case `wrap`: {
        cell = { ...cell, y: grid.rows + cell.y };
        break;
      }
    }
  }
  if (cell.x >= grid.cols) {
    switch (wrap) {
      case `stop`: {
        cell = { ...cell, x: grid.cols - 1 };
        break;
      }
      case `unbounded`: {
        throw new Error(`unbounded not supported`);
      }
      case `undefined`: {
        return undefined;
      }
      case `wrap`: {
        cell = { ...cell, x: cell.x % grid.cols };
        break;
      }
    }
  }
  if (cell.y >= grid.rows) {
    switch (wrap) {
      case `stop`: {
        cell = { ...cell, y: grid.rows - 1 };
        break;
      }
      case `unbounded`: {
        throw new Error(`unbounded not supported`);
      }
      case `undefined`: {
        return undefined;
      }
      case `wrap`: {
        cell = { ...cell, y: cell.y % grid.rows };
        break;
      }
    }
  }

  const index = cell.y * grid.cols + cell.x;

  return index;
};

/**
 * Returns x,y from an array index.
 *
 * ```js
 *  const data = [
 *   1, 2,
 *   3, 4,
 *   5, 6 ];
 *
 * // Cols of 2, index 2 (ie. data[2] == 3)
 * const cell = cellFromIndex(2, 2);
 * // Yields: {x: 0, y: 1}
 * ```
 * @see indexFromCell
 * @param colsOrGrid
 * @param index
 * @returns
 */
export const cellFromIndex = (
  colsOrGrid: number | Grid,
  index: number
): GridCell => {
  let cols = 0;
  cols = typeof colsOrGrid === `number` ? colsOrGrid : colsOrGrid.cols;
  throwIntegerTest(cols, `aboveZero`, `colsOrGrid`);

  return {
    x: index % cols,
    y: Math.floor(index / cols),
  };
};