import { applyBounds } from "./apply-bounds.js";
import type { GridBoundsLogic, GridCell, GridCellAccessor, GridCellSetter, Grid, GridReadable, GridWritable } from "./types.js";

export type ArrayGrid<T> = GridReadable<T> & GridWritable<T> & {
  array: T[][]
}

/**
 * Create a grid from a 2-dimensional array.
 * ```js
 * const data = [
 *  [1,2,3],
 *  [4,5,6]
 * ]
 * const g = create(data);
 * // { rows: 2, cols: 3 }
 * ```
 * @param array 
 * @returns 
 */
export const create = <T>(array: ReadonlyArray<T[]> | Array<T[]>): Grid => {
  let colLen = NaN;
  for (const row of array) {
    if (Number.isNaN(colLen)) {
      colLen = row.length;
    } else {
      if (colLen !== row.length) throw new Error(`Array does not have uniform column length`);
    }
  }

  return { rows: array.length, cols: colLen };
}

export const setMutate = <V>(
  array: V[][]
): GridCellSetter<V> => {
  const grid = create(array);
  return (value: V, cell: GridCell, wrap: GridBoundsLogic = `undefined`) => setMutateWithGrid(grid, array, value, cell, wrap);
}

/**
 * Returns a function that updates a 2D array representation
 * of a grid. Array is mutated.
 *
 * ```js
 * const m = Grids.Array2d.setMutateWithGrid(grid, array);
 * m(someValue, { x:2, y:3 });
 * ```
 * @param grid
 * @param array
 * @returns
 */
const setMutateWithGrid = <V>(
  grid: Grid,
  array: V[][],
  value: V, cell: GridCell, bounds: GridBoundsLogic
) => {
  let boundCell = applyBounds(grid, cell, bounds);
  if (boundCell === undefined) throw new RangeError(`Cell (${ cell.x },${ cell.y }) is out of range of grid cols: ${ grid.cols } rows: ${ grid.rows }`);
  array[ boundCell.y ][ boundCell.x ] = value;
  return array;
}
// export const array2dUpdater = <V>(grid: GridVisual, array: Array<Array<V>>) => {
//   const fn = (v: V, position: Cell) => {
//     const pos = cellAtPoint(grid, position);
//     if (pos === undefined) {
//       throw new Error(
//         `Position does not exist. Pos: ${ JSON.stringify(
//           position
//         ) } Grid: ${ JSON.stringify(grid) }`
//       );
//     }
//     array[ pos.y ][ pos.x ] = v;
//   };
//   return fn;
// };

export const access = <T>(
  array: ReadonlyArray<T[]>
): GridCellAccessor<T> => {
  const grid = create(array);

  const fn: GridCellAccessor<T> = (
    cell: GridCell,
    wrap: GridBoundsLogic = `undefined`
  ): T | undefined => accessWithGrid(grid, array, cell, wrap);
  return fn;
};

const accessWithGrid = <T>(grid: Grid, array: ReadonlyArray<T[]> | Array<T[]>, cell: GridCell, wrap: GridBoundsLogic) => {
  let boundCell = applyBounds(grid, cell, wrap);
  if (boundCell === undefined) return undefined;
  return array[ boundCell.y ][ boundCell.x ];
}

export const wrapMutable = <T>(array: T[][]): ArrayGrid<T> => {
  const grid = create(array);
  return {
    ...grid,
    get: access(array),
    set: setMutate(array),
    get array() {
      return array;
    }
  }
}

export const set = <V>(
  array: readonly V[][]
) => {
  const grid = create(array);
  return (value: V, cell: GridCell, wrap: GridBoundsLogic) => setWithGrid(grid, array, value, cell, wrap);
}

const setWithGrid = <V>(
  grid: Grid,
  array: readonly V[][],
  value: V, cell: GridCell, wrap: GridBoundsLogic
) => {
  let boundCell = applyBounds(grid, cell, wrap);
  if (boundCell === undefined) throw new RangeError(`Cell (${ cell.x },${ cell.y }) is out of range of grid cols: ${ grid.cols } rows: ${ grid.rows }`);
  let copyWhole = [ ...array ];
  let copyRow = [ ...copyWhole[ boundCell.y ] ];
  copyRow[ boundCell.x ] = value;
  copyWhole[ boundCell.y ] = copyRow;
  array = copyWhole;
  return copyWhole;
}

/**
 * Wraps `array` with two dimensions for grid access.
 * Immutable, such that underlying array is not modified and a
 * call to `set` returns a new `GridArray1d`.
 * 
 * ```js
 * // Grid of rows: 2, cols: 3
 * const myArray = [
 *  [ `a`, `b`, `c` ],
 *  [ `d`, `e`, `f` ]
 * ]
 * let g = wrap(myArray);
 * g.get({x:1,y:2});          // Get value at cell position
 * g = g.set(10, {x:1,y:2}); // Set value at cell position
 * g.array;                  // Get reference to current array
 * ```
 * 
 * Use {@link wrapMutable} to modify an array in-place
 * @param array Array to wrap
 * @returns 
 */
export const wrap = <T>(array: T[][]): ArrayGrid<T> => {
  const grid = create(array);
  return {
    ...grid,
    get: (cell: GridCell, boundsLogic: GridBoundsLogic = `undefined`) => accessWithGrid(grid, array, cell, boundsLogic),
    set: (value: T, cell: GridCell, boundsLogic: GridBoundsLogic = `undefined`) => {
      array = setWithGrid(grid, array, value, cell, boundsLogic);
      return wrap(array);
    },
    get array() {
      return array;
    }
  }
}