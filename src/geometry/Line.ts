import * as Rects from './Rect.js';
import * as Points  from './Point.js';
import {guard as guardPoint} from './Point.js';
import {percent as guardPercent} from '../Guards.js';
import {Path} from './Path.js';

export type Line = {
  readonly a: Points.Point
  readonly b: Points.Point
}

export const isLine = (p: Path | Line | Points.Point): p is Line => (p as Line).a !== undefined && (p as Line).b !== undefined;

/**
 * Returns true if the lines have the same value
 *
 * @param {Line} a
 * @param {Line} b
 * @returns {boolean}
 */
export const equals = (a:Line, b:Line):boolean =>  a.a === b.a && a.b === b.b;

export const guard = (l:Line, paramName:string = `line`) => {
  if (l === undefined) throw new Error(`${paramName} undefined`);
  if (l.a === undefined) throw new Error(`${paramName}.a undefined. Expected {a:Point, b:Point}`);
  if (l.b === undefined) throw new Error(`${paramName}.b undefined. Expected {a:Point, b:Point}`);
};

export const withinRange = (l:Line, p:Points.Point, maxRange:number):boolean =>  {
  // if (typeof maxRange === `number`) {
  //   maxRange = {x:maxRange, y:maxRange};
  // }
  const dist = distance(l, p);
  return dist <= maxRange;
  // const x = Math.abs(b.x - a.x);
  // const y = Math.abs(b.y - a.y);
  // return (x <= maxRange.x && y<= maxRange.y);
};

export const length = (aOrLine: Points.Point|Line, b?: Points.Point): number => {
  let a;
  if (isLine(aOrLine)) {
    b = aOrLine.b;
    a = aOrLine.a;
  } else {
    a = aOrLine;
    if (b === undefined) throw new Error(`Requires both a and b parameters`);
  }
  guardPoint(a, `a`);
  guardPoint(a, `b`);

  const x = b.x - a.x;
  const y = b.y - a.y;
  if (a.z !== undefined && b.z !== undefined) {
    const z = b.z - a.z;
    return Math.hypot(x, y, z);
  } else {
    return Math.hypot(x, y);
  }
};

export const nearest = (line:Line, p:Points.Point): Points.Point => {
  const {a, b} = line;
  const atob = { x: b.x - a.x, y: b.y - a.y };
  const atop = { x: p.x - a.x, y: p.y - a.y };
  const len = atob.x * atob.x + atob.y * atob.y;
  let dot = atop.x * atob.x + atop.y * atob.y;
  const t = Math.min(1, Math.max(0, dot / len));
  dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  return {x: a.x + atob.x * t, y: a.y + atob.y * t};
};


export const distance = (l:Line, p:Points.Point):number => {
  guard(l, `l`);
  guardPoint(p, `p`);

  const lineLength = length(l);
  if (lineLength === 0) {
    // Line is really a point
    return length(l.a, p);
  }

  const near = nearest(l, p);
  return length(near, p);
  
  const {a, b} = l;
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / lineLength;
  t = Math.max(0, Math.min(1, t));
  return length(p, {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y)
  });
};

export const compute = (a: Points.Point, b: Points.Point, t: number): Points.Point => {
  guardPoint(a, `a`);
  guardPoint(b, `b`);
  guardPercent(t, `t`);

  const d = length(a, b);
  const d2 = d * (1 - t);

  const x = b.x - (d2 * (b.x - a.x) / d);
  const y = b.y - (d2 * (b.y - a.y) / d);
  return {x: x, y: y};
};

export const toString = (a: Points.Point, b: Points.Point): string => Points.toString(a) + `-` + Points.toString(b);

export const fromNumbers = (x1: number, y1: number, x2: number, y2: number): Line => {
  if (Number.isNaN(x1)) throw new Error(`x1 is NaN`);
  if (Number.isNaN(x2)) throw new Error(`x2 is NaN`);
  if (Number.isNaN(y1)) throw new Error(`y1 is NaN`);
  if (Number.isNaN(y2)) throw new Error(`y2 is NaN`);

  const a = {x: x1, y: y1};
  const b = {x: x2, y: y2};
  return fromPoints(a, b);
};

/**
 * Returns an array representation of line: [a.x, a.y, b.x, b.y]
 *
 * @export
 * @param {Point} a
 * @param {Point} b
 * @returns {number[]}
 */
export const toFlatArray = (a: Points.Point, b: Points.Point): number[] =>  [a.x, a.y, b.x, b.y];

export const toSvgString = (a: Points.Point, b: Points.Point): string => `M${a.x} ${a.y} L ${b.x} ${b.y}`;

export const fromArray = (arr: number[]): Line => {
  if (!Array.isArray(arr)) throw new Error(`arr parameter is not an array`);
  if (arr.length !== 4) throw new Error(`array is expected to have length four`);
  return fromNumbers(arr[0], arr[1], arr[2], arr[3]);
};

export const fromPoints = (a: Points.Point, b: Points.Point): Line => {
  guardPoint(a, `a`);
  guardPoint(b, `b`);
  a = Object.freeze(a);
  b = Object.freeze(b);
  return Object.freeze({
    a: a,
    b: b
  });
};

export const fromManyPoints = (...points:Points.Point[]): Line[] => {
  if (!(points.length % 2 === 0)) throw new Error(`Points array should be even-numbered`);
  const lines = [];
  for (let i=0;i<points.length;i+2) {
    lines.push(fromPoints(points[i], points[i+1]));
  }
  return lines;
};

export const fromPointsToPath = (a:Points.Point, b:Points.Point): LinePath => toPath(fromPoints(a, b));

export type LinePath = Line & Path & {
  toFlatArray():number[]
}

export const bbox = (line:Line):Rects.Rect =>  Points.bbox(line.a, line.b);

export const toPath = (line:Line): LinePath => {
  const {a, b} = line;
  return Object.freeze({
    ...line,
    length: () => length(a, b),
    compute: (t: number) => compute(a, b, t),
    bbox: () => bbox(line),
    toString: () => toString(a, b),
    toFlatArray: () => toFlatArray(a, b),
    toSvgString: () => toSvgString(a, b),
    toPoints: () => [a, b],
    kind: `line`
  });
};