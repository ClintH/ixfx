import { movingAverageLight as mal } from "@ixfx/numbers"
import { isPoint3d } from "./guard.js";
import type { Point } from "./point-type.js";

export type PointAverager = (point: Point) => Point;
export type PointAverageKinds = `moving-average-light`;


/**
 * Uses =@ixfx/numbers#movingAverageLight to keep track of 
 * average x, y and z values.
 * ```js
 * // Create averager
 * const averager = Points.averager(`moving-average-light`);
 * 
 * // Call function with a point to add it to average
 * // and return the current average.
 * averager(somePoint); // Yields current average {x,y,z?}
 * ```
 * @param opts Scaling parameter. Higher means more smoothing, lower means less (minimum: 1). Default: 3
 * @returns 
 */
export function averager(kind: `moving-average-light`, opts: Partial<{ scaling: number }>): PointAverager;

export function averager(kind: PointAverageKinds, opts: any): PointAverager {
  let x: (v: number) => number;
  let y: (v: number) => number;
  let z: (v: number) => number;
  switch (kind) {
    case `moving-average-light`:
      const scaling = opts.scaling ?? 3;
      x = mal(scaling);
      y = mal(scaling);
      z = mal(scaling);
      break;
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