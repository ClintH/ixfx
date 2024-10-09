import { randomNeighbour } from "../Neighbour.js";
import type { GridNeighbour, GridNeighbourSelectionLogic } from "../Types.js";
import { cells } from "../enumerators/Cells.js";

// export const visitorRandom = (
//   grid: Grid,
//   start: Cell,
//   opts: VisitorOpts = {}
// ) =>
//   visitor(
//     ,
//     grid,
//     start,
//     opts
//   );

export const randomLogic = (): GridNeighbourSelectionLogic => {
  return {
    getNeighbours: (grid, cell) => {
      const t: Array<GridNeighbour> = [];
      for (const c of cells(grid, cell)) {
        t.push([ `n`, c ]);
      }
      return t;
    },
    select: randomNeighbour,
  }
}