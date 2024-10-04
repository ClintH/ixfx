import type { GridCell, Grid, GridNeighbour, GridNeighbourSelectionLogic, GridVisitorOpts } from "../Types.js";

/**
* Visit by following rows. Normal order is left-to-right, top-to-bottom.
* @param grid
* @param start
* @param opts
* @returns
*/
// export const visitorRow = (
//   grid: Grid,
//   start?: Cell,
//   opts: VisitorOpts = {}
// ) => {
//   if (!start) start = { x: 0, y: 0 }

//   const { reversed = false } = opts;

//   const select = (nbos: ReadonlyArray<Neighbour>) =>
//     nbos.find((n) => n[ 0 ] === (reversed ? `w` : `e`));

//   const getNeighbours = (
//     grid: Grid,
//     cell: Cell
//   ): ReadonlyArray<Neighbour> => {
//     if (reversed) {
//       // WALKING BACKWARD ALONG ROW
//       if (cell.x > 0) {
//         // All fine, step to the left
//         cell = { x: cell.x - 1, y: cell.y };
//       } else {
//         // At the beginning of a row
//         // eslint-disable-next-line unicorn/prefer-ternary
//         if (cell.y > 0) {
//           // Wrap to next row up
//           cell = { x: grid.cols - 1, y: cell.y - 1 };
//         } else {
//           // Wrap to end of grid
//           cell = { x: grid.cols - 1, y: grid.rows - 1 };
//         }
//       }
//     } else {
//       /*
//        * WALKING FORWARD ALONG ROWS
//        */
//       if (cell.x < grid.rows - 1) {
//         // All fine, step to the right
//         cell = { x: cell.x + 1, y: cell.y };
//       } else {
//         // At the end of a row
//         // eslint-disable-next-line unicorn/prefer-ternary
//         if (cell.y < grid.rows - 1) {
//           // More rows available, wrap to next row down
//           cell = { x: 0, y: cell.y + 1 };
//         } else {
//           // No more rows available, wrap to start of the grid
//           cell = { x: 0, y: 0 };
//         }
//       }
//     }
//     return [ [ reversed ? `w` : `e`, cell ] ];
//   };

//   const logic: NeighbourSelectionLogic = {
//     select,
//     getNeighbours,
//   };

//   return visitor(logic, grid, start, opts);
// };

export const rowLogic = (opts: Partial<GridVisitorOpts> = {}): GridNeighbourSelectionLogic => {
  const reversed = opts.reversed ?? false;
  //console.log(`rowLogic`, opts);
  return {
    select: (nbos: ReadonlyArray<GridNeighbour>) =>
      nbos.find((n) => n[ 0 ] === (reversed ? `w` : `e`)),
    getNeighbours: (
      grid: Grid,
      cell: GridCell
    ): ReadonlyArray<GridNeighbour> => {
      if (reversed) {
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
      } else {
        /*
         * WALKING FORWARD ALONG ROWS
         */
        if (cell.x < grid.rows - 1) {
          // All fine, step to the right
          cell = { x: cell.x + 1, y: cell.y };
        } else {
          // At the end of a row
          // eslint-disable-next-line unicorn/prefer-ternary
          if (cell.y < grid.rows - 1) {
            // More rows available, wrap to next row down
            cell = { x: 0, y: cell.y + 1 };
          } else {
            // No more rows available, wrap to start of the grid
            cell = { x: 0, y: 0 };
          }
        }
      }
      return [ [ reversed ? `w` : `e`, cell ] ];
    }
  }
}