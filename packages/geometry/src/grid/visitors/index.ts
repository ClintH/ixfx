import type { Grid, GridCell, GridNeighbourSelectionLogic, GridVisitorOpts } from '../types.js';
import { breadthLogic } from './breadth.js';
import { neighboursLogic } from './cell-neighbours.js';
import { columnLogic } from './columns.js';
import { depthLogic } from './depth.js';
import { randomContiguousLogic } from './random-contiguous.js';
import { randomLogic } from './random.js';
import { rowLogic } from './rows.js';
import { visitByNeighbours } from './visitor.js';

export * from './breadth.js';
export * from './cell-neighbours.js';
export * from './columns.js';
export * from './depth.js';
export * from './random-contiguous.js';
export * from './random.js';
export * from './rows.js';
export * from './step.js';
export * from './visitor.js';

export type VisitorTypes = `row` | `column` | `neighbours` | `breadth` | `depth` | `random` | `random-contiguous`;

/**
 * Returns a generator that iterates over cells with a given logic.
 * Once created, the same logic can be used on different grids - it is a pure function.
 *
 * ```js
 * const v = create(`random`); // Randomly visit cells
 * for (const cell of v(grid)) {
 *  // do something with cell
 * }
 * ```
 *
 * Logic types:
 * 'row': left-to-right, top-to-bottom
 * 'column': top-to-bottom, left-to-right
 * 'neighbours': neighbours surrounding cell (eight)
 * 'breadth': breadth-first
 * 'depth': depth-first
 * 'random': any random cell in grid
 * 'random-contiguous': any random cell neighbouring an already visited cell
 *
 * Under the hood it uses {@link createWithLogic}, but lets you specify the logic with a simple string.
 * @param type
 * @param opts
 */
export function create(type: VisitorTypes, opts: Partial<GridVisitorOpts> = {}): (grid: Grid, optionsOverride?: Partial<GridVisitorOpts>) => Generator<GridCell> {
  switch (type) {
    case `random-contiguous`:
      return createWithLogic(randomContiguousLogic(), opts);
    case `random`:
      return createWithLogic(randomLogic(), opts);
    case `depth`:
      return createWithLogic(depthLogic(), opts);
    case `breadth`:
      return createWithLogic(breadthLogic(), opts);
    case `neighbours`:
      return createWithLogic(neighboursLogic(), opts);
    case `row`:
      return createWithLogic(rowLogic(opts), opts);
    case `column`:
      return createWithLogic(columnLogic(opts), opts);
    default:
      throw new TypeError(`Param 'type' unknown. Value: ${type}`);
  }
}

/**
 * Returns a function which creates a generator to iterate over cells with a given logic. Use {@link create} to specify this logic with a string.
 *
 * This lower-level function is used if you have a custom {@link GridNeighbourSelectionLogic} implementation.
 * @param logic
 * @param options
 */
export function createWithLogic(logic: GridNeighbourSelectionLogic, options: Partial<GridVisitorOpts> = {}) {
  return (grid: Grid, optionsOverride: Partial<GridVisitorOpts> = {}): Generator<GridCell> => {
    return visitByNeighbours(logic, grid, { ...options, ...optionsOverride });
  };
}

// function isIterator<T>(v: any): v is Generator<T> {
//   if (typeof v !== `object`)
//     return false;
//   if (!(`next` in v))
//     return false;
//   if (!(`throw` in v))
//     return false;
//   if (!(`return` in v))
//     return false;
//   return true;
// }

// export function* withValues<T>(createOrIter: CreateVisitor | Generator<Cell>, grid: GridReadable<T>, opts: Partial<VisitorOpts>) {
//   const iter = isIterator(createOrIter) ? createOrIter : createOrIter(grid, opts)();
//   for (const cell of iter) {
//     yield { cell, value: grid.accessor(cell, `undefined`) }
//   }
// }

// export const byCells = (grid: Grid, options: Partial<VisitorOpts> = {}) => {
//   return (logic: NeighbourSelectionLogic, optionsOverride: Partial<VisitorOpts> = {}) => {
//     return visitByNeighbours(logic, grid, { ...options, ...optionsOverride });
//   }
// }

// export const byCellsLeftToRightTopToBottom = ():CreateVisitor => {
//   return (grid) => {
//     return cells(grid)
//   }
// }