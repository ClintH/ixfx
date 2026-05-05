import type { Result } from "@ixfx/guards";
import type { Grid, GridCell, JaggedGrid, UniformGrid } from "./types.js";
import { throwIfFailed } from "@ixfx/guards";
import { inside } from "./inside.js";
import { gridString } from "./to-string.js";

export const CellPlaceholder: GridCell = Object.freeze({ x: Number.NaN, y: Number.NaN });

/**
 * Returns _true_ if `cell` is a placeholder cell, i.e. has x and y as NaN.
 * @param cell
 */
export function isPlaceholderCell(cell: GridCell): boolean {
  return (Number.isNaN(cell.x) && Number.isNaN(cell.y));
}

/**
 * Returns true if `cell` parameter is a cell with x,y fields.
 * Does not check validity of fields.
 *
 * @param cell
 * @return True if parameter is a cell
 */
export function isCell(cell: GridCell | undefined): cell is GridCell {
  if (cell === undefined)
    return false;
  return `x` in cell && `y` in cell;
}

export function isJaggedGrid(grid: Grid): grid is JaggedGrid {
  if (`rows` in grid) {
    if (Array.isArray(grid.rows))
      return true;
  }
  return false;
}

/**
 * Throws an exception if any of the cell's parameters are invalid.
 *
 * Uses {@link testCell} under the hood.
 * @private
 * @param cell
 * @param parameterName
 * @param grid
 */
export function guardCell_(cell: GridCell, parameterName = `Param`, grid?: Grid): void {
  throwIfFailed(testCell(cell, parameterName, grid));
}

/**
 * Tests a cell.
 * If `grid` is provided, cell will be checked that it's inside the bounds of the grid.
 * @param cell
 * @param parameterName
 * @param grid
 */
export function testCell(cell: GridCell, parameterName = `Param`, grid?: Grid): Result<GridCell, string> {
  if (cell === undefined) {
    return { success: false, error: `${parameterName} is undefined. Expecting {x,y}` };
  }
  if (cell.x === undefined)
    return { success: false, error: `${parameterName}.x is undefined` };
  if (cell.y === undefined)
    return { success: false, error: `${parameterName}.y is undefined` };
  if (Number.isNaN(cell.x))
    return { success: false, error: `${parameterName}.x is NaN` };
  if (Number.isNaN(cell.y))
    return { success: false, error: `${parameterName}.y is NaN` };
  if (!Number.isInteger(cell.x)) {
    return { success: false, error: `${parameterName}.x is non-integer` };
  }
  if (!Number.isInteger(cell.y)) {
    return { success: false, error: `${parameterName}.y is non-integer` };
  }
  if (grid !== undefined && !inside(grid, cell)) {
    return { success: false, error: `${parameterName} is outside of grid. Cell: ${cell.x},${cell.y} Grid: ${gridString(grid)}` };
  }

  return { success: true, value: cell };
}

/**
 * Throws an exception if any of the grid's parameters are invalid.
 *
 * In the case of a {@link JaggedGrid}, each row is checked for validity.
 * @param grid
 * @param parameterName
 */
export function testGrid(grid: Grid, parameterName = `Param`): Result<Grid | JaggedGrid, string> {
  if (typeof grid === `undefined`) {
    return { success: false, error: `${parameterName} is undefined. Expecting Grid or JaggedGrid` };
  }
  if (typeof grid !== `object`) {
    return { success: false, error: `${parameterName} is not an object. Expecting Grid or JaggedGrid, got: ${typeof grid}` };
  }

  if (isJaggedGrid(grid))
    return testJaggedGrid(grid, parameterName);
  return testUniformGrid(grid, parameterName);
}

export function testUniformGrid(grid: UniformGrid, parameterName = `Param`): Result<UniformGrid, string> {
  if (typeof grid === `undefined`)
    return { success: false, error: `${parameterName} is undefined. Expecting UniformGrid: { rows: number, cols: number }` };
  if (typeof grid !== `object`)
    return { success: false, error: `${parameterName} is not an object. Expecting UniformGrid: { rows: number, cols: number }. Got: ${typeof grid}` };

  if (!(`rows` in grid))
    return { success: false, error: `${parameterName}.rows is missing` };
  if (!(`cols` in grid))
    return { success: false, error: `${parameterName}.cols is missing` };
  if (!Number.isInteger(grid.rows))
    return { success: false, error: `${parameterName}.rows is not an integer` };
  if (!Number.isInteger(grid.cols))
    return { success: false, error: `${parameterName}.cols is not an integer` };
  return { success: true, value: grid };
}

export function testJaggedGrid(grid: JaggedGrid, parameterName = `Param`): Result<JaggedGrid, string> {
  if (typeof grid === `undefined`)
    return { success: false, error: `${parameterName} is undefined. Expecting JaggedGrid: { rows: number[] }` };
  if (typeof grid !== `object`)
    return { success: false, error: `${parameterName} is not an object. Expecting JaggedGrid: { rows: number[] }. Got: ${typeof grid}` };

  if (!(`rows` in grid))
    return { success: false, error: `${parameterName}.rows is missing` };
  if (!Array.isArray(grid.rows))
    return { success: false, error: `${parameterName}.rows is not an array as expected for a JaggedGrid. Got: ${typeof grid.rows}` };
  for (const [index, rowColCount] of grid.rows.entries()) {
    if (!Number.isInteger(rowColCount))
      return { success: false, error: `${parameterName}.rows[${index}] is not an integer. Got: ${typeof rowColCount}, value: ${rowColCount}` };
  }
  return { success: true, value: grid };
}
