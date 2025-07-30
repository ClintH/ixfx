import { isEqual } from "./is-equal.js";
import { sum as PointsSum } from "../point/sum.js";
import { subtract as PointsSubtract } from "../point/subtract.js";
import type { Point } from '../point/point-type.js';
import type { CirclePositioned } from "./circle-type.js";
import type { Line } from "../line/line-type.js";

/**
 * Returns the point(s) of intersection between a circle and line.
 * 
 * ```js
 * const circle = { radius: 5, x: 5, y: 5 };
 * const line = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
 * const pts = Circles.intersectionLine(circle, line);
 * ```
 * @param circle 
 * @param line 
 * @returns Point(s) of intersection, or empty array
 */
export const intersectionLine = (circle: CirclePositioned, line: Line): readonly Point[] => {
  const v1 = {
    x: line.b.x - line.a.x,
    y: line.b.y - line.a.y
  };
  const v2 = {
    x: line.a.x - circle.x,
    y: line.a.y - circle.y
  };

  const b = (v1.x * v2.x + v1.y * v2.y) * -2;
  const c = 2 * (v1.x * v1.x + v1.y * v1.y);

  const d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
  if (Number.isNaN(d)) return []; // no intercept

  const u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
  const u2 = (b + d) / c;

  const returnValue: Point[] = [];
  if (u1 <= 1 && u1 >= 0) {  // add point if on the line segment
    returnValue.push({
      x: line.a.x + v1.x * u1,
      y: line.a.y + v1.y * u1
    });
  }
  if (u2 <= 1 && u2 >= 0) {  // second add point if on the line segment
    returnValue.push({
      x: line.a.x + v1.x * u2,
      y: line.a.y + v1.y * u2
    });
  }
  return returnValue;
};


/**
 * 
 * Returns the points of intersection betweeen `a` and `b`.
 * 
 * Returns an empty array if circles are equal, one contains the other or if they don't touch at all.
 *
 * @param a Circle
 * @param b Circle
 * @returns Points of intersection, or an empty list if there are none
 */
export const intersections = (a: CirclePositioned, b: CirclePositioned): readonly Point[] => {
  const vector = PointsSubtract(b, a);
  const centerD = Math.hypot((vector.y), (vector.x));

  // Do not intersect
  if (centerD > a.radius + b.radius) return [];

  // Circle contains another
  if (centerD < Math.abs(a.radius - b.radius)) return [];

  // Circles are the same
  if (isEqual(a, b)) return [];

  const centroidD = ((a.radius * a.radius) - (b.radius * b.radius) + (centerD * centerD)) / (2 * centerD);
  const centroid = {
    x: a.x + (vector.x * centroidD / centerD),
    y: a.y + (vector.y * centroidD / centerD)
  };

  const centroidIntersectionD = Math.sqrt((a.radius * a.radius) - (centroidD * centroidD));

  const intersection = {
    x: -vector.y * (centroidIntersectionD / centerD),
    y: vector.x * (centroidIntersectionD / centerD)
  };
  return [
    PointsSum(centroid, intersection),
    PointsSubtract(centroid, intersection)
  ];
};
