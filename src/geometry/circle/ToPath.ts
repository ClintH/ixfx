import type { Point } from "../point/PointType.js";
import { bbox } from "./Bbox.js";
import type { CirclePositioned } from "./CircleType.js";
import type { CircularPath } from "./CircularPath.js";
import { guard } from "./Guard.js";
import { interpolate } from "./Interpolate.js";
import { nearest } from "./Perimeter.js";
import { toSvg } from "./Svg.js";
import { circumference } from "./Perimeter.js";
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