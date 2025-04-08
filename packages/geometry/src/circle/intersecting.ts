import type { CirclePositioned } from "./circle-type.js";
import * as Intersects from '../intersects.js';
import { isContainedBy } from "./is-contained-by.js";
import { isCircle } from "./guard.js";
import { isRectPositioned } from "../rect/Guard.js";
import { isEqual as PointsIsEqual } from "../point/is-equal.js";
import type { Point } from '../point/point-type.js';
import { isPoint } from '../point/guard.js';
import type { RectPositioned } from "../rect/index.js";

/**
 * Returns true if `a` or `b` overlap, are equal, or `a` contains `b`.
 * A circle can be checked for intersections with another CirclePositioned, Point or RectPositioned.
 * 
 * Use `intersections` to find the points of intersection.
 *
 * @param a Circle
 * @param b Circle or point to test
 * @returns True if circle overlap
 */
export const isIntersecting = (a: CirclePositioned, b: CirclePositioned | Point | RectPositioned, c?: number): boolean => {
  if (PointsIsEqual(a, b)) return true;
  if (isContainedBy(a, b, c)) return true;
  if (isCircle(b)) {
    return Intersects.circleCircle(a, b);
  } else if (isRectPositioned(b)) {
    return Intersects.circleRect(a, b);
  } else if (isPoint(b) && c !== undefined) {
    return Intersects.circleCircle(a, { ...b, radius: c });
  }
  return false;
};