import type { Grid, GridCell } from "./types.js";
import { filterWithIndex } from "@ixfx/arrays";
import { resultThrow } from "@ixfx/guards";
import { isJaggedGrid, testCell } from "./guards.js";

/**
 * Returns the last cell of a grid, column-wise
 *
 * For uniform grids, this is simply `{ x: grid.cols - 1, y: grid.rows - 1 }`.
 *
 * For jagged grids, consider all the rows with the max cols.
 * In the below case, row indexes 1 and 2 have the max cols of 3,
 * and we take the last of those rows. Thus the last cell is { x: 2, y: 2 } (position 7)
 *
 * ```
 * { rows: [2, 3, 3, 1] }
 * 0 1
 * 2 3 4
 * 5 6 7
 * 8
 * ```
 *
 * See also {@link firstCellColumnwise}
 * @param grid
 */
export function lastCellColumnwise(grid: Grid): GridCell {
  if (!isJaggedGrid(grid)) {
    return { x: grid.cols - 1, y: grid.rows - 1 };
  }

  const maxCols = Math.max(...grid.rows);
  const maxRows = [...filterWithIndex(grid.rows, colCount => colCount === maxCols)];
  const y = maxRows.at(-1) as number;
  return { x: maxCols - 1, y };
}

/**
 * Returns the last cell of a grid, row-wise
 *
 * For uniform grids, this is simply `{ x: grid.cols - 1, y: grid.rows - 1 }`.
 *
 * For jagged grids, the last position is the last cell of the last row, in this
 * case { x: 0, y: 3 } (position 8).
 *
 * ```
 * { rows: [2, 3, 3, 1] }
 * 0 1
 * 2 3 4
 * 5 6 7
 * 8
 * ```
 *
 * See also {@link firstCellColumnwise}
 * @param grid
 */
export function lastCellRowwise(grid: Grid): GridCell {
  if (!isJaggedGrid(grid)) {
    return { x: grid.cols - 1, y: grid.rows - 1 };
  }
  const lastCols = grid.rows.at(-1) as number;
  return { x: lastCols - 1, y: grid.rows.length - 1 };
}

/**
 * Returns the first cell of a grid.
 *
 * For uniform grids, this is simply `{ x: 0, y: 0 }`.
 *
 * For jagged grids returns first cell in a row with cols.
 *
 * ```
 * { rows: [0, 2, 3] }
 *
 * 0 1
 * 2 3 4
 * ```
 *
 * See also {@link firstCellColumnwise}
 * @param grid
 */
export function firstCellColumnwise(grid: Grid): GridCell {
  if (!isJaggedGrid(grid)) {
    return { x: 0, y: 0 };
  }
  const firstRowWithCols = grid.rows.findIndex(colCount => colCount > 0);
  return { x: 0, y: firstRowWithCols };
}

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
 */
export function getLine(start: GridCell, end: GridCell): readonly GridCell[] {
  // https://stackoverflow.com/a/4672319
  resultThrow(
    testCell(start),
    testCell(end),
  );
  let startX = start.x;
  let startY = start.y;
  const dx = Math.abs(end.x - startX);
  const dy = Math.abs(end.y - startY);
  const sx = startX < end.x ? 1 : -1;
  const sy = startY < end.y ? 1 : -1;
  let error = dx - dy;

  const cells: GridCell[] = [];

  while (true) {
    cells.push(Object.freeze({ x: startX, y: startY }));
    if (startX === end.x && startY === end.y)
      break;
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
}

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
export function simpleLine(start: GridCell, end: GridCell, endInclusive = false): readonly GridCell[] {
  const cells: GridCell[] = [];
  if (start.x === end.x) {
    // Vertical
    const lastY = endInclusive ? end.y + 1 : end.y;
    for (let y = start.y; y < lastY; y++) {
      cells.push({ x: start.x, y });
    }
  } else if (start.y === end.y) {
    // Horizontal
    const lastX = endInclusive ? end.x + 1 : end.x;
    for (let x = start.x; x < lastX; x++) {
      cells.push({ x, y: start.y });
    }
  } else {
    throw new Error(
      `Only does vertical and horizontal: ${start.x},${start.y} - ${end.x},${end.y}`,
    );
  }
  return cells;
}