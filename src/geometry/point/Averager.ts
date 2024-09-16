import { movingAverageLight as mal } from "../../numbers/MovingAverage.js"
import { isPoint3d } from "./Guard.js";
import type { Point } from "./PointType.js";

export type PointAverager = (point: Point) => Point;
export type PointAverageKinds = `moving-average-light`;


/**
 * Uses {@link Numbers.movingAverageLight} to keep track of 
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
    let ax = x(point.x);
    let ay = y(point.y);
    if (isPoint3d(point)) {
      let az = z(point.z);
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