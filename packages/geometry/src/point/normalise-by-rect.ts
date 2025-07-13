import { numberTest, resultThrow } from "@ixfx/guards";
import type { Rect } from "../rect/rect-types.js";
import { isRect } from "../rect/guard.js";
import { isPoint } from "./guard.js";
import type { Point } from "./point-type.js";

/**
 * Normalises a point by a given width and height
 * @param point Point
 * @param width Width
 * @param height Height
 */
export function normaliseByRect(
  point: Point,
  width: number,
  height: number
): Point;

/**
 * Normalises a point by a given rect's width and height
 * @param pt 
 * @param rect 
 */
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
      resultThrow(
        numberTest(b, `positive`, `width`),
        numberTest(c, `positive`, `height`)
      );
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
    resultThrow(numberTest(a, `positive`, `x`));
    if (typeof b !== `number`) {
      throw new TypeError(`Expecting second parameter to be a number (width)`);
    }
    if (typeof c !== `number`) {
      throw new TypeError(`Expecting third parameter to be a number (height)`);
    }

    resultThrow(numberTest(b, `positive`, `y`));
    resultThrow(numberTest(c, `positive`, `width`));
    if (d === undefined) throw new Error(`Expected height parameter`);
    resultThrow(numberTest(d, `positive`, `height`));
    return Object.freeze({
      x: a / c,
      y: b / d,
    });
  }
}