import { mutable } from '../../../collections/set/index.js';
import { crossDirections } from "../Directions.js";
import { guardGrid, guardCell, isCell } from "../Guards.js";
import { cellEquals } from "../IsEqual.js";
import { neighbourList } from '../Neighbour.js';
import { cellKeyString } from "../ToString.js";
import type { GridNeighbourSelectionLogic, Grid, GridCell, GridVisitorOpts, GridNeighbour } from "../Types.js";

/**
 * Visits every cell in grid using supplied selection function
 * In-built functions to use: visitorDepth, visitorBreadth, visitorRandom,
 * visitorColumn, visitorRow.
 *
 * Usage example:
 * ```js
 *  let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell);
 *  for (let cell of visitor) {
 *   // do something with cell
 *  }
 * ```
 *
 * If you want to keep tabs on the visitor, pass in a {@link ISetMutable} instance. This gets
 * updated as cells are visited to make sure we don't visit the same one twice. If a set is not passed
 * in, one will be created internally.
 * ```js
 * let visited = new SetStringMutable<Grids.Cell>(c => Grids.cellKeyString(c));
 * let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell, visited);
 * ```
 *
 * To visit with some delay, try this pattern
 * ```js
 *  const delayMs = 100;
 *  const run = () => {
 *   let cell = visitor.next().value;
 *   if (cell === undefined) return;
 *   // Do something with cell
 *   setTimeout(run, delayMs);
 *  }
 *  setTimeout(run, delayMs);
 * ```
 * @param logic Logic for selecting next cell
 * @param grid Grid to visit
 * @param start Starting cell
 * @param opts Options
 * @returns Cells
 */
export function* visitByNeighbours(
  logic: GridNeighbourSelectionLogic,
  grid: Grid,
  opts: Partial<GridVisitorOpts> = {}
): Generator<GridCell> {
  guardGrid(grid, `grid`);
  const start = opts.start ?? { x: 0, y: 0 };

  guardCell(start, `opts.start`, grid);

  const v = opts.visited ?? mutable<GridCell>(cellKeyString);
  const possibleNeighbours = logic.getNeighbours ?? ((g: Grid, c: GridCell) => neighbourList(g, c, crossDirections, `undefined`));

  // if (!isCell(start)) {
  //   throw new Error(`'start' parameter is undefined or not a cell`);
  // }

  let cellQueue: Array<GridCell> = [ start ];
  let moveQueue: Array<GridNeighbour> = [];
  let current: GridCell | undefined = undefined;

  while (cellQueue.length > 0) {
    if (current === undefined) {
      const nv = cellQueue.pop();
      if (nv === undefined) {
        break;
      }
      current = nv;
    }

    if (!v.has(current)) {
      v.add(current);
      yield current;

      const nextSteps = possibleNeighbours(grid, current).filter(
        (step) => {
          if (step[ 1 ] === undefined) return false;
          return !v.has(step[ 1 ])
        }
      );

      if (nextSteps.length === 0) {
        // No more moves for this cell
        if (current !== undefined) {
          cellQueue = cellQueue.filter((cq) => cellEquals(cq, current));
        }
      } else {
        for (const n of nextSteps) {
          if (n === undefined) continue;
          if (n[ 1 ] === undefined) continue;
          moveQueue.push(n);
        }
      }
    }

    // Remove steps already made
    moveQueue = moveQueue.filter((step) => !v.has(step[ 1 ]));

    if (moveQueue.length === 0) {
      current = undefined;
    } else {
      // Pick move
      const potential = logic.select(moveQueue);
      if (potential !== undefined) {
        cellQueue.push(potential[ 1 ]);
        current = potential[ 1 ];
      }
    }
  }
};
