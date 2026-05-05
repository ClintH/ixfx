import type { Grid, GridBoundsLogic, GridCell, JaggedGrid, UniformGrid } from "./types.js";
import { integerTest, resultThrow } from "@ixfx/guards";
import { applyBounds, applyBoundsJagged } from "./apply-bounds.js";
import { isJaggedGrid, testCell, testGrid, testJaggedGrid } from "./guards.js";

export function indexFromCell(grid: Grid, cell: GridCell, wrap: `undefined`): number | undefined;
export function indexFromCell(grid: Grid, cell: GridCell, wrap: GridBoundsLogic): number;

/**
 * Returns the index for a given cell in a UniformGrid.
 * This is useful if a grid is stored in an array.
 *
 * ```js
 * const data = [
 *  1, 2,
 *  3, 4,
 *  5, 6
 * ];
 *
 * // Get index for cell {x: 1, y: 1} (ie. second column, second row)
 * const index = indexFromCell({ rows: 2, cols: 2}, {x: 1, y: 1}); // Yields 3
 * console.log(data[index]); // Yields 4
 * ```
 *
 * Bounds logic is applied to cell.x/y separately. Wrapping
 * only ever happens in same col/row.
 * @see cellFromIndex
 * @param grid Grid
 * @param cell Cell to get index for
 * @param wrap Logic for if we hit bounds of grid
 */
export function indexFromCell(grid: Grid, cell: GridCell, wrap: GridBoundsLogic): number | undefined {
  if (isJaggedGrid(grid))
    return indexFromCellJagged(grid, cell, wrap);
  else
    return indexFromCellUniform(grid, cell, wrap);
}

export function indexFromCellUniform(grid: UniformGrid, cell: GridCell, wrap: GridBoundsLogic): number | undefined {
  resultThrow(testGrid(grid), testCell(cell));
  if (wrap === `unbounded`)
    throw new Error(`Wrap logic "unbounded" not supported for indexFromCell`);
  const cellBounded = applyBounds(grid, cell, wrap);
  if (cellBounded === undefined)
    return;

  return cellBounded.y * grid.cols + cellBounded.x;
}

// export function indexFromCellOld(grid: UniformGrid, cell: GridCell, wrap: GridBoundsLogic): number | undefined {
//   resultThrow(testGrid(grid, `grid`));

//   if (cell.x < 0) {
//     switch (wrap) {
//       case `stop`: {
//         cell = { ...cell, x: 0 };
//         break;
//       }
//       case `unbounded`: {
//         throw new Error(`unbounded not supported`);
//       }
//       case `undefined`: {
//         return undefined;
//       }
//       case `wrap`: {
//         // cell = { ...cell, x: grid.cols + cell.x };
//         cell = offset(grid, { x: 0, y: cell.y }, { x: cell.x, y: 0 }, `wrap`)!;
//         break;
//       }
//     }
//   }
//   if (cell.y < 0) {
//     switch (wrap) {
//       case `stop`: {
//         cell = { ...cell, y: 0 };
//         break;
//       }
//       case `unbounded`: {
//         throw new Error(`unbounded not supported`);
//       }
//       case `undefined`: {
//         return undefined;
//       }
//       case `wrap`: {
//         cell = { ...cell, y: grid.rows + cell.y };
//         break;
//       }
//     }
//   }
//   if (cell.x >= grid.cols) {
//     switch (wrap) {
//       case `stop`: {
//         cell = { ...cell, x: grid.cols - 1 };
//         break;
//       }
//       case `unbounded`: {
//         throw new Error(`unbounded not supported`);
//       }
//       case `undefined`: {
//         return undefined;
//       }
//       case `wrap`: {
//         cell = { ...cell, x: cell.x % grid.cols };
//         break;
//       }
//     }
//   }
//   if (cell.y >= grid.rows) {
//     switch (wrap) {
//       case `stop`: {
//         cell = { ...cell, y: grid.rows - 1 };
//         break;
//       }
//       case `unbounded`: {
//         throw new Error(`unbounded not supported`);
//       }
//       case `undefined`: {
//         return undefined;
//       }
//       case `wrap`: {
//         cell = { ...cell, y: cell.y % grid.rows };
//         break;
//       }
//     }
//   }

//   const index = cell.y * grid.cols + cell.x;

//   return index;
// }

export function cellFromIndexUniform(colsOrGrid: number | UniformGrid, index: number): GridCell {
  let cols = 0;
  cols = typeof colsOrGrid === `number` ? colsOrGrid : colsOrGrid.cols;
  resultThrow(integerTest(cols, `aboveZero`, `colsOrGrid`));

  return {
    x: index % cols,
    y: Math.floor(index / cols),
  };
}

/**
 * Returns an index for a given cell in a JaggedGrid.
 * This is useful if a grid is stored in an array. Assumes rows are stored end-to-end.
 * @param grid
 * @param cell
 * @param wrap
 */
export function indexFromCellJagged(grid: JaggedGrid, cell: GridCell, wrap: GridBoundsLogic): number | undefined {
  resultThrow(testJaggedGrid(grid), testCell(cell));
  const cellBounded = applyBoundsJagged(grid, cell, wrap);
  if (cellBounded === undefined)
    return;

  if (wrap === `unbounded`)
    throw new Error(`Wrap logic "unbounded" not supported for indexFromCell`);

  let count = 0;
  for (let i = 0; i < cellBounded.y; i++) {
    count += grid.rows[i];
  }
  count += cellBounded.x;
  return count;
}

/**
 * Returns the grid cell that corresponds to a given index in a JaggedGrid. Assumes rows are stored end-to-end.
 * @param grid
 * @param index
 */
export function cellFromIndexJagged(grid: JaggedGrid, index: number): GridCell | undefined {
  resultThrow(testJaggedGrid(grid));
  let remaining = index;
  for (let i = 0; i < grid.rows.length; i++) {
    if (remaining < grid.rows[i]) {
      return { x: remaining, y: i };
    }
    remaining -= grid.rows[i];
  }
}