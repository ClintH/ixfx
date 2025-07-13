import { zipKeyValue } from "@ixfx/core/maps";
import { allDirections, getVectorFromCardinal } from "./directions.js";
import type { GridBoundsLogic, GridCardinalDirection, GridCell, Grid, GridNeighbour, GridNeighbourMaybe, GridNeighbours } from "./types.js";
import { randomElement } from "@ixfx/random";
import { offset } from "./offset.js";

export const randomNeighbour = (nbos: readonly GridNeighbour[]) => randomElement(nbos); // .filter(isNeighbour));

/**
 * Returns _true_ if `n` is a Neighbour type, eliminating NeighbourMaybe possibility
 *
 * @param n
 * @return
 */
const isNeighbour = (
  n: GridNeighbour | GridNeighbourMaybe | undefined
): n is GridNeighbour => {
  if (n === undefined) return false;
  if (n[ 1 ] === undefined) return false;
  return true;
};

/**
 * Gets a list of neighbours for `cell` (using {@link neighbours}), filtering
 * results to only those that are valid neighbours (using {@link isNeighbour})
 * 
 * ```js
 * // Get all eight surrounding cells
 * const n = Grids.neighbourList(grid, cell, Grids.allDirections);
 * 
 * // Get north, east, south, west cells
 * const n = Grids.neighbourList(grid, cell, Grids.crossDirections);
 * ```
 * @param grid Grid
 * @param cell Cell
 * @param directions Directions 
 * @param bounds Bounds
 * @returns 
 */
export const neighbourList = (
  grid: Grid,
  cell: GridCell,
  directions: readonly GridCardinalDirection[],
  bounds: GridBoundsLogic
): readonly GridNeighbour[] => {
  // Get neighbours for cell
  const cellNeighbours = neighbours(grid, cell, bounds, directions);

  // Filter out undefined cells
  const entries = Object.entries(cellNeighbours);
  return (entries as GridNeighbourMaybe[]).filter(n => isNeighbour(n));
};

/**
 * Returns neighbours for a cell. If no `directions` are provided, it defaults to {@link allDirections}.
 *
 * ```js
 * const grid = { rows: 5, cols: 5 };
 * const cell = { x:2, y:2 };
 *
 * // Get n,ne,nw,e,s,se,sw and w neighbours
 * const n = Grids.neighbours(grid, cell, `wrap`);
 *
 * Yields:
 * {
 *  n: {x: 2, y: 1}
 *  s: {x: 2, y: 3}
 *  ....
 * }
 * ```
 *
 * Returns neighbours without diagonals (ie: n, e, s, w):
 * ```js
 * const n = Grids.neighbours(grid, cell, `stop`, Grids.crossDirections);
 * ```
 * @returns Returns a map of cells, keyed by cardinal direction
 * @param grid Grid
 * @param cell Cell
 * @param bounds How to handle edges of grid
 * @param directions Directions to return
 */
export const neighbours = (
  grid: Grid,
  cell: GridCell,
  bounds: GridBoundsLogic = `undefined`,
  directions?: readonly GridCardinalDirection[]
): GridNeighbours => {
  const directories = directions ?? allDirections;
  const points = directories.map((c) =>
    offset(grid, cell, getVectorFromCardinal(c), bounds)
  );
  return zipKeyValue<GridCell>(directories, points) as GridNeighbours;
};