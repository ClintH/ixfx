import { randomNeighbour } from "../Neighbour.js";
import type { GridNeighbourSelectionLogic } from "../Types.js";

// export const visitorRandomContiguous = (
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
export const randomContiguousLogic = (): GridNeighbourSelectionLogic => {
  return {
    select: randomNeighbour,
  }
}