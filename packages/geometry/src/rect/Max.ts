import type { Point } from "../point/point-type.js";
import type { RectPositioned } from "./rect-types.js";

/**
 * Returns a rectangle based on provided four corners.
 *
 * To create a rectangle that contains an arbitary set of points, use {@link Points.bbox}.
 *
 * Does some sanity checking such as:
 *  - x will be smallest of topLeft/bottomLeft
 *  - y will be smallest of topRight/topLeft
 *  - width will be largest between top/bottom left and right
 *  - height will be largest between left and right top/bottom
 *
 */
export const maxFromCorners = (
  topLeft: Point,
  topRight: Point,
  bottomRight: Point,
  bottomLeft: Point
): RectPositioned => {
  if (topLeft.y > bottomRight.y) {
    throw new Error(`topLeft.y greater than bottomRight.y`);
  }
  if (topLeft.y > bottomLeft.y) {
    throw new Error(`topLeft.y greater than bottomLeft.y`);
  }

  const w1 = topRight.x - topLeft.x;
  const w2 = bottomRight.x - bottomLeft.x;
  const h1 = Math.abs(bottomLeft.y - topLeft.y);
  const h2 = Math.abs(bottomRight.y - topRight.y);
  return {
    x: Math.min(topLeft.x, bottomLeft.x),
    y: Math.min(topRight.y, topLeft.y),
    width: Math.max(w1, w2),
    height: Math.max(h1, h2),
  };
};
