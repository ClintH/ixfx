import { inside } from "./Inside.js";
import type { GridCell, Grid } from "./Types.js";

/**
 * Returns true if `cell` parameter is a cell with x,y fields.
 * Does not check validity of fields.
 *
 * @param cell
 * @return True if parameter is a cell
 */
export const isCell = (cell: GridCell | undefined): cell is GridCell => {
  if (cell === undefined) return false;
  return `x` in cell && `y` in cell;
};

/**
 * Throws an exception if any of the cell's parameters are invalid
 * @private
 * @param cell
 * @param parameterName
 * @param grid
 */
export const guardCell = (
  cell: GridCell,
  parameterName = `Param`,
  grid?: Grid
) => {
  if (cell === undefined) {
    throw new Error(parameterName + ` is undefined. Expecting {x,y}`);
  }
  if (cell.x === undefined) throw new Error(parameterName + `.x is undefined`);
  if (cell.y === undefined) throw new Error(parameterName + `.y is undefined`);
  if (Number.isNaN(cell.x)) throw new Error(parameterName + `.x is NaN`);
  if (Number.isNaN(cell.y)) throw new Error(parameterName + `.y is NaN`);
  if (!Number.isInteger(cell.x)) {
    throw new TypeError(parameterName + `.x is non-integer`);
  }
  if (!Number.isInteger(cell.y)) {
    throw new TypeError(parameterName + `.y is non-integer`);
  }
  if (grid !== undefined && !inside(grid, cell)) {
    throw new Error(
      `${ parameterName } is outside of grid. Cell: ${ cell.x },${ cell.y } Grid: ${ grid.cols }, ${ grid.rows }`
    );
  }
};

/**
 * Throws an exception if any of the grid's parameters are invalid
 * @param grid
 * @param parameterName
 */
export const guardGrid = (grid: Grid, parameterName = `Param`) => {
  if (grid === undefined) {
    throw new Error(`${ parameterName } is undefined. Expecting grid.`);
  }
  if (!(`rows` in grid)) throw new Error(`${ parameterName }.rows is undefined`);
  if (!(`cols` in grid)) throw new Error(`${ parameterName }.cols is undefined`);

  if (!Number.isInteger(grid.rows)) {
    throw new TypeError(`${ parameterName }.rows is not an integer`);
  }
  if (!Number.isInteger(grid.cols)) {
    throw new TypeError(`${ parameterName }.cols is not an integer`);
  }
};