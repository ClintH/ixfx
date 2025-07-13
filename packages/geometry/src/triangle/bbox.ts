import type { RectPositioned } from "../rect/rect-types.js";
import type { Triangle } from "./triangle-type.js";

/**
 * Returns the bounding box that encloses the triangle.
 * @param t
 * @param inflation If specified, box will be inflated by this much. Default: 0.
 * @returns
 */
export const bbox = (t: Triangle, inflation = 0): RectPositioned => {
  const { a, b, c } = t;
  const xMin = Math.min(a.x, b.x, c.x) - inflation;
  const xMax = Math.max(a.x, b.x, c.x) + inflation;
  const yMin = Math.min(a.y, b.y, c.y) - inflation;
  const yMax = Math.max(a.y, b.y, c.y) + inflation;

  const r: RectPositioned = {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
  return r;
};