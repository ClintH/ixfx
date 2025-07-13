import type { Grid, GridCell } from "./types.js";

/**
 * Returns _true_ if cell coordinates are above zero and within bounds of grid
 *
 * @param grid
 * @param cell
 * @return
 */
export const inside = (grid: Grid, cell: GridCell): boolean => {
  if (cell.x < 0 || cell.y < 0) return false;
  if (cell.x >= grid.cols || cell.y >= grid.rows) return false;
  return true;
};


