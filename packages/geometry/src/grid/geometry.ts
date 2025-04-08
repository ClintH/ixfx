import { guardCell } from "./guards.js";
import type { GridCell } from "./types.js";

/**
 * Returns the cells on the line of `start` and `end`, inclusive
 *
 * ```js
 * // Get cells that connect 0,0 and 10,10
 * const cells = Grids.getLine({x:0,y:0}, {x:10,y:10});
 * ```
 *
 * This function does not handle wrapped coordinates.
 * @param start Starting cell
 * @param end End cell
 * @returns
 */
export const getLine = (start: GridCell, end: GridCell): ReadonlyArray<GridCell> => {
  // https://stackoverflow.com/a/4672319
  guardCell(start);
  guardCell(end);

  let startX = start.x;
  let startY = start.y;
  const dx = Math.abs(end.x - startX);
  const dy = Math.abs(end.y - startY);
  const sx = startX < end.x ? 1 : -1;
  const sy = startY < end.y ? 1 : -1;
  let error = dx - dy;

  const cells:GridCell[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    cells.push(Object.freeze({ x: startX, y: startY }));
    if (startX === end.x && startY === end.y) break;
    const error2 = 2 * error;
    if (error2 > -dy) {
      error -= dy;
      startX += sx;
    }
    if (error2 < dx) {
      error += dx;
      startY += sy;
    }
  }
  return cells;
};

/**
 * Returns a list of cells from `start` to `end`.
 *
 * Throws an error if start and end are not on same row or column.
 *
 * @param start Start cell
 * @param end end clel
 * @param endInclusive
 * @return Array of cells
 */
export const simpleLine = function (
  start: GridCell,
  end: GridCell,
  endInclusive = false
): ReadonlyArray<GridCell> {
  const cells: Array<GridCell> = [];
  if (start.x === end.x) {
    // Vertical
    const lastY = endInclusive ? end.y + 1 : end.y;
    for (let y = start.y; y < lastY; y++) {
      cells.push({ x: start.x, y: y });
    }
  } else if (start.y === end.y) {
    // Horizontal
    const lastX = endInclusive ? end.x + 1 : end.x;
    for (let x = start.x; x < lastX; x++) {
      cells.push({ x: x, y: start.y });
    }
  } else {
    throw new Error(
      `Only does vertical and horizontal: ${ start.x },${ start.y } - ${ end.x },${ end.y }`
    );
  }
  return cells;
};