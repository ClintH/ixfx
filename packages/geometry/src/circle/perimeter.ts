import type { Point } from "../point/point-type.js";
import type { Circle, CirclePositioned } from "./circle-type.js";
import { guard, isCirclePositioned } from "./guard.js";
import { distance as PointsDistance } from "../point/distance.js";
import { minIndex } from "@ixfx/numbers";
const piPi = Math.PI * 2;

/**
 * Returns the nearest point on `circle`'s perimeter closest to `point`.
 * 
 * ```js
 * const pt = Circles.nearest(circle, {x:10,y:10});
 * ```
 * 
 * If an array of circles is provided, it will be the closest point amongst all the circles
 * @param circle Circle or array of circles
 * @param point
 * @returns Point `{ x, y }`
 */
export const nearest = (circle: CirclePositioned | CirclePositioned[], point: Point): Point => {
  const n = (a: CirclePositioned): Point => {
    const l = Math.sqrt(Math.pow(point.x - a.x, 2) + Math.pow(point.y - a.y, 2));
    const x = a.x + (a.radius * ((point.x - a.x) / l));
    const y = a.y + (a.radius * ((point.y - a.y) / l));
    return { x, y };
  };

  if (Array.isArray(circle)) {
    const pts = (circle).map(l => n(l));
    const dists = pts.map(p => PointsDistance(p, point));
    return Object.freeze<Point>(pts[ minIndex(dists) ]);
  } else {
    return Object.freeze<Point>(n(circle));
  }
};

/**
 * Returns a point on a circle's perimeter at a specified angle in radians
 * 
 * ```js
 * // Circle without position
 * const circleA = { radius: 5 };
 * 
 * // Get point at angle Math.PI, passing in a origin coordinate
 * const ptA = Circles.pointOnPerimeter(circleA, Math.PI, {x: 10, y: 10 });
 * 
 * // Point on circle with position
 * const circleB = { radius: 5, x: 10, y: 10};
 * const ptB = Circles.pointOnPerimeter(circleB, Math.PI);
 * ```
 * @param circle
 * @param angleRadian Angle in radians
 * @param origin or offset of calculated point. By default uses center of circle or 0,0 if undefined
 * @returns Point oo circle
 */
export const pointOnPerimeter = (circle: Circle | CirclePositioned, angleRadian: number, origin?: Point): Point => {
  origin ??= isCirclePositioned(circle) ? circle : { x: 0, y: 0 };
  return {
    x: (Math.cos(-angleRadian) * circle.radius) + origin.x,
    y: (Math.sin(-angleRadian) * circle.radius) + origin.y
  };
};

/**
 * Returns circumference of `circle` (alias of {@link length})
 * @param circle 
 * @returns 
 */
export const circumference = (circle: Circle): number => {
  guard(circle);
  return piPi * circle.radius;
};

/**
 * Returns circumference of `circle` (alias of {@link circumference})
 * @param circle 
 * @returns 
 */
export const length = (circle: Circle): number => circumference(circle);
