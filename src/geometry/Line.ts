import {guard as guardPoint} from './Point.js';
import {percent as guardPercent} from '../Guards.js';
import {Path} from './Path.js';
import { Rects, Points} from './index.js';

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

export const angleRadian = (lineOrPoint:Line|Points.Point, b?:Points.Point):number => {
  //eslint-disable-next-line functional/no-let
  let a:Points.Point;
  if (isLine(lineOrPoint)) {
    a = lineOrPoint.a;
    b = lineOrPoint.b;
  } else {
    a = lineOrPoint;
    if (b === undefined) throw new Error(`b point must be provided`);
  }
  return Math.atan2(b.y - a.y, b.x - a.x);
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
  //eslint-disable-next-line functional/no-let
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
  //eslint-disable-next-line functional/no-let
  let dot = atop.x * atob.x + atop.y * atob.y;
  const t = Math.min(1, Math.max(0, dot / len));
  dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  return {x: a.x + atob.x * t, y: a.y + atob.y * t};
};

/**
 * Calculates slope of line
 * @example
 * ```js
 * slope(line);
 * slope(ptA, ptB)
 * ```
 * @param lineOrPoint Line or point. If point is provided, second point must be given too
 * @param b Second point if needed
 * @returns 
 */
export const slope = (lineOrPoint:Line|Points.Point, b?:Points.Point):number => {
  //eslint-disable-next-line functional/no-let
  let a:Points.Point;
  if (isLine(lineOrPoint)) {
    //eslint-disable-next-line functional/no-let
    a = lineOrPoint.a;
  } else {
    a = lineOrPoint;
    if (b === undefined) throw new Error(`b parameter required`);
  }
  return (b!.y - a.y) / (b!.x - a.x);
};

export const extendX = (line:Line, xIntersection:number):Points.Point => {
  const y = line.a.y + (xIntersection - line.a.x) * slope(line);
  return {x: xIntersection, y};
};

/**
 * Returns a line extended from it's start (`a`) by a specified distance
 *
 * ```js
 * const line = {a: {x: 0, y:0}, b: {x:10, y:10} }
 * const extended = extendFromStart(line, 2);
 * ```
 * @param ine
 * @param distance
 * @return Newly extended line
 */
export const extendFromStart = (line:Line, distance:number):Line => {
  const len = length(line);
  return Object.freeze({
    a: line.a,
    b: Object.freeze({
      x: line.b.x + (line.b.x - line.a.x) / len * distance,
      y: line.b.y + (line.b.y - line.a.y) / len * distance,
    })
  })
  ;
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
};

/**
 * Calculates a point in-between a and b
 * @param amount Relative position, 0 being at a, 0.5 being halfway, 1 being at b
 * @param a Start
 * @param b End
 * @returns Point between a and b
 */
export const interpolate = (amount: number, a: Points.Point, b: Points.Point): Points.Point => {
  guardPoint(a, `a`);
  guardPoint(b, `b`);
  guardPercent(amount, `t`);

  const d = length(a, b);
  const d2 = d * (1 - amount);

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
export const toFlatArray = (a: Points.Point, b: Points.Point): readonly number[] =>  [a.x, a.y, b.x, b.y];

export const toSvgString = (a: Points.Point, b: Points.Point): readonly string[] => [`M${a.x} ${a.y} L ${b.x} ${b.y}`];

/**
 * Returns a line from four numbers [x1,y1,x2,y2]
 * @param arr Array in the form [x1,y1,x2,y2]
 * @returns Line
 */
export const fromArray = (arr: readonly number[]): Line => {
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

export const joinPointsToLines = (...points:readonly Points.Point[]): readonly Line[] => {
  //if (!(points.length % 2 === 0)) throw new Error(`Points array should be even-numbered`);
  const lines = [];
  //eslint-disable-next-line functional/no-let
  let start = points[0];
  //eslint-disable-next-line functional/no-loop-statement,functional/no-let
  for (let i=1;i<points.length;i++) {
    //eslint-disable-next-line functional/immutable-data
    lines.push(fromPoints(start, points[i]));
    start = points[i];
  }
  return lines;
};


export const fromPointsToPath = (a:Points.Point, b:Points.Point): LinePath => toPath(fromPoints(a, b));

export type LinePath = Line & Path & {
  toFlatArray():readonly number[]
}

export const bbox = (line:Line):Rects.RectPositioned =>  Points.bbox(line.a, line.b);

export const toPath = (line:Line): LinePath => {
  const {a, b} = line;
  return Object.freeze({
    ...line,
    length: () => length(a, b),
    interpolate: (amount: number) => interpolate(amount, a, b),
    bbox: () => bbox(line),
    toString: () => toString(a, b),
    toFlatArray: () => toFlatArray(a, b),
    toSvgString: () => toSvgString(a, b),
    toPoints: () => [a, b],
    kind: `line`
  });
};