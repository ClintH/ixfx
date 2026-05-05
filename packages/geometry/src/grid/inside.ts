import type { Grid, GridCell } from "./types.js";
import { isJaggedGrid } from "./guards.js";

/**
 * Returns _true_ if cell coordinates are above zero and within bounds of grid.
 *
 * @param grid
 * @param cell
 * @return True if cell is inside grid
 */
export function inside(grid: Grid, cell: GridCell): boolean {
  if (cell.x < 0 || cell.y < 0)
    return false;

  if (isJaggedGrid(grid)) {
    if (cell.y >= grid.rows.length)
      return false;
    if (cell.x >= grid.rows[cell.y])
      return false;
  } else {
    if (cell.y >= grid.rows)
      return false;
    if (cell.x >= grid.cols)
      return false;
  }
  return true;
}
