import { zipKeyValue } from "../../data/maps/MapFns.js";
import { throwIntegerTest } from "../../util/GuardNumbers.js";
import { guardCell, guardGrid } from "./Guards.js";
import type { GridBoundsLogic, GridCardinalDirection, GridCardinalDirectionOptional, GridCell, Grid, GridNeighbours } from "./Types.js";
import { offset } from "./Offset.js";

/**
 * Returns a list of all cardinal directions: n, ne, nw, e, s, se, sw, w
 */
export const allDirections = Object.freeze([
  `n`,
  `ne`,
  `nw`,
  `e`,
  `s`,
  `se`,
  `sw`,
  `w`,
]) as ReadonlyArray<GridCardinalDirection>;

/**
 * Returns a list of + shaped directions: n, e, s, w
 */
export const crossDirections = Object.freeze([
  `n`,
  `e`,
  `s`,
  `w`,
]) as ReadonlyArray<GridCardinalDirection>;

/**
 * Returns cells that correspond to the cardinal directions at a specified distance
 * i.e. it projects a line from `start` cell in all cardinal directions and returns the cells at `steps` distance.
 * @param grid Grid
 * @param steps Distance
 * @param start Start poiint
 * @param bounds Logic for if bounds of grid are exceeded
 * @returns Cells corresponding to cardinals
 */
export const offsetCardinals = (
  grid: Grid,
  start: GridCell,
  steps: number,
  bounds: GridBoundsLogic = `stop`
): GridNeighbours => {
  guardGrid(grid, `grid`);
  guardCell(start, `start`);
  throwIntegerTest(steps, `aboveZero`, `steps`);

  const directions = allDirections;
  const vectors = directions.map((d) => getVectorFromCardinal(d, steps));
  const cells = directions.map((d, index) =>
    offset(grid, start, vectors[ index ], bounds)
  );

  return zipKeyValue(directions, cells) as GridNeighbours;
};

/**
 * Returns an `{ x, y }` signed vector corresponding to the provided cardinal direction.
 * ```js
 * const n = getVectorFromCardinal(`n`); // {x: 0, y: -1}
 * ```
 *
 * Optional `multiplier` can be applied to vector
 * ```js
 * const n = getVectorFromCardinal(`n`, 10); // {x: 0, y: -10}
 * ```
 *
 * Blank direction returns `{ x: 0, y: 0 }`
 * @param cardinal Direction
 * @param multiplier Multipler
 * @returns Signed vector in the form of `{ x, y }`
 */
export const getVectorFromCardinal = (
  cardinal: GridCardinalDirectionOptional,
  multiplier = 1
): GridCell => {
  // eslint-disable-next-line functional/no-let
  let v;
  switch (cardinal) {
    case `n`: {
      v = { x: 0, y: -1 * multiplier };
      break;
    }
    case `ne`: {
      v = { x: 1 * multiplier, y: -1 * multiplier };
      break;
    }
    case `e`: {
      v = { x: 1 * multiplier, y: 0 };
      break;
    }
    case `se`: {
      v = { x: 1 * multiplier, y: 1 * multiplier };
      break;
    }
    case `s`: {
      v = { x: 0, y: 1 * multiplier };
      break;
    }
    case `sw`: {
      v = { x: -1 * multiplier, y: 1 * multiplier };
      break;
    }
    case `w`: {
      v = { x: -1 * multiplier, y: 0 };
      break;
    }
    case `nw`: {
      v = { x: -1 * multiplier, y: -1 * multiplier };
      break;
    }
    default: {
      v = { x: 0, y: 0 };
    }
  }
  return Object.freeze(v);
};