import type { Rect3dPositioned, RectPositioned } from "../rect/rect-types.js";
import { findMinimum } from "./find-minimum.js";
import type { Point, Point3d } from "./point-type.js";
import { maxFromCorners as RectsMaxFromCorners } from '../rect/max.js';
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

export const bbox3d = (...points: ReadonlyArray<Point3d>): Rect3dPositioned => {
  const box = bbox(...points);
  const zMin = findMinimum((a: Point3d, b: Point3d) => {
    return a.z < b.z ? a : b
  }, ...points);
  const zMax = findMinimum((a: Point3d, b: Point3d) => {
    return a.z > b.z ? a : b
  }, ...points);

  return {
    ...box,
    z: zMin.z,
    depth: zMax.z - zMin.z
  }
}