import { randomNeighbour } from "../neighbour.js";
import type { GridNeighbourSelectionLogic } from "../types.js";

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