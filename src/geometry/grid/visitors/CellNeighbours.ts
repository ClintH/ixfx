import { allDirections } from "../Directions.js";
import { neighbourList } from "../Neighbour.js";
import type { GridNeighbour, GridNeighbourSelectionLogic } from "../Types.js";

// export function* cellNeigbours(
//   grid: Grid,
//   cell: Cell,
//   bounds: BoundsLogic = `undefined`,
//   directions?: ReadonlyArray<CardinalDirection>
// ) {
//   const dirs = directions ?? allDirections;
//   const points = dirs.map((c) =>
//     offset(grid, cell, getVectorFromCardinal(c), bounds)
//   );
//   for (const pt of points) {
//     if (pt !== undefined) yield pt;
//   }
// }

export const neighboursLogic = (): GridNeighbourSelectionLogic => {
  return {
    select: (neighbours: readonly GridNeighbour[]) => {
      return neighbours.at(0);
    },
    getNeighbours: (grid, cell) => {
      return neighbourList(grid, cell, allDirections, `undefined`)
    }
  }
}
