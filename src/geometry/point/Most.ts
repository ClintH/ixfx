import { findMinimum } from "./FindMinimum.js";
import type { Point } from "./PointType.js";

/**
 * Returns the left-most of the provided points.
 *
 * Same as:
 * ```js
 * findMinimum((a, b) => {
 *  if (a.x <= b.x) return a;
 *  return b;
 *}, ...points)
 * ```
 *
 * @param points
 * @returns
 */
export const leftmost = (...points: ReadonlyArray<Point>): Point =>
  findMinimum((a, b) => (a.x <= b.x ? a : b), ...points);

/**
 * Returns the right-most of the provided points.
 *
 * Same as:
 * ```js
 * findMinimum((a, b) => {
 *  if (a.x >= b.x) return a;
 *  return b;
 *}, ...points)
 * ```
 *
 * @param points
 * @returns
 */
export const rightmost = (...points: ReadonlyArray<Point>): Point =>
  findMinimum((a, b) => (a.x >= b.x ? a : b), ...points);
