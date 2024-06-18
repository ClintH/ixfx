import { clamp as clampNumber } from '../../data/Clamp.js';
import { throwNumberTest } from "../../util/GuardNumbers.js";
import { isPoint } from "./Guard.js";
import type { Point } from "./PointType.js";


/**
 * Clamps a point to be between `min` and `max` (0 & 1 by default)
 * @param pt Point
 * @param min Minimum value (0 by default)
 * @param max Maximum value (1 by default)
 */
export function clamp(pt: Point, min?: number, max?: number): Point;

/**
 * Clamps an x,y pair to be between `min` and `max` (0 & 1 by default)
 * @param x X coordinate
 * @param y Y coordinate
 * @param min Minimum value (0 by default)
 * @param max Maximum value (1 by default)
 */
export function clamp(x: number, y: number, min?: number, max?: number): Point;
export function clamp(
  a: Point | number,
  b?: number,
  c?: number,
  d?: number
): Point {
  // ✔️ Unit tested

  if (isPoint(a)) {
    if (b === undefined) b = 0;
    if (c === undefined) c = 1;
    throwNumberTest(b, ``, `min`);
    throwNumberTest(c, ``, `max`);
    return Object.freeze({
      x: clampNumber(a.x, b, c),
      y: clampNumber(a.y, b, c),
    });
  } else {
    if (b === undefined) throw new Error(`Expected y coordinate`);
    if (c === undefined) c = 0;
    if (d === undefined) d = 1;
    throwNumberTest(a, ``, `x`);
    throwNumberTest(b, ``, `y`);
    throwNumberTest(c, ``, `min`);
    throwNumberTest(d, ``, `max`);

    return Object.freeze({
      x: clampNumber(a, c, d),
      y: clampNumber(b, c, d),
    });
  }
}
