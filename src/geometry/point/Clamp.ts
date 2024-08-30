import { clamp as clampNumber } from '../../numbers/Clamp.js';
import { throwNumberTest } from "../../util/GuardNumbers.js";
import { isPoint, isPoint3d } from "./Guard.js";
import type { Point, Point3d } from "./PointType.js";

export function clamp(a: Point, min?: number, max?: number): Point;
export function clamp(a: Point3d, min?: number, max?: number): Point3d;

/**
 * Clamps a point to be between `min` and `max` (0 & 1 by default)
 * @param pt Point
 * @param min Minimum value (0 by default)
 * @param max Maximum value (1 by default)
 */
export function clamp(
  a: Point,
  min: number = 0,
  max: number = 1
): Point {

  if (isPoint3d(a)) {
    return Object.freeze({
      x: clampNumber(a.x, min, max),
      y: clampNumber(a.y, min, max),
      z: clampNumber(a.z, min, max)
    });
  } else {
    return Object.freeze({
      x: clampNumber(a.x, min, max),
      y: clampNumber(a.y, min, max),
    });
  }
}
