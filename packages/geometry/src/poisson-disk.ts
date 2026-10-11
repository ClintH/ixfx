import type { Point } from './point/point-type.js';
import type { RectPositioned } from './rect/rect-types.js';
import { randomPluck } from '@ixfx/random';
import * as Grids from './grid/index.js';
import { distance as PointsDistance } from './point/distance.js';
import { randomPoint as RectsRandomPoint } from './rect/random.js';

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

function isPointValid(radius: number, grid: Grids.Grid & Grids.GridVisual, point: Point, reference: Grids.GridCell, ar: ReadonlyArray<readonly Point[]>) {
  const iter = Grids.Visit.create(`neighbours`, { start: reference });
  for (const p of iter(grid)) {
    const pointInGrid = ar[p.y][p.x];
    if (pointInGrid) {
      const distribution = PointsDistance(point, pointInGrid);
      if (distribution < radius)
        return false;
    }
  }
  return true;
}

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
export function poissonDisk(rect: RectPositioned, opts: PoissonDiskOpts): Point[] {
  // https://sighack.com/post/poisson-disk-sampling-bridsons-algorithm
  // http://extremelearning.com.au/an-improved-version-of-bridsons-algorithm-n-for-poisson-disc-sampling/
  const radius = opts.radius ?? 1;
  const limit = opts.limit ?? 10;
  const size = Math.floor(radius / Math.sqrt(2));
  if (size < 1)
    throw new Error(`Radius must be at least ${Math.sqrt(2)}. Got: ${radius}`);
  const grid: Grids.GridVisual & Grids.Grid = {
    rows: Math.ceil(rect.height / size) + 1,
    cols: Math.ceil(rect.width / size) + 1,
    size,
  };

  const randomPoint = () => RectsRandomPoint(rect);
  const ar = Grids.toArray2d<Point>(grid);
  const arUpdater = Grids.Array2d.setMutate<Point>(ar);
  // Cells are relative to the rect origin, not the coordinate-space origin
  const cellForPoint = (p: Point) => ({
    x: Math.floor((p.x - rect.x) / grid.size),
    y: Math.floor((p.y - rect.y) / grid.size),
  });
  const points: Point[] = [];
  // Stores a point in the grid cell that contains it
  const store = (p: Point) => {
    const cell = cellForPoint(p);
    if (cell.x < 0 || cell.y < 0 || cell.x >= grid.cols || cell.y >= grid.rows) {
      throw new Error(`Could not compute cell for point ${JSON.stringify(p)} grid: ${JSON.stringify(grid)}`);
    }
    arUpdater(p, cell);
    points.push(p);
  };
  const active: Point[] = [];
  const seed = randomPoint();
  active.push(seed);
  store(seed);

  while (active.length > 0) {
    // Pick a random frontier point. This removes it from `active`; it is
    // re-added if it manages to grow, or retired if exhausted.
    const growthPoint = randomPluck(active, { mutate: true });
    if (growthPoint === undefined)
      break;

    const reference = cellForPoint(growthPoint);
    for (let index = 0; index < limit; index++) {
      const r = randomPoint();
      if (isPointValid(radius, grid, r, reference, ar)) {
        store(r);
        active.push(r);
        // The growth point can still host further growth
        active.push(growthPoint);
        break;
      }
    }
    // If no candidate was valid, the plucked growth point stays retired
  }
  return points;
}
