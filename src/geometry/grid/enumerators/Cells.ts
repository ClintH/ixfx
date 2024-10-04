import { guardGrid, guardCell } from "../Guards.js";
import type { Grid, GridCell, GridCellAndValue, GridReadable } from "../Types.js";
import { values } from "../Values.js";

/**
 * Enumerate all cell coordinates in an efficient manner.
 * Runs left-to-right, top-to-bottom.
 * 
 * If end of grid is reached, behaviour depends on `wrap`:
 * * _true_ (default): iterator will wrap to ensure all are visited.
 * * _false_: iterator stops at end of grid
 * 
 * ```js
 * import { Grids } from 'ixfx/geometry.js';
 * 
 * // Enumerate each cell position, left-to-right, top-to-bottom
 * for (const cell of Grids.By.cells(grid)) {
 *  // cell will be { x, y }
 * }
 * ```
 * 
 * See also:
 * * {@link cellValues}: Iterate over cell values
 * * {@link cellsAndValues}: Iterate over pairs of cell coordinates and cell values
 * @param grid Grid to iterate over
 * @param start Starting cell position (default: {x:0,y:0})
 * @param wrap If true (default), iteration will wrap around through (0,0) when end of grid is reached.
 */
export function* cells(grid: Grid, start?: GridCell, wrap = true) {
  if (!start) start = { x: 0, y: 0 }

  guardGrid(grid, `grid`);
  guardCell(start, `start`, grid);

  let { x, y } = start;
  let canMove = true;
  do {
    yield { x, y };
    x++;
    if (x === grid.cols) {
      y++;
      x = 0;
    }
    if (y === grid.rows) {
      if (wrap) {
        y = 0;
        x = 0;
      } else {
        canMove = false;
      }
    }
    if (x === start.x && y === start.y) canMove = false; // Complete
  } while (canMove);
};

/**
 * Yield all the values of a grid, left-to-right, top-to-bottom.
 * 
 * This is just a wrapper around Grids.values:
 * ```js
 * yield* values(grid, cells(grid, start, wrap));
 * ```
 * 
 * See also:
 * * {@link cells}: Iterate over cell coordinates
 * * {@link cellsAndValues}: Iterate over pairs of cell coordinates and cell values
 * @param grid 
 * @param start 
 * @param wrap 
 */
export function* cellValues<T>(grid: GridReadable<T>, start?: GridCell, wrap = true) {
  yield* values(grid, cells(grid, start, wrap));
}

/**
 * Yield all cell coordinates and values of a grid, left-to-right, top-to-bottom
 * 
 * See also:
 * * {@link cells}: Iterate over cell coordinates
 * * {@link cellValues}: Iterate over cell values
 * @param grid 
 * @param start 
 * @param wrap 
 */
export function* cellsAndValues<T>(grid: GridReadable<T>, start?: GridCell, wrap = true): Generator<GridCellAndValue<T>> {
  for (const cell of cells(grid, start, wrap)) {
    yield { cell, value: grid.get(cell) }
  }
}