import type { Point } from "./PointType.js";

/**
 * Returns a point with Math.abs applied to x and y.
 * ```js
 * Points.abs({ x:1,  y:1  }); // { x: 1, y: 1 }
 * Points.abs({ x:-1, y:1  }); // { x: 1, y: 1 }
 * Points.abs({ x:-1, y:-1 }); // { x: 1, y: 1 }
 * ```
 * @param pt
 * @returns
 */
export const abs = (pt: Point) => ({
  ...pt,
  x: Math.abs(pt.x),
  y: Math.abs(pt.y),
});