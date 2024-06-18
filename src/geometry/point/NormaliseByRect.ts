import { throwNumberTest } from "../../util/GuardNumbers.js";
import type { Rect } from "../rect/RectTypes.js";
import { isRect } from "../rect/Guard.js";
import { isPoint } from "./Guard.js";
import type { Point } from "./PointType.js";

/**
 * Normalises a point by a given width and height
 * @param pt Point
 * @param width Width
 * @param height Height
 */
export function normaliseByRect(
  pt: Point,
  width: number,
  height: number
): Point;

export function normaliseByRect(pt: Point, rect: Rect): Point;

/**
 * Normalises x,y by width and height so it is on a 0..1 scale
 * @param x
 * @param y
 * @param width
 * @param height
 */
export function normaliseByRect(
  x: number,
  y: number,
  width: number,
  height: number
): Point;

/**
 * Normalises a point so it is on a 0..1 scale
 * @param a Point, or x
 * @param b y coord or width
 * @param c height or width
 * @param d height
 * @returns Point
 */
export function normaliseByRect(
  a: Point | number,
  b: number | Rect,
  c?: number,
  d?: number
): Point {
  // ✔️ Unit tested
  if (isPoint(a)) {
    if (typeof b === `number` && c !== undefined) {
      throwNumberTest(b, `positive`, `width`);
      throwNumberTest(c, `positive`, `height`);
    } else {
      if (!isRect(b)) {
        throw new Error(`Expected second parameter to be a rect`);
      }
      c = b.height;
      b = b.width;
    }
    return Object.freeze({
      x: a.x / b,
      y: a.y / c,
    });
  } else {
    throwNumberTest(a, `positive`, `x`);
    if (typeof b !== `number`) {
      throw new TypeError(`Expecting second parameter to be a number (width)`);
    }
    if (typeof c !== `number`) {
      throw new TypeError(`Expecting third parameter to be a number (height)`);
    }

    throwNumberTest(b, `positive`, `y`);
    throwNumberTest(c, `positive`, `width`);
    if (d === undefined) throw new Error(`Expected height parameter`);
    throwNumberTest(d, `positive`, `height`);
    return Object.freeze({
      x: a / c,
      y: b / d,
    });
  }
}