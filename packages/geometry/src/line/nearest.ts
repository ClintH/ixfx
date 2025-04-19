import type { Point } from "../point/point-type.js";
import type { Line } from "./line-type.js";
import { distance as PointsDistance } from "../point/distance.js";
import { minIndex } from "@ixfx/numbers";
/**
 * Returns the nearest point on `line` closest to `point`.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const pt = Lines.nearest(line, {x:10,y:10});
 * ```
 * 
 * If an array of lines is provided, it will be the closest point amongst all the lines
 * @param line Line or array of lines
 * @param point
 * @returns Point `{ x, y }`
 */
export const nearest = (line: Line | readonly Line[], point: Point): Point => {

  const n = (line: Line): Point => {
    const { a, b } = line;
    const atob = { x: b.x - a.x, y: b.y - a.y };
    const atop = { x: point.x - a.x, y: point.y - a.y };
    const length = atob.x * atob.x + atob.y * atob.y;


    let dot = atop.x * atob.x + atop.y * atob.y;
    const t = Math.min(1, Math.max(0, dot / length));
    dot = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    return { x: a.x + atob.x * t, y: a.y + atob.y * t };
  };

  if (Array.isArray(line)) {
    const pts = line.map(l => n(l));
    const dists = pts.map(p => PointsDistance(p, point));
    return Object.freeze<Point>(pts[ minIndex(...dists) ]);
  } else {
    return Object.freeze<Point>(n(line as Line));
  }
};