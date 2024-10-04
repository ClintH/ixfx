import type { RectPositioned } from "../rect/RectTypes.js";
import { guardCell } from "./Guards.js";
import type { GridCell, GridVisual } from "./Types.js";
import { fromTopLeft as RectsFromTopLeft } from '../rect/FromTopLeft.js';
import type { Point } from "../point/PointType.js";
import { throwIntegerTest, throwNumberTest } from '../../util/GuardNumbers.js';
import { cells } from "./enumerators/Cells.js";

/**
 * Generator that returns rectangles for each cell in a grid
 *
 * @example Draw rectangles
 * ```js
 * import { Drawing } from 'visuals.js'
 * const rects = [...Grids.asRectangles(grid)];
 * Drawing.rect(ctx, rects, { strokeStyle: `silver`});
 * ```
 * @param grid
 */
export function* asRectangles(
  grid: GridVisual
): IterableIterator<RectPositioned> {
  for (const c of cells(grid)) {
    yield rectangleForCell(grid, c);
  }
}

/**
 * Returns the cell at a specified visual coordinate
 * or _undefined_ if the position is outside of the grid.
 *
 * `position` must be in same coordinate/scale as the grid.
 *
 * @param position Position, eg in pixels
 * @param grid Grid
 * @return Cell at position or undefined if outside of the grid
 */
export const cellAtPoint = (
  grid: GridVisual,
  position: Point
): GridCell | undefined => {
  const size = grid.size;
  throwNumberTest(size, `positive`, `grid.size`);
  if (position.x < 0 || position.y < 0) return;
  const x = Math.floor(position.x / size);
  const y = Math.floor(position.y / size);
  if (x >= grid.cols) return;
  if (y >= grid.rows) return;
  return { x, y };
};

/**
 * Returns a visual rectangle of the cell, positioned from the top-left corner
 *
 * ```js
 * const cell = { x: 1, y: 0 };
 *
 * // 5x5 grid, each cell 5px in size
 * const grid = { rows: 5, cols: 5, size: 5 }
 *
 * const r = rectangleForCell(grid, cell,);
 *
 * // Yields: { x: 5, y: 0, width: 5, height: 5 }
 * ```
 * @param cell
 * @param grid
 * @return
 */
export const rectangleForCell = (
  grid: GridVisual,
  cell: GridCell
): RectPositioned => {
  guardCell(cell);
  const size = grid.size;
  const x = cell.x * size;
  const y = cell.y * size;
  const r = RectsFromTopLeft({ x: x, y: y }, size, size);
  return r;
};

/**
 * Returns the visual midpoint of a cell (eg. pixel coordinate)
 *
 * @param cell
 * @param grid
 * @return
 */
export const cellMiddle = (grid: GridVisual, cell: GridCell): Point => {
  guardCell(cell);

  const size = grid.size;
  const x = cell.x * size; // + (grid.spacing ? cell.x * grid.spacing : 0);
  const y = cell.y * size; // + (grid.spacing ? cell.y * grid.spacing : 0);
  return Object.freeze({ x: x + size / 2, y: y + size / 2 });
};