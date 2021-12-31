import * as Rects from './Rect.js';
import {Point, pointToString} from './Point.js';
import {guard as guardPoint} from './Point.js';
import {percent as guardPercent} from '../Guards.js';
import {Path} from './Path.js';

export type Line = Path & {
  readonly a: Point
  readonly b: Point
}

export function length(a: Point, b: Point): number {
  guardPoint(a, 'a');
  guardPoint(a, 'b');

  const x = b.x - a.x;
  const y = b.y - a.y;
  if (a.z !== undefined && b.z !== undefined) {
    const z = b.z - a.z;
    return Math.hypot(x, y, z);
  } else {
    return Math.hypot(x, y);
  }
}


export function compute(a: Point, b: Point, t: number): Point {
  guardPoint(a, 'a');
  guardPoint(b, 'b');
  guardPercent(t, 't');

  const d = length(a, b);
  const d2 = d * (1 - t);

  const x = b.x - (d2 * (b.x - a.x) / d);
  const y = b.y - (d2 * (b.y - a.y) / d);
  return {x: x, y: y};
}

export function bbox(...points: Point[]): Rects.Rect {
  const x = points.map(p => p.x);
  const y = points.map(p => p.y);

  const xMin = Math.min(...x);
  const xMax = Math.max(...x);
  const yMin = Math.min(...y);
  const yMax = Math.max(...y);

  return Rects.fromTopLeft(
    {x: xMin, y: yMin},
    xMax - xMin,
    yMax - yMin
  );
}

export function toString(a: Point, b: Point): string {
  return pointToString(a) + '-' + pointToString(b);
}

export function fromNumbers(x1: number, y1: number, x2: number, y2: number): Line {
  if (Number.isNaN(x1)) throw 'x1 is NaN';
  if (Number.isNaN(x2)) throw 'x2 is NaN';
  if (Number.isNaN(y1)) throw 'y1 is NaN';
  if (Number.isNaN(y2)) throw 'y2 is NaN';

  const a = {x: x1, y: y1};
  const b = {x: x2, y: y2};
  return fromPoints(a, b);
}

/**
 * Returns an array representation of line: [a.x, a.y, b.x, b.y]
 *
 * @export
 * @param {Point} a
 * @param {Point} b
 * @returns {number[]}
 */
export function toArray(a: Point, b: Point): number[] {
  return [a.x, a.y, b.x, b.y];
}

export function toSvgString(a: Point, b: Point): string {
  return `M${a.x} ${a.y} L ${b.x} ${b.y}`
}

export function fromArray(arr: number[]): Line {
  if (!Array.isArray(arr)) throw 'arr parameter is not an array';
  if (arr.length !== 4) throw 'array is expected to have length four';
  return fromNumbers(arr[0], arr[1], arr[2], arr[3]);
}

export type LineInstance = Line & {
  length: () => number,
  toArray: () => number[],
  bbox: () => Rects.Rect,
  compute: (t: number) => Point
}

export function fromPoints(a: Point, b: Point): LineInstance {
  guardPoint(a, 'a');
  guardPoint(b, 'b');
  a = Object.freeze(a);
  b = Object.freeze(b);
  return Object.freeze({
    a: a,
    b: b,
    length: () => length(a, b),
    compute: (t: number) => compute(a, b, t),
    bbox: () => bbox(a, b),
    toString: () => toString(a, b),
    toArray: () => toArray(a, b),
    toSvgString: () => toSvgString(a, b)
  });
}