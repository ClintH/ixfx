import { throwIntegerTest } from "@ixfx/guards";
import { guardCell, guardGrid } from "../guards.js";
import type { Grid, GridCell, GridVisitorOpts, GridCreateVisitor } from "../types.js";

/**
 * Runs the provided `visitor` for `steps`, returning the cell we end at
 * ```js
 * // Create visitor & stepper
 * const visitor = Grids.Visit.create(`row`);
 * const stepper = Grids.Visit.stepper(grid, visitor);
 * 
 * // Step by 10
 * stepper(10); // GridCell {x,y}
 * 
 * // Step by another 2
 * stepper(2);
 * ```
 * @param grid Grid to traverse
 * @param start Start point
 * @param createVisitor Visitor function
 * @returns
 */
export const stepper = (
  grid: Grid,
  createVisitor: GridCreateVisitor,
  start: GridCell = { x: 0, y: 0 },
  resolution = 1
) => {
  guardGrid(grid, `grid`);
  guardCell(start, `start`);
  throwIntegerTest(resolution, ``, `resolution`)

  // Create a list of steps
  const steps: GridCell[] = [];
  let count = 0;
  let position = 0;
  for (const c of createVisitor(grid, { start, boundsWrap: `undefined` })) {
    count++;
    if ((count % resolution) !== 0) continue;
    steps.push(c);
  }

  return (step: number, fromStart = false) => {
    throwIntegerTest(step, ``, `step`)
    if (fromStart) position = step;
    else position += step;
    //position = position % steps.length;
    return steps.at(position % steps.length);

  }
}

// export const step = (
//   grid: Grid,
//   start: Cell,
//   steps: number,
//   createVisitor: CreateVisitor
// ): Cell => {
//   throwIntegerTest(steps, ``, `steps`);

//   const opts: Partial<VisitorOpts> = {
//     reversed: steps < 0,
//     start
//   };
//   steps = Math.abs(steps);

//   let c = start;
//   let v = createVisitor(grid, opts);
//   v.next(); // Burn up starting cell

//   let stepsMade = 0;

//   while (stepsMade < steps) {
//     stepsMade++;
//     const { value } = v.next();
//     if (value) {
//       c = value;
//       if (opts.debug) {
//         console.log(
//           `stepsMade: ${ stepsMade } cell: ${ c.x }, ${ c.y } reverse: ${ opts.reversed }`
//         );
//       }
//     } else {
//       if (steps >= grid.cols * grid.rows) {
//         steps -= grid.cols * grid.rows;
//         stepsMade = 0;
//         v = createVisitor(grid, opts);
//         v.next();
//         c = start;
//         if (opts.debug) console.log(`resetting visitor to ${ steps }`);
//       } else throw new Error(`Value not received by visitor`);
//     }
//   }
//   return c;
// };
