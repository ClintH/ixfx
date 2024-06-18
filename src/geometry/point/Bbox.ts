import type { RectPositioned } from "../rect/RectTypes.js";
import { findMinimum } from "./FindMinimum.js";
import type { Point } from "./PointType.js";
import { maxFromCorners as RectsMaxFromCorners } from '../rect/index.js';
/**
 * Returns the minimum rectangle that can enclose all provided points
 * @param points
 * @returns
 */
export const bbox = (...points: ReadonlyArray<Point>): RectPositioned => {
  const leftMost = findMinimum((a, b) => {
    return a.x < b.x ? a : b;
  }, ...points);
  const rightMost = findMinimum((a, b) => {
    return a.x > b.x ? a : b;
  }, ...points);
  const topMost = findMinimum((a, b) => {
    return a.y < b.y ? a : b;
  }, ...points);
  const bottomMost = findMinimum((a, b) => {
    return a.y > b.y ? a : b;
  }, ...points);

  const topLeft = { x: leftMost.x, y: topMost.y };
  const topRight = { x: rightMost.x, y: topMost.y };
  const bottomRight = { x: rightMost.x, y: bottomMost.y };
  const bottomLeft = { x: leftMost.x, y: bottomMost.y };
  return RectsMaxFromCorners(topLeft, topRight, bottomRight, bottomLeft);
};
