import { isCirclePositioned } from "../circle/guard.js";
import type { Point } from "../point/point-type.js";
import { isRectPositioned } from "../rect/Guard.js";
import type { ShapePositioned } from "./shape-type.js";
import { isIntersecting as CirclesIsIntersecting } from '../circle/intersecting.js';
import { isIntersecting as RectsIsIntersecting } from '../rect/Intersects.js';

/**
 * Returns the intersection result between a and b.
 * `a` can be a {@link CirclePositioned} or {@link RectPositioned}
 * `b` can be as above or a {@link Point}.
 * @param a
 * @param b
 */
export const isIntersecting = (
  a: ShapePositioned,
  b: ShapePositioned | Point
): boolean => {
  if (isCirclePositioned(a)) {
    return CirclesIsIntersecting(a, b);
  } else if (isRectPositioned(a)) {
    return RectsIsIntersecting(a, b);
  }
  throw new Error(
    `a or b are unknown shapes. a: ${ JSON.stringify(a) } b: ${ JSON.stringify(b) }`
  );
};