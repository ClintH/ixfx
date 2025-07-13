import type { GridNeighbourSelectionLogic } from "../types.js";

// export const visitorDepth = (grid: Grid, start: Cell, opts: VisitorOpts = {}) =>
//   visitor(
//     {
//       select: (nbos) => nbos.at(-1),
//     },
//     grid,
//     start,
//     opts
//   );

export const depthLogic = (): GridNeighbourSelectionLogic => {
  return {
    select: (nbos) => nbos.at(-1)
  }
}