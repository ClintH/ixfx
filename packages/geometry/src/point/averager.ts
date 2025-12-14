import { movingAverageLight as mal } from "@ixfx/numbers"
import { isPoint3d } from "./guard.js";
import type { Point } from "./point-type.js";

export type PointAverager = (point: Point) => Point;
export type PointAveragerKinds = `moving-average-light`;
export type PointAverageKinds = `mean`

/**
 * Averages a set of points, by default as a 'mean'.
 * 
 * List of points has to all have Z property or none of them -- it's not
 * possible to mix 2D and 3D points.
 * @param points 
 * @returns 
 */
export const average = (points: Iterable<Point>, kind: PointAverageKinds = `mean`): Point => {
  let xSum = 0;
  let ySum = 0;
  let zSum = Number.NaN;
  let total = 0;
  if (kind !== `mean`) throw new Error(`Unknown averaging kind: '${ kind }' expected: 'mean'`)
  for (const p of points) {
    xSum += p.x;
    ySum += p.y;
    if (`z` in p && p.z !== undefined) {
      zSum += p.z
    } else if (Number.isNaN(zSum)) {
      throw new Error(`List of points should all have Z property, or none`);
    }
    total++
  }
  xSum /= total
  ySum /= total
  if (Number.isNaN(zSum)) {
    return { x: xSum, y: ySum }
  } else {
    return { x: xSum, y: ySum, z: zSum / total }
  }
}

/**
 * Keeps track of average x, y and z values.
 * 
 * When calling, you have to specify the averaging technique. At the moment
 * only 'moving-average-light' is supported. This uses @ixfx/numbers.movingAverageLight
 * under-the-hood.
 * 
 * ```js
 * // Create averager
 * const averager = Points.averager(`moving-average-light`);
 * 
 * // Call function with a point to add it to average
 * // and return the current average.
 * averager(somePoint); // Yields current average {x,y,z?}
 * ```
 * 
 * @param kind Averaging strategy
 * @param opts Scaling parameter. Higher means more smoothing, lower means less (minimum: 1). Default: 3
 * @returns 
 */
export function averager(kind: `moving-average-light`, opts: Partial<{ scaling: number }>): PointAverager;

export function averager(kind: PointAveragerKinds, opts: Partial<{ scaling: number }> = {}): PointAverager {
  let x: (v: number) => number;
  let y: (v: number) => number;
  let z: (v: number) => number;
  switch (kind) {
    case `moving-average-light`:
      {
        const scaling = opts.scaling ?? 3;
        x = mal(scaling);
        y = mal(scaling);
        z = mal(scaling);
        break;
      }
    default:
      throw new Error(`Unknown averaging kind '${ kind }'. Expected: 'moving-average-light'`);
  }

  return (point: Point) => {
    const ax = x(point.x);
    const ay = y(point.y);
    if (isPoint3d(point)) {
      const az = z(point.z);
      return Object.freeze({
        x: ax,
        y: ay,
        z: az
      })
    } else {
      return Object.freeze({
        x: ax,
        y: ay
      })
    }
  }
}