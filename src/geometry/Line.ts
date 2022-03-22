import {guard as guardPoint} from './Point.js';
import {percent as guardPercent} from '../Guards.js';
import {Path} from './Path.js';
import { Rects, Points} from './index.js';

export type Line = {
  readonly a: Points.Point
  readonly b: Points.Point
}

export const isLine = (p: Path | Line | Points.Point): p is Line => {
  if (p === undefined) return false;
  return (p as Line).a !== undefined && (p as Line).b !== undefined;
};

/**
 * Returns true if the lines have the same value
 *
 * @param {Line} a
 * @param {Line} b
 * @returns {boolean}
 */
export const equals = (a:Line, b:Line):boolean =>  a.a === b.a && a.b === b.b;

/**
 * Applies `fn` to both start and end points.
 * 
 * ```js
 * // Line 10,10 -> 20,20
 * const line = Lines.fromNumbers(10,10, 20,20);
 * 
 * // Applies randomisation to x&y
 * const rand = (p) => ({
 *  x: p.x * Math.random(),
 *  y: p.y * Math.random()
 * });
 * 
 * // Applies our randomisation function
 * const line2 = apply(line, rand);
 * ```
 * @param line Line
 * @param fn Function that takes a point and returns a point
 * @returns 
 */
export const apply = (line:Line, fn:(p:Points.Point) => Points.Point) => (
  {
    ...line,
    a: fn(line.a),
    b: fn(line.b)
  }
);

/**
 * Throws an exception if:
 * * line is undefined
 * * a or b parameters are missing
 * 
 * Does not validate points
 * @param line 
 * @param paramName 
 */
export const guard = (line:Line, paramName:string = `line`) => {
  if (line === undefined) throw new Error(`${paramName} undefined`);
  if (line.a === undefined) throw new Error(`${paramName}.a undefined. Expected {a:Point, b:Point}`);
  if (line.b === undefined) throw new Error(`${paramName}.b undefined. Expected {a:Point, b:Point}`);
};

/**
 * Returns the angle in radians of a line, or two points
 * ```js
 * angleRadian(line);
 * angleRadian(ptA, ptB);
 * ```
 * @param lineOrPoint 
 * @param b 
 * @returns 
 */
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

/**
 * Multiplies start and end of line by x,y given in `p`.
 * ```js
 * // Line 1,1 -> 10,10
 * const l = fromNumbers(1,1,10,10);
 * const ll = multiply(l, {x:2, y:3});
 * // Yields: 2,20 -> 3,30
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const multiply = (line:Line, point:Points.Point):Line => ({ 
  a: Points.multiply(line.a, point),
  b: Points.multiply(line.b, point)
});

/**
 * Returns true if `point` is within `maxRange` of `line`.
 * ```js
 * const line = Lines.fromNumbers(0,20,20,20);
 * Lines.withinRange(line, {x:0,y:21}, 1); // True
 * ```
 * @param line
 * @param point
 * @param maxRange 
 * @returns True if point is within range
 */
export const withinRange = (line:Line, point:Points.Point, maxRange:number):boolean =>  {
  const dist = distance(line, point);
  return dist <= maxRange;
};

/**
 * Returns the length of a line or length between two points
 * ```js
 * length(line);
 * length(ptA, ptB);
 * ```
 * @param aOrLine Line or first point
 * @param b Second point
 * @returns 
 */
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

/**
 * Returns the nearest point on `line` closest to `point`.
 * ```js
 * nearest(line, {x:10,y:10});
 * ```
 * @param line
 * @param point
 * @returns Point {x,y}
 */
export const nearest = (line:Line, point:Points.Point): Points.Point => {
  const {a, b} = line;
  const atob = { x: b.x - a.x, y: b.y - a.y };
  const atop = { x: point.x - a.x, y: point.y - a.y };
  const len = atob.x * atob.x + atob.y * atob.y;
  //eslint-disable-next-line functional/no-let
  let dot = atop.x * atob.x + atop.y * atob.y;
  const t = Math.min(1, Math.max(0, dot / len));
  dot = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
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
    b = lineOrPoint.b;
  } else {
    a = lineOrPoint;
    if (b === undefined) throw new Error(`b parameter required`);
  }
  if (b !== undefined) {
    return (b.y - a.y) / (b.x - a.x);
  } else throw Error(`Second point missing`);
};

/**
 * Extends a line to intersection the x-axis at a specified location
 * @param line Line to extend
 * @param xIntersection Intersection of x-axis.
 */
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

/**
 * Returns the distance of `point` to the 
 * nearest point on `line`.
 * 
 * ```js
 * distance(line, {x:10,y:10});
 * ```
 * @param line
 * @param point
 * @returns 
 */
export const distance = (line:Line, point:Points.Point):number => {
  guard(line, `line`);
  guardPoint(point, `point`);

  const lineLength = length(line);
  if (lineLength === 0) {
    // Line is really a point
    return length(line.a, point);
  }

  const near = nearest(line, point);
  return length(near, point);
};

/**
 * Calculates a point in-between `a` and `b`.
 * 
 * ```js
 * // Get {x,y} at 50% along line
 * interpolate(0.5, line);
 * 
 * // Get {x,y} at 80% between point A and B
 * interpolate(0.8, ptA, ptB);
 * ```
 * @param amount Relative position, 0 being at a, 0.5 being halfway, 1 being at b
 * @param a Start
 * @param b End
 * @returns Point between a and b
 */
export  function interpolate(amount: number, a: Points.Point, b: Points.Point): Points.Point;
export  function interpolate(amount: number, line:Line): Points.Point;

//eslint-disable-next-line func-style
export function interpolate(amount:number, a:Points.Point|Line, b?:Points.Point): Points.Point {
  guardPercent(amount, `amount`);
  if (isLine(a)) {
    b = a.b;
    a = a.a;
  }

  if (!Points.isPoint(a)) throw new Error(`Expected point`);
  if (!Points.isPoint(b)) throw new Error(`Expected point`);

  guardPoint(a, `a`);
  guardPoint(b, `b`);

  const d = length(a, b);
  const d2 = d * (1 - amount);

  const x = b.x - (d2 * (b.x - a.x) / d);
  const y = b.y - (d2 * (b.y - a.y) / d);
  return {x: x, y: y};
}

/**
 * Returns a string representation of line, or two points
 * @param a 
 * @param b 
 * @returns 
 */
export function toString (a: Points.Point, b: Points.Point): string;

export function toString(line:Line):string;

//eslint-disable-next-line func-style
export function toString(a:Points.Point|Line, b?:Points.Point):string {
  if (isLine(a)) {
    guard(a, `a`);
    b = a.b;
    a = a.a;
  } else if (b === undefined) throw new Error(`Expect second point if first is a point`);
  return Points.toString(a) + `-` + Points.toString(b);
}

/**
 * Returns a line from a basis of coordinates
 * ```js
 * // Line from 0,1 -> 10,15
 * fromNumbers(0,1,10,15);
 * ```
 * @param x1 
 * @param y1 
 * @param x2 
 * @param y2 
 * @returns 
 */
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

/**
 * Returns a line from two points
 * ```js
 * // Line from 0,1 to 10,15
 * fromPoints({x:0,y:1}, {x:10,y:15});
 * ```
 * @param a Start point
 * @param b End point
 * @returns 
 */
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

/**
 * Returns an array of lines that connects provided points.
 * 
 * Eg, if points a,b,c are provided, two lines are provided: a->b and b->c
 * @param points 
 * @returns 
 */
export const joinPointsToLines = (...points:readonly Points.Point[]): readonly Line[] => {
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

/**
 * Returns a rectangle that encompasses dimension of line
 */
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
    rotate: () => (amountRadian:number, origin:Points.Point) => rotate(line, amountRadian, origin),
    kind: `line`
  });
};

/**
 * Returns a line that is rotated by `angleRad`. By default it rotates
 * around its center, but an arbitrary `origin` point can be provided.
 * If `origin` is a number, it's presumed to be a 0..1 percentage of the line.
 * 
 * ```js
 * // Rotates line by 0.1 radians around point 10,10
 * rotate(line, 0.1, {x:10,y:10});
 * 
 * // Rotate line by 5 degrees around its center
 * rotate(line, degreeToRadian(5));
 * 
 * // Rotate line by 5 degres around its end point
 * rotate(line, degreeToRadian(5), line.b);
 * ```
 * @param line Line to rotate
 * @param amountRadian Angle in radians to rotate by
 * @param origin Point to rotate around. If undefined, middle of line will be used
 * @returns 
 */
export const rotate = (line:Line, amountRadian?:number, origin?:Points.Point|number):Line => {
  if (amountRadian === undefined || amountRadian === 0) return line;
  if (origin === undefined) origin = 0.5;
  if (typeof origin === `number`) {
    guardPercent(origin, `origin`);
    origin = interpolate(origin, line.a, line.b);
  }
  return {
    a: Points.rotate(line.a, amountRadian, origin),
    b: Points.rotate(line.b, amountRadian, origin)
  };
};