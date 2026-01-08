import type { Point } from "../point/point-type.js";
import type { Line } from "./line-type.js";
import { distance as PointsDistance } from "../point/distance.js";
import { minIndex } from "@ixfx/numbers";
/**
 * Returns the nearest point on line(s) closest to `point`.
 * 
 * ```js
 * const pt = Lines.nearest(line, {x:10,y:10});
 * ```
 * 
 * If an array of lines is provided, it will be the closest point amongst all the lines
 * @param lineOrLines Line or array of lines
 * @param point Point to check
 * @returns Point `{ x, y }`
 */
export const nearest = (lineOrLines: Line | Line[] | readonly Line[], point: Point): Point => {
  const nearestImpl = (line: Line): Point => {
    const { a, b } = line;
    const atob = { x: b.x - a.x, y: b.y - a.y };
    const atop = { x: point.x - a.x, y: point.y - a.y };
    const length = atob.x * atob.x + atob.y * atob.y;

    let dot = atop.x * atob.x + atop.y * atob.y;
    const t = Math.min(1, Math.max(0, dot / length));
    dot = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    return { x: a.x + atob.x * t, y: a.y + atob.y * t };
  };

  if (Array.isArray(lineOrLines)) {
    const pts = (lineOrLines).map(line => nearestImpl(line));
    const dists = pts.map(p => PointsDistance(p, point));
    return Object.freeze<Point>(pts[ minIndex(dists) ]);
  } else {
    return Object.freeze<Point>(nearestImpl(lineOrLines as Line));
  }
};