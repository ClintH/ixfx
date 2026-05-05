import type { Grid, GridCell, GridNeighbour, GridNeighbourSelectionLogic, GridVisitorOpts } from "../types.js";
import { mutable } from '@ixfx/collections/set';
import { throwIfFailed } from "@ixfx/guards";
import { crossDirections } from "../directions.js";
import { testCell, testGrid } from "../guards.js";
import { cellEquals } from "../is-equal.js";
import { neighbourList } from '../neighbour.js';
import { cellKeyString } from "../to-string.js";

/**
 * Visits every cell in grid using supplied selection function.
 *
 * If you want a reusable 'visitor' function to use with different grids, use {@link create} instead.
 *
 * In-built functions to use: visitorDepth, visitorBreadth, visitorRandom,
 * visitorColumn, visitorRow.
 *
 * Usage example:
 *
 * ```js
 * let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell);
 * for (let cell of visitor) {
 *  // do something with cell
 * }
 * ```
 *
 * If you want to keep tabs on the visitor, pass in a @ixfx/collections.Sets.ISetMutable instance. This gets
 * updated as cells are visited to make sure we don't visit the same one twice. If a set is not passed
 * in, one will be created internally.
 *
 * ```js
 * let visited = new SetStringMutable<Grids.Cell>(c => Grids.cellKeyString(c));
 * let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell, visited);
 * ```
 *
 * To visit with some delay, try this pattern:
 *
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
 * @param opts Options
 * @returns Cells
 */
export function *visitByNeighbours(
  logic: GridNeighbourSelectionLogic,
  grid: Grid,
  opts: Partial<GridVisitorOpts> = {},
): Generator<GridCell> {
  throwIfFailed(testGrid(grid, `grid`));
  const start = opts.start ?? { x: 0, y: 0 };

  throwIfFailed(testCell(start, `opts.start`, grid));

  const v = opts.visited ?? mutable<GridCell>(cellKeyString);
  const possibleNeighbours = logic.getNeighbours ?? ((g: Grid, c: GridCell) => neighbourList(g, c, crossDirections, `undefined`));

  let cellQueue: GridCell[] = [start];
  let moveQueue: GridNeighbour[] = [];
  let current: GridCell | undefined;

  while (cellQueue.length > 0) {
    // Position to move from
    if (current === undefined) {
      const nv = cellQueue.pop();
      if (nv === undefined) {
        break;
      }
      current = nv;
    }

    // Check if we've visited cell before
    if (!v.has(current)) {
      // Nope!
      v.add(current);
      yield current;

      // Get possible moves from this new cell, ignoring ones we've already visited
      const nextSteps = possibleNeighbours(grid, current).filter(
        (step) => {
          if (step[1] === undefined)
            return false;
          return !v.has(step[1]);
        },
      );

      if (nextSteps.length === 0) {
        // No more moves for this cell
        if (current !== undefined) {
          cellQueue = cellQueue.filter(cq => cellEquals(cq, current));
        }
      } else {
        // Add all the moves to the queue
        for (const n of nextSteps) {
          if (n === undefined)
            continue;
          if (n[1] === undefined)
            continue;
          moveQueue.push(n);
        }
      }
    }

    // Remove steps already made
    moveQueue = moveQueue.filter(step => !v.has(step[1]));

    if (moveQueue.length === 0) {
      current = undefined;
    } else {
      // Pick move
      const potential = logic.select(moveQueue);
      if (potential !== undefined) {
        cellQueue.push(potential[1]);
        current = potential[1];
      }
    }
  }
};
