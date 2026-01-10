import { intersections as circleIntersections } from "./circle/intersections.js";
import type { CirclePositioned } from "./circle/circle-type.js";
import type { RectPositioned } from "./rect/index.js";

export const circleRect = (a: CirclePositioned, b: RectPositioned): boolean => {
  // https://yal.cc/rectangle-circle-intersection-test/
  const deltaX = a.x - Math.max(b.x, Math.min(a.x, b.x + b.width));
  const deltaY = a.y - Math.max(b.y, Math.min(a.y, b.y + b.height));
  return (deltaX * deltaX + deltaY * deltaY) < (a.radius * a.radius);
};

export const circleCircle = (a: CirclePositioned, b: CirclePositioned): boolean => circleIntersections(a, b).length === 2;