import * as Rects from './Rect.js';
import {Point, pointToString} from './Point.js';
import {guard as guardPoint} from './Point.js';
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


function guardPercent(t: number, name = 'Parameter') {
  if (isNaN(t)) throw Error(`${name} is NaN`);
  if (t < 0) throw Error(`${name} must be above or equal to 0`);
  if (t > 1) throw Error(`${name} must be below or equal to 1`);
}

export function compute(a: Point, b: Point, t: number): Point {
  guardPoint(a, 'a');
  guardPoint(b, 'b');
  if (t > 1) debugger;
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
  const a = {x: x1, y: y1};
  const b = {x: x2, y: y2};
  return fromPoints(a, b);
}

export function fromPoints(a: Point, b: Point): Line {
  a = Object.freeze(a);
  b = Object.freeze(b);
  return Object.freeze({
    a: a,
    b: b,
    length: () => length(a, b),
    compute: (t) => compute(a, b, t),
    bbox: () => bbox(a, b),
    toString: () => toString(a, b),
  });
}