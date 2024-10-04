import type { GridCell, Grid, GridVisual } from "./Types.js";

/**
 * Returns _true_ if grids `a` and `b` are equal in value.
 * Returns _false_ if either parameter is undefined.
 *
 * @param a
 * @param b
 * @return
 */
export const isEqual = (
  a: Grid | GridVisual,
  b: Grid | GridVisual
): boolean => {
  if (b === undefined) return false;
  if (a === undefined) return false;
  if (`rows` in a && `cols` in a) {
    if (`rows` in b && `cols` in b) {
      if (a.rows !== b.rows || a.cols !== b.cols) return false;
    } else return false;
  }
  if (`size` in a) {
    if (`size` in b) {
      if (a.size !== b.size) return false;
    } else return false;
  }
  return true;
};

/**
 * Returns _true_ if two cells equal.
 * Returns _false_ if either cell are undefined
 *
 * @param a
 * @param b
 * @returns
 */
export const cellEquals = (
  a: GridCell | undefined,
  b: GridCell | undefined
): boolean => {
  if (b === undefined) return false;
  if (a === undefined) return false;
  return a.x === b.x && a.y === b.y;
};