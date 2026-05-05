import type { Grid, GridCell, GridNeighbourSelectionLogic, GridVisitorOpts } from "../types.js";
// import { visitor } from "./Visitor.js";

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

export function breadthLogic(): GridNeighbourSelectionLogic {
  return {
    select: nbos => nbos[0],
  };
}