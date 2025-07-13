import type { Point } from "./point-type.js";

/**
 * Project `origin` by `distance` and `angle` (radians).
 *
 * To figure out rotation, imagine a horizontal line running through `origin`.
 * * Rotation = 0 deg puts the point on the right of origin, on same y-axis
 * * Rotation = 90 deg/3:00 puts the point below origin, on the same x-axis
 * * Rotation = 180 deg/6:00 puts the point on the left of origin on the same y-axis
 * * Rotation = 270 deg/12:00 puts the point above the origin, on the same x-axis
 *
 * ```js
 * // Yields a point 100 units away from 10,20 with 10 degrees rotation (ie slightly down)
 * const a = Points.project({x:10, y:20}, 100, degreeToRadian(10));
 * ```
 * @param origin
 * @param distance
 * @param angle
 * @returns
 */
export const project = (origin: Point, distance: number, angle: number) => {
  const x = Math.cos(angle) * distance + origin.x;
  const y = Math.sin(angle) * distance + origin.y;
  return { x, y };
};