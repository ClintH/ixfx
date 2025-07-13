import type { Point } from "../point/point-type.js";
import type { Triangle } from "./triangle-type.js";
import { getPointParameter } from "../point/get-point-parameter.js";
import { bbox } from "./bbox.js";
import { intersectsPoint as RectsIntersectsPoint } from '../rect/Intersects.js';
import { barycentricCoord } from "./barycentric.js";

/**
 * Returns true if point is within or on the boundary of triangle
 * @param t
 * @param a
 * @param b
 */
export const intersectsPoint = (
  t: Triangle,
  a: Point | number,
  b?: number
): boolean => {
  const box = bbox(t);

  const pt = getPointParameter(a, b);

  // If it's not in the bounding box, can return false straight away
  if (!RectsIntersectsPoint(box, pt)) return false;

  const bc = barycentricCoord(t, pt);

  return (
    0 <= bc.a && bc.a <= 1 && 0 <= bc.b && bc.b <= 1 && 0 <= bc.c && bc.c <= 1
  );
};
