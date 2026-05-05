import type { Grid, GridArray1d, GridBoundsLogic, GridCell, GridCellAccessor, GridCellSetter, UniformGrid } from "./types.js";
import { resultThrow } from "@ixfx/guards";
import { cells } from "./enumerators/cells.js";
import { cellKeyString, gridString, indexFromCell, testGrid } from "./index.js";

/**
 * Returns a {@link GridCellAccessor} to get values from `array`
 * based on cell (`{x,y}`) coordinates.
 *
 * ```js
 * const arr = [
 *  1,2,3,
 *  4,5,6
 * ]
 * const a = access(arr, {rows:2,cols:3});
 * a({x:0,y:0});  // 1
 * a({x:2, y:2}); // 6
 * ```
 * @param array Source data
 * @param grid Grid shape
 */
export function access<V>(array: readonly V[], grid: Grid): GridCellAccessor<V> {
  resultThrow(testGrid(grid), Array.isArray(array));

  const fn: GridCellAccessor<V> = (
    cell: GridCell,
    wrap: GridBoundsLogic = `undefined`,
  ): V | undefined => accessWithGrid(grid, array, cell, wrap);
  return fn;
}

function accessWithGrid<T>(grid: Grid, array: readonly T[] | T[], cell: GridCell, wrap: GridBoundsLogic) {
  const index = indexFromCell(grid, cell, wrap);
  if (index === undefined)
    return undefined;
  return array[index];
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
 * @param array Source data
 * @param grid Grid shape
 */
export function setMutate<V>(array: V[], grid: Grid): GridCellSetter<V> {
  return (value: V, cell: GridCell, wrap: GridBoundsLogic = `undefined`) => setMutateWithGrid(grid, array, value, cell, wrap);
}

function setMutateWithGrid<V>(grid: Grid, array: V[], value: V, cell: GridCell, wrap: GridBoundsLogic) {
  resultThrow(testGrid(grid), Array.isArray(array));

  const index = indexFromCell(grid, cell, wrap);
  if (index === undefined)
    throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid: ${gridString(grid)}`);
  array[index] = value;
  return array;
}

export function set<V>(array: readonly V[], cols: number) {
  const grid = gridFromArrayDimensions(array, cols);
  return (value: V, cell: GridCell, wrap: GridBoundsLogic): V[] => setWithGrid(grid, array, value, cell, wrap);
}

function setWithGrid<V>(grid: Grid, array: readonly V[], value: V, cell: GridCell, wrap: GridBoundsLogic) {
  const index = indexFromCell(grid, cell, wrap);
  if (index === undefined)
    throw new RangeError(`Cell (${cell.x},${cell.y}) is out of range of grid: ${gridString(grid)}`);
  const copy = [...array];
  copy[index] = value;
  array = copy;
  return copy;
}

/**
 * Creates a {@link UniformGrid} from the basis of an array and a given number of columns.
 * Assumes a uniform grid.
 * @param array
 * @param cols
 */
function gridFromArrayDimensions<T>(array: readonly T[] | T[], cols: number): UniformGrid {
  const grid = { cols, rows: Math.ceil(array.length / cols) };
  return grid;
}

/**
 * Wraps `array` for grid access.
 * Mutable, meaning that `array` gets modified if `set` function is used.
 *
 * ```js
 * const g = wrapMutable(myArray, {rows:2, cols:5});
 * g.get({x:1,y:2});     // Get value at cell position
 * g.set(10, {x:1,y:2}); // Set value at cell position
 * g.array;              // Get reference to original passed-in array
 * ```
 *
 * Use {@link wrap} for an immutable version.
 *
 * @param array Array to wrap
 * @param grid Grid shape
 */
export function wrapMutable<T>(array: T[], grid: Grid): GridArray1d<T> {
  return {
    ...grid,
    get: access(array, grid),
    set: setMutate(array, grid),
    get array() {
      return array;
    },
  };
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
 * let g = wrap(myArray, {rows: 2, cols:3});
 * g.get({ x:1, y:2 });          // Get value at cell position
 *
 * // Note that `set` returns a new instance
 * g = g.set(10, { x:1, y:2 });  // Set value at cell position
 * g.array;                      // Get reference to current array
 * ```
 *
 * Use {@link wrapMutable} to modify an array in-place
 * @param array Array to wrap
 * @param grid Grid shape
 */
export function wrap<T>(array: T[], grid: Grid): GridArray1d<T> {
  return {
    ...grid,
    get: (cell: GridCell, boundsLogic: GridBoundsLogic = `undefined`) => accessWithGrid(grid, array, cell, boundsLogic),
    set: (value: T, cell: GridCell, boundsLogic: GridBoundsLogic = `undefined`) => {
      array = setWithGrid(grid, array, value, cell, boundsLogic);
      return wrap(array, grid);
    },
    get array() {
      return array;
    },
  };
}

/**
 * Creates a 1-dimensional array to fit a grid of rows x cols.
 * Use {@link createArray} if you want to create this array and wrap it for grid access.
 *
 * ```js
 * const arr = createArray(0, { rows: 10, cols: 20 });
 * ```
 * @param initialValue Initial value to fill array
 * @param grid Grid shape to make
 */
export function createArray<T>(initialValue: T, grid: Grid): T[] {
  resultThrow(
    testGrid(grid),
  );
  const t: T[] = [];
  for (const c of cells(grid)) {
    const index = indexFromCell(grid, c, `undefined`);
    if (index === undefined)
      throw new Error(`Cell ${cellKeyString(c)} is out of bounds of grid ${gridString(grid)}`);
    t[index] = initialValue;
  }

  return t;
}

/**
 * Creates a {@link GridArray1d} instance given the dimensions of the grid.
 * Use {@link createArray} if you just want to create an array sized for a grid.
 *
 * Behind the scenes, it runs:
 * ```js
 * const arr = createArray(initialValue, grid);
 * return wrapMutable(arr, grid);
 * ```
 * @param initialValue
 * @param grid
 */
export function createMutable<T>(initialValue: T, grid: Grid): GridArray1d<T> {
  resultThrow(testGrid(grid));
  const array = createArray(initialValue, grid);
  return wrapMutable(array, grid);
}
