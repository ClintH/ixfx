import type { Grid, GridCell, GridVisitorOpts, GridNeighbourSelectionLogic } from "../Types.js";
//import { visitor } from "./Visitor.js";

// export const visitorBreadth = (
//   grid: Grid,
//   start: Cell,
//   opts: VisitorOpts = {}
// ) =>
//   visitor(
//     {
//       select: (nbos) => nbos[ 0 ],
//     },
//     grid,
//     start,
//     opts
//   );

export const breadthLogic = (): GridNeighbourSelectionLogic => {
  return {
    select: (nbos) => nbos[ 0 ],
  }
}