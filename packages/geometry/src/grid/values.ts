import type { GridReadable, GridCell, GridBoundsLogic } from "./types.js";


export function values<T>(grid: GridReadable<T>, iter: Iterable<GridCell>): Generator<T>
export function values<T>(grid: GridReadable<T>, iter: Iterable<GridCell[]>): Generator<T[]>

/**
 * Converts an 1D or 2D array of cell coordinates into values
 * 
 * ```js
 * // 1D (ie an array of coordinates)
 * const cells = Grid.As.cells(grid);
 * for (const v of Grid.values(grid, cells)) {
 * 
 * }
 * ```
 * ```js
 * // 2D (ie an array of rows)
 * const rows = Grid.As.rows(grid);
 * for (const v of Grid.values(grid, rows)) {
 * }
 * ```
 * @param grid 
 * @param iter 
 */
export function* values<T>(grid: GridReadable<T>, iter: Iterable<GridCell> | Iterable<GridCell[]>) {
  for (const d of iter) {
    if (Array.isArray(d)) {
      yield d.map(v => grid.get(v, `undefined`));
    } else {
      yield grid.get(d, `undefined`);
    }
  }
}

// export function visitValues<T>(readable: GridReadable<T>, visitor: Generator<Cell[]>, wrap?: BoundsLogic): Generator<T[]>

// export function visitValues<T>(readable: GridReadable<T>, visitor: Generator<Cell>, wrap?: BoundsLogic): Generator<T>

// /**
//  * Visits the values of a readable grid
//  * @param readable Readable grid
//  * @param visitor Visitor
//  * @param wrap Wrapping logic, defaultign to 'undefined'
//  */
// export function* visitValues<T>(readable: GridReadable<T>, visitor: Generator<Cell | Cell[]>, wrap: BoundsLogic = `undefined`) {
//   for (const cellOrCells of visitor) {
//     if (Array.isArray(cellOrCells)) {
//       yield cellOrCells.map(cell => readable.accessor(cell, wrap));
//     } else {
//       yield readable.accessor(cellOrCells, wrap);
//     }
//   }
// }