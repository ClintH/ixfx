import type { Point } from "../point/point-type.js";
import { bbox } from "./bbox.js";
import type { CirclePositioned } from "./circle-type.js";
import type { CircularPath } from "./circular-path.js";
import { guard } from "./guard.js";
import { interpolate } from "./interpolate.js";
import { nearest } from "./perimeter.js";
import { toSvg } from "./svg.js";
import { circumference } from "./perimeter.js";
/**
 * Returns a `CircularPath` representation of a circle
 *
 * @param {CirclePositioned} circle
 * @returns {CircularPath}
 */
export const toPath = (circle: CirclePositioned): CircularPath => {
  guard(circle);

  return {
    ...circle,
    nearest: (point: Point) => nearest(circle, point),
    /**
     * Returns a relative (0.0-1.0) point on a circle. 0=3 o'clock, 0.25=6 o'clock, 0.5=9 o'clock, 0.75=12 o'clock etc.
     * @param {t} Relative (0.0-1.0) point
     * @returns {Point} X,y
     */
    interpolate: (t: number) => interpolate(circle, t),
    bbox: () => bbox(circle),
    length: () => circumference(circle),
    toSvgString: (sweep = true) => toSvg(circle, sweep),
    relativePosition: (_point: Point, _intersectionThreshold: number) => {
      throw new Error(`Not implemented`)
    },
    distanceToPoint: (_point: Point): number => {
      throw new Error(`Not implemented`)
    },
    kind: `circular`
  };
};