import { integerTest, resultThrow } from "@ixfx/guards";
import { indexFromCell } from "./index.js";
import type { GridCellAccessor, GridCell, GridBoundsLogic, Grid, GridCellSetter, GridReadable, GridWritable, GridArray1d } from "./types.js";

/**
 * Returns a {@link GridCellAccessor} to get values from `array`
 * based on cell (`{x,y}`) coordinates.
 * 
 * ```js
 * const arr = [
 *  1,2,3,
 *  4,5,6
 * ]
 * const a = access(arr, 3);
 * a({x:0,y:0});  // 1
 * a({x:2, y:2}); // 6
 * ```
 * @param array 
 * @param cols 
 * @returns 
 */
export const access = <V>(
  array: readonly V[],
  cols: number
): GridCellAccessor<V> => {
  const grid = gridFromArrayDimensions(array, cols);

  const fn: GridCellAccessor<V> = (
    cell: GridCell,
    wrap: GridBoundsLogic = `undefined`
  ): V | undefined => accessWithGrid(grid, array, cell, wrap);
  return fn;
};

const accessWithGrid = <T>(grid: Grid, array: readonly T[] | T[], cell: GridCell, wrap: GridBoundsLogic) => {
  const index = indexFromCell(grid, cell, wrap);
  if (index === undefined) return undefined;
  return array[ index ];
}

/**
 * Returns a {@link GridCellSetter} that can mutate
 * array values based on cell {x,y} positions.
 * ```js
 * const arr = [
 *  1,2,3,
 *  4,5,6
 * ]
 * const a = setMutate(arr, 3);
 * a(10, {x:0,y:0});
 * a(20, {x:2, y:2});
 * 
 * // Arr is now:
 * // [
 * //  10, 2, 3,
 * //  4, 5, 20
 * // ]
 * ```
 * @param array 
 * @param cols 
 * @returns 
 */
export const setMutate = <V>(
  array: V[],
  cols: number
): GridCellSetter<V> => {
  const grid = gridFromArrayDimensions(array, cols);
  return (value: V, cell: GridCell, wrap: GridBoundsLogic = `undefined`) => setMutateWithGrid(grid, array, value, cell, wrap);
}

const setMutateWithGrid = <V>(
  grid: Grid,
  array: V[],
  value: V, cell: GridCell, wrap: GridBoundsLogic
) => {
  const index = indexFromCell(grid, cell, wrap);
  if (index === undefined) throw new RangeError(`Cell (${ cell.x },${ cell.y }) is out of range of grid cols: ${ grid.cols } rows: ${ grid.rows }`);
  array[ index ] = value;
  return array;
}

export const set = <V>(
  array: readonly V[],
  cols: number
) => {
  const grid = gridFromArrayDimensions(array, cols);
  return (value: V, cell: GridCell, wrap: GridBoundsLogic): V[] => setWithGrid(grid, array, value, cell, wrap);
}

const setWithGrid = <V>(
  grid: Grid,
  array: readonly V[],
  value: V, cell: GridCell, wrap: GridBoundsLogic
) => {
  const index = indexFromCell(grid, cell, wrap);
  if (index === undefined) throw new RangeError(`Cell (${ cell.x },${ cell.y }) is out of range of grid cols: ${ grid.cols } rows: ${ grid.rows }`);
  const copy = [ ...array ];
  copy[ index ] = value;
  array = copy;
  return copy;
}

/**
 * Creates a {@link Grid} from the basis of an array and a given number of columns
 * @param array 
 * @param cols 
 * @returns 
 */
const gridFromArrayDimensions = <T>(array: readonly T[] | T[], cols: number): Grid => {
  const grid = { cols, rows: Math.ceil(array.length / cols) };
  return grid;
}


/**
 * Wraps `array` for grid access.
 * Mutable, meaning that `array` gets modified if `set` function is used.
 *  
 * ```js
 * const g = wrapMutable(myArray, 5); // 5 columns wide
 * g.get({x:1,y:2});     // Get value at cell position
 * g.set(10, {x:1,y:2}); // Set value at cell position
 * g.array;              // Get reference to original passed-in array
 * ```
 * 
 * Use {@link wrap} for an immutable version.
 * 
 * @param array Array to wrap
 * @param cols Width of grid
 * @returns 
 */
export const wrapMutable = <T>(array: T[], cols: number): GridArray1d<T> => {
  const grid = gridFromArrayDimensions(array, cols);
  return {
    ...grid,
    get: access(array, cols),
    set: setMutate(array, cols),
    get array() {
      return array;
    }
  }
}

/**
 * Wraps `array` for grid access.
 * Immutable, such that underlying array is not modified and a
 * call to `set` returns a new `GridArray1d`.
 * 
 * ```js
 * const myArray = [
 *    `a`, `b`, `c`, 
 *    `d`, `e`, `f` 
 * ];
 * let g = wrap(myArray, 3);  // 3 columns wide
 * g.get({ x:1, y:2 });          // Get value at cell position
 * 
 * // Note that `set` returns a new instance
 * g = g.set(10, { x:1, y:2 });  // Set value at cell position
 * g.array;                      // Get reference to current array
 * ```
 * 
 * Use {@link wrapMutable} to modify an array in-place
 * @param array Array to wrap
 * @param cols Width of grid
 * @returns 
 */
export const wrap = <T>(array: T[], cols: number): GridArray1d<T> => {
  const grid = gridFromArrayDimensions(array, cols);
  return {
    ...grid,
    get: (cell: GridCell, boundsLogic: GridBoundsLogic = `undefined`) => accessWithGrid(grid, array, cell, boundsLogic),
    set: (value: T, cell: GridCell, boundsLogic: GridBoundsLogic = `undefined`) => {
      array = setWithGrid(grid, array, value, cell, boundsLogic);
      return wrap(array, cols);
    },
    get array() {
      return array;
    }
  }
}

/**
 * Creates a 1-dimensional array to fit a grid of rows x cols.
 * Use {@link createArray} if you want to create this array and wrap it for grid access.
 * 
 * ```js
 * // Creates an array filled with 0, sized for a grid 10 rows by 20 columns
 * const arr = createArray(0, 10, 20);
 * 
 * // Alternatively, pass in a grid
 * const arr = createArray(0, { rows: 10, cols: 20 });
 * ```
 * @param rowsOrGrid Number of rows, or a grid to use the settings of
 * @param columns Columns
 */
export const createArray = <T>(initialValue: T, rowsOrGrid: number | Grid, columns?: number): T[] => {
  const rows = typeof rowsOrGrid === `number` ? rowsOrGrid : rowsOrGrid.rows;
  const cols = typeof rowsOrGrid === `object` ? rowsOrGrid.cols : columns;
  if (!cols) throw new Error(`Parameter 'columns' missing`);
  resultThrow(
    integerTest(rows, `aboveZero`, `rows`),
    integerTest(cols, `aboveZero`, `cols`)
  );

  const t: T[] = [];
  const total = rows * cols;
  for (let index = 0; index < total; index++) {
    t[ index ] = initialValue;
  }
  return t;
}

/**
 * Creates a {@link GridArray1d} instance given the dimensions of the grid.
 * Use {@link createArray} if you just want to create an array sized for a grid.
 * 
 * Behind the scenes, it runs:
 * ```js
 * const arr = createArray(initialValue, rows, cols);
 * return wrapMutable(arr, cols);
 * ```
 * @param initialValue 
 * @param rowsOrGrid 
 * @param columns 
 * @returns 
 */
export const createMutable = <T>(initialValue: T, rowsOrGrid: number | Grid, columns?: number): GridArray1d<T> => {
  const rows = typeof rowsOrGrid === `number` ? rowsOrGrid : rowsOrGrid.rows;
  const cols = typeof rowsOrGrid === `object` ? rowsOrGrid.cols : columns;
  if (!cols) throw new Error(`Parameter 'columns' missing`);
  const array = createArray(initialValue, rows, cols);
  return wrapMutable(array, cols);
}
