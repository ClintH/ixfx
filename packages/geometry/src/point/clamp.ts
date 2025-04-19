import { clamp as clampNumber } from '@ixfx/numbers';
import { throwNumberTest } from "@ixfx/guards";
import { isPoint, isPoint3d } from "./guard.js";
import type { Point, Point3d } from "./point-type.js";

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
  min = 0,
  max = 1
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
