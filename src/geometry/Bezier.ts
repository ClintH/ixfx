
import {Bezier as BezierLib} from 'bezier-js';

import * as Paths from './Path.js';
import * as Points from './Point.js';
import * as Rects from './Rect.js';
import * as Lines from './Line.js';

export type QuadraticBezier = Paths.Path & {
  a: Points.Point,
  b: Points.Point,
  quadratic: Points.Point
}
/**
 * Returns a new quadratic bezier with specified bend amount
 *
 * @param {QuadraticBezier} b Curve
 * @param {number} [bend=0] Bend amount, from -1 to 1
 * @returns {QuadraticBezier}
 */
export const quadraticBend = function (b: QuadraticBezier, bend: number = 0): QuadraticBezier {
  return quadraticSimple(b.a, b.b, bend);
}

/**
 * Creates a simple quadratic bezier with a specified amount of 'bend'.
 * Bend of -1 will pull curve down, 1 will pull curve up. 0 is no curve
 * @param {Points.Point} start Start of curbe
 * @param {Points.Point} end End of curbe
 * @param {number} [bend=0] Bend amount, -1 to 1
 * @returns {QuadraticBezier}
 */
export const quadraticSimple = function (start: Points.Point, end: Points.Point, bend: number = 0): QuadraticBezier {
  if (isNaN(bend)) throw Error('bend is NaN');
  if (bend < -1 || bend > 1) throw Error('Expects bend range of -1 to 1');

  let middle = Lines.compute(start, end, 0.5);
  let target = middle;
  if (end.y < start.y) {
    // Upward slope
    target = bend > 0 ? {x: Math.min(start.x, end.x), y: Math.min(start.y, end.y)} :
      {x: Math.max(start.x, end.x), y: Math.max(start.y, end.y)}
  } else {
    // Downward slope
    target = bend > 0 ? {x: Math.max(start.x, end.x), y: Math.min(start.y, end.y)} :
      {x: Math.min(start.x, end.x), y: Math.max(start.y, end.y)}
  }

  let handle = Lines.compute(middle, target, Math.abs(bend));
  //console.log(`bend: ${bend} middle: ${middle.x},${middle.y} handle: ${handle.x}, ${handle.y}`);
  return quadratic(start, end, handle);
}

export const quadratic = function (start: Points.Point, end: Points.Point, handle: Points.Point): QuadraticBezier {
  const b = new BezierLib(start, handle, end);
  return Object.freeze({
    a: start,
    b: end,
    quadratic: handle,
    length: () => b.length(),
    compute: (t: number) => b.compute(t),
    bbox: () => {
      const {x, y} = b.bbox();
      return Rects.fromTopLeft({x: x.min, y: y.min}, x.size!, y.size!);
    },
    toString: () => b.toString()
  });
}