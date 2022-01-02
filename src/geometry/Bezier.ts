
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
export const quadraticBend = (b: QuadraticBezier, bend = 0): QuadraticBezier => quadraticSimple(b.a, b.b, bend);

/**
 * Creates a simple quadratic bezier with a specified amount of 'bend'.
 * Bend of -1 will pull curve down, 1 will pull curve up. 0 is no curve
 * @param {Points.Point} start Start of curbe
 * @param {Points.Point} end End of curbe
 * @param {number} [bend=0] Bend amount, -1 to 1
 * @returns {QuadraticBezier}
 */
export const quadraticSimple = (start: Points.Point, end: Points.Point, bend = 0): QuadraticBezier => {
  if (isNaN(bend)) throw Error(`bend is NaN`);
  if (bend < -1 || bend > 1) throw Error(`Expects bend range of -1 to 1`);

  const middle = Lines.compute(start, end, 0.5);
  let target = middle;
  if (end.y < start.y) {
    // Upward slope
    target = bend > 0 ? {x: Math.min(start.x, end.x), y: Math.min(start.y, end.y)} :
      {x: Math.max(start.x, end.x), y: Math.max(start.y, end.y)};
  } else {
    // Downward slope
    target = bend > 0 ? {x: Math.max(start.x, end.x), y: Math.min(start.y, end.y)} :
      {x: Math.min(start.x, end.x), y: Math.max(start.y, end.y)};
  }

  const handle = Lines.compute(middle, target, Math.abs(bend));
  //console.log(`bend: ${bend} middle: ${middle.x},${middle.y} handle: ${handle.x}, ${handle.y}`);
  return quadratic(start, end, handle);
};

//https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
export const quadraticToSvgString = (start: Points.Point, end: Points.Point, handle: Points.Point): string => `M ${start.x} ${start.y} Q ${handle.x} ${handle.y} ${end.x} ${end.y}`;

export const quadratic = (start: Points.Point, end: Points.Point, handle: Points.Point): QuadraticBezier => {
  start = Object.freeze(start);
  end = Object.freeze(end);
  handle = Object.freeze(handle);

  const bzr = new BezierLib(start, handle, end);
  return Object.freeze({
    a: start,
    b: end,
    quadratic: handle,
    length: () => bzr.length(),
    compute: (t: number) => bzr.compute(t),
    bbox: () => {
      const {x, y} = bzr.bbox();
      return Rects.fromTopLeft({x: x.min, y: y.min}, x.size!, y.size!);
    },
    toString: () => bzr.toString(),
    toSvgString: () => quadraticToSvgString(start, end, handle)
  });
};