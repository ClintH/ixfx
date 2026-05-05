import type { Grid, GridBoundsLogic, GridCell } from './types.js';
// import { clampIndex } from '@ixfx/numbers';
import { applyBounds } from './apply-bounds.js';

/**
 * Returns a coordinate offset from `start` by `vector` amount.
 *
 * Different behaviour can be specified for how to handle when coordinates exceed the bounds of the grid
 *
 * Note: x and y wrapping are calculated independently. A large wrapping of x, for example won't shift up/down a line.
 *
 * Use {@link Grids.applyBounds} if you need to calculate a wrapped coordinate without adding two together.
 * @param grid Grid to traverse
 * @param start Start point
 * @param vector Offset in x/y
 * @param bounds Bounds logic
 * @returns Cell
 */
export function offset(grid: Grid, start: GridCell, vector: GridCell, bounds: GridBoundsLogic = `undefined`): GridCell | undefined {
  return applyBounds(grid, {
    x: start.x + vector.x,
    y: start.y + vector.y,
  }, bounds);
}
