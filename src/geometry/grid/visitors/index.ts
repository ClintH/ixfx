import type { GridCell, GridCreateVisitor, Grid, GridReadable, GridNeighbourSelectionLogic, GridVisitorOpts } from '../Types.js';
import { breadthLogic } from './Breadth.js';
import { neighboursLogic } from './CellNeighbours.js';
import { columnLogic } from './Columns.js';
import { depthLogic } from './Depth.js';
import { randomLogic } from './Random.js';
import { randomContiguousLogic } from './RandomContiguous.js';
import { rowLogic } from './Rows.js';
import { visitByNeighbours } from './Visitor.js';

export * from './Breadth.js';
export * from './CellNeighbours.js';
export * from './Columns.js';
export * from './Depth.js';
export * from './Step.js';
export * from './Random.js';
export * from './RandomContiguous.js';
export * from './Rows.js';
export * from './Visitor.js';

export type VisitorTypes = `row` | `column` | `neighbours` | `breadth` | `depth` | `random` | `random-contiguous`

/**
 * Logic types:
 * * 'row': left-to-right, top-to-bottom
 * * 'column': top-to-bottom, left-to-right
 * * 'neighbours': neighbours surrounding cell (eight)
 * * 'breadth`: breadth-first
 * * 'depth': depth-first
 * * 'random': any random cell in grid
 * * 'random-contiguous': any random cell neighbouring an already visited cell
 * @param type 
 * @param opts 
 * @returns 
 */
export const create = (type: VisitorTypes, opts: Partial<GridVisitorOpts> = {}) => {
  switch (type) {
    case `random-contiguous`:
      return withLogic(randomContiguousLogic(), opts);
    case `random`:
      return withLogic(randomLogic(), opts);
    case `depth`:
      return withLogic(depthLogic(), opts);
    case `breadth`:
      return withLogic(breadthLogic(), opts);
    case `neighbours`:
      return withLogic(neighboursLogic(), opts);
    case `row`:
      return withLogic(rowLogic(opts), opts);
    case `column`:
      return withLogic(columnLogic(opts), opts);
    default:
      throw new TypeError(`Param 'type' unknown. Value: ${ type }`);
  }
}

export const withLogic = (logic: GridNeighbourSelectionLogic, options: Partial<GridVisitorOpts> = {}) => {
  return (grid: Grid, optionsOverride: Partial<GridVisitorOpts> = {}) => {
    return visitByNeighbours(logic, grid, { ...options, ...optionsOverride });
  }
}

function isIterator<T>(v: any): v is Generator<T> {
  if (typeof v !== `object`) return false;
  if (!(`next` in v)) return false;
  if (!(`throw` in v)) return false;
  if (!(`return` in v)) return false;
  return true;

}


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