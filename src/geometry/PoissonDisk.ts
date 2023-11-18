import * as Rects from './rect/index.js';
import * as Grids from './Grid.js';
import * as Points from './points/index.js';
import { Arrays } from '../collections/index.js';
import type { RectPositioned, Point } from "./Types.js";
export type PoissonDiskOpts = {
  readonly radius?: number;
  readonly limit?: number;
};

const isPointValid = (
  radius: number,
  grid: Grids.Grid & Grids.GridVisual,
  point: Point,
  reference: Grids.Cell,
  ar: ReadonlyArray<ReadonlyArray<Point>>
) => {
  //const cellForPoint = Grids.cellAtPoint(grid, point);
  // if (!cellForPoint) throw new Error(`Cell could not be calculated for point ${JSON.stringify(point)}`);
  for (const p of Grids.visitNeigbours(grid, reference, `undefined`)) {
    const pointInGrid = ar[ p.y ][ p.x ];
    if (pointInGrid) {
      const distribution = Points.distance(point, pointInGrid);
      if (distribution < radius) return false;
    }
  }
  return true;
};
// https://sighack.com/post/poisson-disk-sampling-bridsons-algorithm
// http://extremelearning.com.au/an-improved-version-of-bridsons-algorithm-n-for-poisson-disc-sampling/
export const poissonDisk = (
  rect: RectPositioned,
  opts: PoissonDiskOpts
) => {
  const radius = opts.radius ?? 1;
  const limit = opts.limit ?? 10;
  const size = Math.floor(radius / Math.sqrt(2));
  const grid: Grids.GridVisual & Grids.Grid = {
    rows: Math.ceil(rect.height / size) + 1,
    cols: Math.ceil(rect.width / size) + 1,
    size: size,
  };

  const randomPoint = () => Rects.randomPoint(rect);
  const ar = Grids.toArray<Point>(grid);
  const arUpdater = Grids.array2dUpdater<Point>(grid, ar);
  const active: Array<Point> = [];
  //eslint-disable-next-line functional/no-let
  let growthPoint: Point | undefined = randomPoint();
  //eslint-disable-next-line functional/immutable-data
  active.push(growthPoint);
  arUpdater(growthPoint, growthPoint);

  while (active.length > 0) {
    if (!growthPoint) {
      growthPoint = Arrays.randomPluck(active, true).value;
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
      //eslint-disable-next-line functional/no-let
      let added = false;
      //eslint-disable-next-line functional/no-let
      for (let index = 0; index < limit; index++) {
        const r = randomPoint();
        if (isPointValid(radius, grid, r, reference, ar)) {
          arUpdater(r, r);
          //eslint-disable-next-line functional/immutable-data
          active.push(r);
          added = true;
          break;
        }
      }

      // Find a new place to grow from
      if (!added) growthPoint = undefined;
    }
  }
};
