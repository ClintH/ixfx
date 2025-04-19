//import { clampIndex } from '@ixfx/numbers';
import { applyBounds } from './apply-bounds.js';
//import { guardCell, guardGrid } from './guards.js';
import type { Grid, GridCell, GridBoundsLogic } from './types.js';

/**
 * Returns a coordinate offset from `start` by `vector` amount.
 *
 * Different behaviour can be specified for how to handle when coordinates exceed the bounds of the grid
 *
 * Note: x and y wrapping are calculated independently. A large wrapping of x, for example won't shift up/down a line.
 * 
 * Use {@link Grids.applyBounds} if you need to calculate a wrapped coordinate without adding two together.
 * @param grid Grid to traverse
 * @param vector Offset in x/y
 * @param start Start point
 * @param bounds
 * @returns Cell
 */
export const offset = function (
  grid: Grid,
  start: GridCell,
  vector: GridCell,
  bounds: GridBoundsLogic = `undefined`
): GridCell | undefined {
  return applyBounds(grid, {
    x: start.x + vector.x,
    y: start.y + vector.y
  }, bounds)
  // guardCell(start, `start`, grid);
  // guardCell(vector);
  // guardGrid(grid, `grid`);

  // // eslint-disable-next-line functional/no-let
  // let x = start.x;
  // // eslint-disable-next-line functional/no-let
  // let y = start.y;
  // switch (bounds) {
  //   case `wrap`: {
  //     x += vector.x % grid.cols;
  //     y += vector.y % grid.rows;
  //     if (x < 0) x = grid.cols + x;
  //     else if (x >= grid.cols) {
  //       x -= grid.cols;
  //     }
  //     if (y < 0) y = grid.rows + y;
  //     else if (y >= grid.rows) {
  //       y -= grid.rows;
  //     }
  //     break;
  //   }
  //   case `stop`: {
  //     x += vector.x;
  //     y += vector.y;
  //     x = clampIndex(x, grid.cols);
  //     y = clampIndex(y, grid.rows);
  //     break;
  //   }
  //   case `undefined`: {
  //     x += vector.x;
  //     y += vector.y;
  //     if (x < 0 || y < 0) return;
  //     if (x >= grid.cols || y >= grid.rows) return;
  //     break;
  //   }
  //   case `unbounded`: {
  //     x += vector.x;
  //     y += vector.y;
  //     break;
  //   }
  //   default: {
  //     // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  //     throw new Error(`Unknown BoundsLogic case ${ bounds }`);
  //   }
  // }
  // return Object.freeze({ x, y });
};

