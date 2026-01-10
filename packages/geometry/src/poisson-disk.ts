import * as Grids from './grid/index.js';
import { randomPluck } from '@ixfx/random';
import { distance as PointsDistance } from './point/distance.js';
import { randomPoint as RectsRandomPoint } from './rect/random.js';
import type { Point } from './point/point-type.js';
import type { RectPositioned } from './rect/rect-types.js';

/**
 * Options for poisson disk
 */
export type PoissonDiskOpts = {
  /**
   * Radius of disk
   * @defaultValue 1
   */
  readonly radius?: number;
  /**
   * Number of points
   * @defaultValue 10
   */
  readonly limit?: number;
};

const isPointValid = (
  radius: number,
  grid: Grids.Grid & Grids.GridVisual,
  point: Point,
  reference: Grids.GridCell,
  ar: readonly (readonly Point[])[]
) => {
  const iter = Grids.Visit.create(`neighbours`, { start: reference });
  for (const p of iter(grid)) {
    const pointInGrid = ar[ p.y ][ p.x ];
    if (pointInGrid) {
      const distribution = PointsDistance(point, pointInGrid);
      if (distribution < radius) return false;
    }
  }
  return true;
};

/**
 * Generates a poisson disk distribution of points within a given `rect` area.
 * 
 * ```js
 * // Create up to 50 points aiming for a distance of 3 between them
 * const rect = { x: 10, y: 10, width: 100, height: 100 };     // RectPositioned
 * const points = poissonDisk(rect, { radius: 3, limit: 50 }); // Point[]
 * ```
 * @param rect 
 * @param opts 
 * @returns 
 */
export const poissonDisk = (
  rect: RectPositioned,
  opts: PoissonDiskOpts
): Point[] => {
  // https://sighack.com/post/poisson-disk-sampling-bridsons-algorithm
  // http://extremelearning.com.au/an-improved-version-of-bridsons-algorithm-n-for-poisson-disc-sampling/
  const radius = opts.radius ?? 1;
  const limit = opts.limit ?? 10;
  const size = Math.floor(radius / Math.sqrt(2));
  const grid: Grids.GridVisual & Grids.Grid = {
    rows: Math.ceil(rect.height / size) + 1,
    cols: Math.ceil(rect.width / size) + 1,
    size: size,
  };

  const randomPoint = () => RectsRandomPoint(rect);
  const ar = Grids.toArray2d<Point>(grid);
  const arUpdater = Grids.Array2d.setMutate<Point>(ar);
  const active: Point[] = [];
  let growthPoint: Point | undefined = randomPoint();
  active.push(growthPoint);
  arUpdater(growthPoint, growthPoint);

  while (active.length > 0) {
    if (typeof growthPoint !== `undefined`) {
      growthPoint = randomPluck(active, { mutate: true });
    }
    if (growthPoint) {
      const reference = Grids.cellAtPoint(grid, growthPoint);
      if (!reference) {
        throw new Error(
          `Could not compute cell for point ${ JSON.stringify(
            growthPoint
          ) } grid: ${ JSON.stringify(grid) }`
        );
      }
      let added = false;
      for (let index = 0; index < limit; index++) {
        const r = randomPoint();
        if (isPointValid(radius, grid, r, reference, ar)) {
          arUpdater(r, r);
          active.push(r);
          added = true;
          break;
        }
      }

      // Find a new place to grow from
      if (!added) growthPoint = undefined;
    }
  }
  return ar.flat();
};
