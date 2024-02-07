import { isEqual } from "./index.js";
import { subtract as PointsSubtract, sum as PointsSum, type Point } from "../point/index.js";
import type { CirclePositioned } from "./index.js";
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
export const intersections = (a: CirclePositioned, b: CirclePositioned): ReadonlyArray<Point> => {
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
