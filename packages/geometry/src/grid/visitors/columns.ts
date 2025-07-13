import type { GridNeighbour, GridNeighbourSelectionLogic, GridVisitorOpts } from "../types.js";

/**
 * Visits cells running down columns, left-to-right.
 * @param opts Options
 * @returns Visitor generator
 */
export const columnLogic = (opts: Partial<GridVisitorOpts> = {}): GridNeighbourSelectionLogic => {
  const reversed = opts.reversed ?? false;
  return {
    select: (nbos) => nbos.find((n) => n[ 0 ] === (reversed ? `n` : `s`)),
    getNeighbours: (grid, cell): ReadonlyArray<GridNeighbour> => {
      if (reversed) {
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
      } else {
        // WALK DOWN COLUMNS, LEFT-TO-RIGHT
        if (cell.y < grid.rows - 1) {
          // Easy case, move down by one
          cell = { x: cell.x, y: cell.y + 1 };
        } else {
          // End of column
          if (cell.x < grid.cols - 1) {
            // Move to next column and start at top
            cell = { x: cell.x + 1, y: 0 };
          } else {
            // Move to start of grid
            cell = { x: 0, y: 0 };
          }
        }
      }
      return [ [ reversed ? `n` : `s`, cell ] ];
    }
  }
}