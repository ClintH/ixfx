import * as Arrays from '../../collections/arrays/index.js';
import { minFast } from '../../collections/arrays/NumericArrays.js';
import { throwNumberTest, throwPercentTest } from '../../Guards.js';
import * as Points from '../point/index.js';
import { guard as guardPoint } from '../point/Guard.js';
import type { RectPositioned, Path, Point } from '../Types.js';

/**
 * A line, which consists of an `a` and `b` {@link Point}.
 */
export type Line = {
  readonly a: Point
  readonly b: Point
}

/**
 * A PolyLine, consisting of more than one line.
 */
export type PolyLine = ReadonlyArray<Line>;


//eslint-disable-next-line @typescript-eslint/naming-convention
export const Empty = Object.freeze({
  a: Object.freeze({ x: 0, y: 0 }),
  b: Object.freeze({ x: 0, y: 0 })
});

//eslint-disable-next-line @typescript-eslint/naming-convention
export const Placeholder = Object.freeze({
  a: Object.freeze({ x: Number.NaN, y: Number.NaN }),
  b: Object.freeze({ x: Number.NaN, y: Number.NaN })
});

/**
 * Returns true if `l` is the same as Line.Empty, that is
 * the `a` and `b` points are Points.Empty.
 * @param l 
 * @returns 
 */
export const isEmpty = (l: Line): boolean => Points.isEmpty(l.a) && Points.isEmpty(l.b);

export const isPlaceholder = (l: Line): boolean => Points.isPlaceholder(l.a) && Points.isPlaceholder(l.b);

/**
 * Returns true if `p` is a valid line, containing `a` and `b` Points.
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.isLine(l);
 * ```
 * @param p Value to check
 * @returns True if a valid line.
 */
export const isLine = (p: Path | Line | Points.Point): p is Line => {
  if (p === undefined) return false;
  if ((p as Line).a === undefined) return false;
  if ((p as Line).b === undefined) return false;
  if (!Points.isPoint((p as Line).a)) return false;
  if (!Points.isPoint((p as Line).b)) return false;
  return true;
};

/**
 * Returns true if `p` is a {@link PolyLine}, ie. an array of {@link Line}s.
 * Validates all items in array.
 * @param p 
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPolyLine = (p: any): p is PolyLine => {
  if (!Array.isArray(p)) return false;

  const valid = !p.some(v => !isLine(v));
  return valid;
};

/**
 * Returns true if the lines have the same value. Note that only
 * the line start and end points are compared. So the lines might
 * be different in other properties, and `isEqual` will still return
 * true.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const a = { a: {x:0,  y: 10 }, b: { x: 20, y: 20 }};
 * const b = { a: {x:0,  y: 10 }, b: { x: 20, y: 20 }};
 * a === b; // false, because they are different objects
 * Lines.isEqual(a, b); // true, because they have the same value
 * ```
 * @param {Line} a
 * @param {Line} b
 * @returns {boolean}
 */
export const isEqual = (a: Line, b: Line): boolean => Points.isEqual(a.a, b.a) && Points.isEqual(a.b, b.b);

/**
 * Applies `fn` to both start and end points.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line 10,10 -> 20,20
 * const line = Lines.fromNumbers(10,10, 20,20);
 * 
 * // Applies randomisation to both x and y.
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
export const apply = (line: Line, fn: (p: Points.Point) => Points.Point) => Object.freeze<Line>(
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
 * @param name 
 */
export const guard = (line: Line, name = `line`) => {
  if (line === undefined) throw new Error(`${ name } undefined`);
  if (line.a === undefined) throw new Error(`${ name }.a undefined. Expected {a:Point, b:Point}. Got: ${ JSON.stringify(line) }`);
  if (line.b === undefined) throw new Error(`${ name }.b undefined. Expected {a:Point, b:Point} Got: ${ JSON.stringify(line) }`);
};

/**
 * Returns the angle in radians of a line, or two points
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.angleRadian(line);
 * Lines.angleRadian(ptA, ptB);
 * ```
 * @param lineOrPoint 
 * @param b 
 * @returns 
 */
export const angleRadian = (lineOrPoint: Line | Points.Point, b?: Points.Point): number => {
  let a: Points.Point;
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
 * Multiplies start and end of line by point.x, point.y.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1, 1, 10, 10);
 * const ll = Lines.multiply(l, {x:2, y:3});
 * // Yields: 2,20 -> 3,30
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const multiply = (line: Line, point: Points.Point): Line => (Object.freeze({
  ...line,
  a: Points.multiply(line.a, point),
  b: Points.multiply(line.b, point)
}));

/**
 * Divides both start and end points by given x,y
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.divide(l, {x:2, y:4});
 * // Yields: 0.5,0.25 -> 5,2.5
 * ```
 * 
 * Dividing by zero will give Infinity for that dimension.
 * @param line 
 * @param point 
 * @returns 
 */
export const divide = (line: Line, point: Points.Point): Line => Object.freeze({
  ...line,
  a: Points.divide(line.a, point),
  b: Points.divide(line.b, point)
});

/**
 * Adds both start and end points by given x,y
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.sum(l, {x:2, y:4});
 * // Yields: 3,5 -> 12,14
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const sum = (line: Line, point: Points.Point): Line => Object.freeze({
  ...line,
  a: Points.sum(line.a, point),
  b: Points.sum(line.b, point)
});

/**
 * Subtracts both start and end points by given x,y
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.subtract(l, {x:2, y:4});
 * // Yields: -1,-3 -> 8,6
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const subtract = (line: Line, point: Points.Point): Line => Object.freeze({
  ...line,
  a: Points.subtract(line.a, point),
  b: Points.subtract(line.b, point)
});

/**
 * Normalises start and end points by given width and height. Useful
 * for converting an absolutely-defined line to a relative one.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.normaliseByRect(l, 10, 10);
 * // Yields: 0.1,0.1 -> 1,1
 * ```
 * @param line 
 * @param width
 * @param height 
 * @returns 
 */
export const normaliseByRect = (line: Line, width: number, height: number): Line => Object.freeze({
  ...line,
  a: Points.normaliseByRect(line.a, width, height),
  b: Points.normaliseByRect(line.b, width, height)
});


/**
 * Returns true if `point` is within `maxRange` of `line`.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const line = Lines.fromNumbers(0,20,20,20);
 * Lines.withinRange(line, {x:0,y:21}, 1); // True
 * ```
 * @param line
 * @param point
 * @param maxRange 
 * @returns True if point is within range
 */
export const withinRange = (line: Line, point: Points.Point, maxRange: number): boolean => {
  const calculatedDistance = distance(line, point);
  return calculatedDistance <= maxRange;
};

/**
 * Returns the length between two points
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.length(ptA, ptB);
 * ```
 * @param a First point
 * @param b Second point
 * @returns 
 */
export function length(a: Points.Point, b: Points.Point): number;

/**
 * Returns length of line. If a polyline (array of lines) is provided,
 * it is the sum total that is returned.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.length(a: {x:0, y:0}, b: {x: 100, y:100});
 * Lines.length(lines);
 * ```
 * @param line Line
 */
export function length(line: Line | PolyLine): number;

/**
 * Returns length of line, polyline or between two points
 * 
 * @param aOrLine Point A, line or polyline (array of lines)
 * @param pointB Point B, if first parameter is a point
 * @returns Length (total accumulated length for arrays)
 */
//eslint-disable-next-line func-style
export function length(aOrLine: Points.Point | Line | PolyLine, pointB?: Points.Point): number {
  if (isPolyLine(aOrLine)) {
    const sum = aOrLine.reduce((accumulator, v) => length(v) + accumulator, 0);
    return sum;
  }
  if (aOrLine === undefined) throw new TypeError(`Parameter 'aOrLine' is undefined`);
  const [ a, b ] = getPointParameter(aOrLine, pointB);
  const x = b.x - a.x;
  const y = b.y - a.y;
  if (a.z !== undefined && b.z !== undefined) {
    const z = b.z - a.z;
    return Math.hypot(x, y, z);
  } else {
    return Math.hypot(x, y);
  }
}

/**
 * Returns the mid-point of a line (same as `interpolate` with an amount of 0.5)
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.midpoint(line); // Returns {x, y}
 * ```
 * @param aOrLine 
 * @param pointB 
 * @returns 
 */
export const midpoint = (aOrLine: Points.Point | Line, pointB?: Points.Point): Points.Point => {
  const [ a, b ] = getPointParameter(aOrLine, pointB);
  return interpolate(0.5, a, b);
};

/**
 * Returns [a,b] points from either a line parameter, or two points.
 * It additionally applies the guardPoint function to ensure validity.
 * This supports function overloading.
 * @ignore
 * @param aOrLine 
 * @param b 
 * @returns 
 */
export const getPointParameter = (aOrLine: Points.Point | Line, b?: Points.Point): readonly [ Points.Point, Points.Point ] => {

  let a;
  if (isLine(aOrLine)) {
    b = aOrLine.b;
    a = aOrLine.a;
  } else {
    a = aOrLine;
    if (b === undefined) throw new Error(`Since first parameter is not a line, two points are expected. Got a: ${ JSON.stringify(a) } b: ${ JSON.stringify(b) }`);
  }
  guardPoint(a, `a`);
  guardPoint(a, `b`);

  return [ a, b ];
};

/**
 * Returns the nearest point on `line` closest to `point`.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const pt = Lines.nearest(line, {x:10,y:10});
 * ```
 * 
 * If an array of lines is provided, it will be the closest point amongst all the lines
 * @param line Line or array of lines
 * @param point
 * @returns Point `{ x, y }`
 */
export const nearest = (line: Line | ReadonlyArray<Line>, point: Points.Point): Points.Point => {

  const n = (line: Line): Points.Point => {
    const { a, b } = line;
    const atob = { x: b.x - a.x, y: b.y - a.y };
    const atop = { x: point.x - a.x, y: point.y - a.y };
    const length = atob.x * atob.x + atob.y * atob.y;


    let dot = atop.x * atob.x + atop.y * atob.y;
    const t = Math.min(1, Math.max(0, dot / length));
    dot = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    return { x: a.x + atob.x * t, y: a.y + atob.y * t };
  };

  if (Array.isArray(line)) {
    const pts = line.map(l => n(l));
    const dists = pts.map(p => Points.distance(p, point));
    return Object.freeze<Points.Point>(pts[ Arrays.minIndex(...dists) ]);
  } else {
    return Object.freeze<Points.Point>(n(line as Line));
  }
};

/**
 * Calculates [slope](https://en.wikipedia.org/wiki/Slope) of line.
 * 
 * @example
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.slope(line);
 * Lines.slope(ptA, ptB)
 * ```
 * @param lineOrPoint Line or point. If point is provided, second point must be given too
 * @param b Second point if needed
 * @returns 
 */
export const slope = (lineOrPoint: Line | Points.Point, b?: Points.Point): number => {

  let a: Points.Point;
  if (isLine(lineOrPoint)) {

    a = lineOrPoint.a;
    b = lineOrPoint.b;
  } else {
    a = lineOrPoint;
    if (b === undefined) throw new Error(`b parameter required`);
  }
  if (b === undefined) {
    throw new TypeError(`Second point missing`)
  } else {
    return (b.y - a.y) / (b.x - a.x);
  }
};

const directionVector = (line: Line): Points.Point => ({
  x: line.b.x - line.a.x,
  y: line.b.y - line.a.y
});

const directionVectorNormalised = (line: Line): Points.Point => {
  const l = length(line);
  const v = directionVector(line);
  return {
    x: v.x / l,
    y: v.y / l
  };
};

/**
 * Returns a point perpendicular to `line` at a specified `distance`. Use negative
 * distances for the other side of line.
 * ```
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Project a point 100 units away from line, at its midpoint.
 * const pt = Lines.perpendicularPoint(line, 100, 0.5);
 * ```
 * @param line Line
 * @param distance Distance from line. Use negatives to flip side
 * @param amount Relative place on line to project point from. 0 projects from A, 0.5 from the middle, 1 from B.
 */
export const perpendicularPoint = (line: Line, distance: number, amount = 0) => {
  const origin = interpolate(amount, line);
  const dvn = directionVectorNormalised(line);
  return {
    x: origin.x - dvn.y * distance,
    y: origin.y + dvn.x * distance
  };
};

/**
 * Returns a parallel line to `line` at `distance`.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const l = Lines.parallel(line, 10);
 * ```
 * @param line
 * @param distance 
 */
export const parallel = (line: Line, distance: number): Line => {
  const dv = directionVector(line);
  const dvn = directionVectorNormalised(line);
  const a = {
    x: line.a.x - dvn.y * distance,
    y: line.a.y + dvn.x * distance
  };
  return {
    a,
    b: {
      x: a.x + dv.x,
      y: a.y + dv.y
    }
  };
};

/**
 * Scales a line from its midpoint
 * 
 * @example Shorten by 50%, anchored at the midpoint
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const l = {
 *  a: {x:50, y:50}, b: {x: 100, y: 90}
 * }
 * const l2 = Lines.scaleFromMidpoint(l, 0.5);
 * ```
 * @param line
 * @param factor 
 */
export const scaleFromMidpoint = (line: Line, factor: number): Line => {
  const a = interpolate(factor / 2, line);
  const b = interpolate(0.5 + factor / 2, line);
  return { a, b };
};

/**
 * Calculates `y` where `line` intersects `x`.
 * @param line Line to extend
 * @param x Intersection of x-axis.
 */
export const pointAtX = (line: Line, x: number): Points.Point => {
  const y = line.a.y + (x - line.a.x) * slope(line);
  return Object.freeze({ x: x, y });
};

/**
 * Returns a line extended from its `a` point by a specified distance
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const line = {a: {x: 0, y:0}, b: {x:10, y:10} }
 * const extended = Lines.extendFromA(line, 2);
 * ```
 * @param line
 * @param distance
 * @return Newly extended line
 */
export const extendFromA = (line: Line, distance: number): Line => {
  const calculatedLength = length(line);
  return Object.freeze({
    ...line,
    a: line.a,
    b: Object.freeze({
      x: line.b.x + (line.b.x - line.a.x) / calculatedLength * distance,
      y: line.b.y + (line.b.y - line.a.y) / calculatedLength * distance,
    })
  });
};

/**
 * Yields every integer point along `line`. 
 * 
 * @example Basic usage
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const l = { a: {x: 0, y: 0}, b: {x: 100, y: 100} };
 * for (const p of Lines.pointsOf(l)) {
 *  // Do something with point `p`...
 * }
 * ```
 * 
 * Some precision is lost as start and end
 * point is also returned as an integer.
 * 
 * Uses [Bresenham's line algorithm](https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm)
 * @param line Line
 */
//eslint-disable-next-line func-style
export function* pointsOf(line: Line): Generator<Points.Point> {
  // Via https://play.ertdfgcvb.xyz/#/src/demos/dyna
  const { a, b } = line;
  let x0 = Math.floor(a.x);
  let y0 = Math.floor(a.y);
  const x1 = Math.floor(b.x);
  const y1 = Math.floor(b.y);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  // eslint-disable-next-line unicorn/prevent-abbreviations
  let err = dx + dy;

  while (true) {
    yield { x: x0, y: y0 };
    if (x0 === x1 && y0 === y1) break;
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/**
 * Returns the distance of `point` to the 
 * nearest point on `line`.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const d = Lines.distance(line, {x:10,y:10});
 * ```
 * 
 * If an array of lines is provided, the shortest distance is returned.
 * @param line Line (or array of lines)
 * @param point Point to check against
 * @returns Distance
 */
export const distance = (line: Line | ReadonlyArray<Line>, point: Points.Point): number => {
  if (Array.isArray(line)) {
    const distances = line.map(l => distanceSingleLine(l, point));
    return minFast(distances);
  } else {
    return distanceSingleLine(line as Line, point);
  }
};

/**
 * Returns the distance of `point` to the nearest point on `line`
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const distance = Lines.distanceSingleLine(line, pt);
 * ```
 * @param line Line
 * @param point Target point
 * @returns 
 */
const distanceSingleLine = (line: Line, point: Points.Point): number => {
  guard(line, `line`);
  guardPoint(point, `point`);

  if (length(line) === 0) {
    // Line is really a point
    return length(line.a, point);
  }

  const near = nearest(line, point);
  return length(near, point);
};

/**
 * Calculates a point in-between `a` and `b`.
 * 
 * If an interpolation amount below 0 or above 1 is given, _and_
 * `allowOverflow_ is true, a point will be returned that is extended
 * past `line`. This is useful for easing functions which might
 * briefly go past the limits.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Get {x,y} at 50% along line
 * Lines.interpolate(0.5, line);
 * 
 * // Get {x,y} at 80% between point A and B
 * Lines.interpolate(0.8, ptA, ptB);
 * ```
 * @param amount Relative position, 0 being at a, 0.5 being halfway, 1 being at b
 * @param a Start
 * @param pointB End
 * @returns Point between a and b
 */
export function interpolate(amount: number, a: Points.Point, pointB: Points.Point, allowOverflow?: boolean): Points.Point;

/**
 * Calculates a point in-between `line`'s start and end points.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Get {x, y } at 50% along line
 * Lines.interpolate(0.5, line);
 * ```
 * 
 * Any additional properties from `b`  are returned on the result as well.
 * @param amount 0..1 
 * @param line Line
 * @param allowOverflow If true, interpolation amount is permitted to exceed 0..1, extending the line
 */
export function interpolate(amount: number, line: Line, allowOverflow?: boolean): Points.Point;

/**
 * Calculates a point in-between a line's start and end points.
 * 
 * @param amount Interpolation amount
 * @param aOrLine Line, or first point
 * @param pointBOrAllowOverflow Second point (if needed) or allowOverflow.
 * @param allowOverflow If true, interpolation amount is permitted to exceed 0..1, extending the line.
 * @returns 
 */
//eslint-disable-next-line func-style
export function interpolate(amount: number, aOrLine: Points.Point | Line, pointBOrAllowOverflow?: Points.Point | boolean, allowOverflow?: boolean): Points.Point {

  if (typeof pointBOrAllowOverflow === `boolean`) {
    allowOverflow = pointBOrAllowOverflow;
    pointBOrAllowOverflow = undefined;
  }

  // eslint-disable-next-line unicorn/no-negated-condition
  if (!allowOverflow) throwPercentTest(amount, `amount`);
  else throwNumberTest(amount, ``, `amount`);

  const [ a, b ] = getPointParameter(aOrLine, pointBOrAllowOverflow);

  const d = length(a, b);
  const d2 = d * (1 - amount);

  // Points are identical, return a copy of b
  if (d === 0 && d2 === 0) return Object.freeze({ ...b });

  const x = b.x - (d2 * (b.x - a.x) / d);
  const y = b.y - (d2 * (b.y - a.y) / d);

  return Object.freeze({
    ...b,
    x: x,
    y: y
  });
}

/**
 * Returns a string representation of two points
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * console.log(Lines.toString(a, b)));
 * ```
 * @param a 
 * @param b 
 * @returns 
 */
export function toString(a: Points.Point, b: Points.Point): string;

/**
 * Returns a string representation of a line 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.toString(line);
 * ```
 * @param line 
 */
export function toString(line: Line): string;

/**
 * Returns a string representation of a line or two points.
 * @param a
 * @param b 
 * @returns 
 */
//eslint-disable-next-line func-style
export function toString(a: Points.Point | Line, b?: Points.Point): string {
  if (isLine(a)) {
    guard(a, `a`);
    b = a.b;
    a = a.a;
  } else if (b === undefined) throw new Error(`Expect second point if first is a point`);
  return Points.toString(a) + `-` + Points.toString(b);
}

/**
 * Returns a line from a basis of coordinates (x1, y1, x2, y2)
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line from 0,1 -> 10,15
 * Lines.fromNumbers(0, 1, 10, 15);
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

  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  return fromPoints(a, b);
};

/**
 * Returns an array representation of line: [a.x, a.y, b.x, b.y]
 * 
 * See {@link fromFlatArray} to create a line _from_ this representation.
 *
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.toFlatArray(line);
 * Lines.toFlatArray(pointA, pointB);
 * ```
 * @export
 * @param {Point} a
 * @param {Point} b
 * @returns {number[]}
 */
export const toFlatArray = (a: Points.Point | Line, b: Points.Point): ReadonlyArray<number> => {
  if (isLine(a)) {
    return [ a.a.x, a.a.y, a.b.x, a.b.y ];
  } else if (Points.isPoint(a) && Points.isPoint(b)) {
    return [ a.x, a.y, b.x, b.y ];
  } else {
    throw new Error(`Expected single line parameter, or a and b points`);
  }
};

/**
 * Yields all the points of all the lines.
 * 
 * ```js
 * const lines = [ ..some array of lines.. ];
 * for (const pt of Lines.asPoints(lines)) {
 *  // Yields a and then b of each point sequentially
 * }
 * ```
 * @param lines 
 */
//eslint-disable-next-line func-style
export function* asPoints(lines: Iterable<Line>) {
  for (const l of lines) {
    yield l.a;
    yield l.b;
  }
}

/**
 * Returns an SVG description of line
 * ```
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js';
 * Lines.toSvgString(ptA, ptB);
 * ```
 * @param a 
 * @param b 
 * @returns 
 */
export const toSvgString = (a: Points.Point, b: Points.Point): ReadonlyArray<string> => [ `M${ a.x } ${ a.y } L ${ b.x } ${ b.y }` ];

/**
 * Returns a line from four numbers [x1,y1,x2,y2].
 * 
 * See {@link toFlatArray} to create an array from a line.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const line = Lines.fromFlatArray(...[0, 0, 100, 100]);
 * // line is {a: { x:0, y:0 }, b: { x: 100, y: 100 } }
 * ```
 * @param array Array in the form [x1,y1,x2,y2]
 * @returns Line
 */
export const fromFlatArray = (array: ReadonlyArray<number>): Line => {
  if (!Array.isArray(array)) throw new Error(`arr parameter is not an array`);
  if (array.length !== 4) throw new Error(`array is expected to have length four`);
  return fromNumbers(array[ 0 ], array[ 1 ], array[ 2 ], array[ 3 ]);
};

/**
 * Returns a line from two points
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line from 0,1 to 10,15
 * const line = Lines.fromPoints( { x:0, y:1 }, { x:10, y:15 });
 * // line is: { a: { x: 0, y: 1}, b: { x: 10, y: 15 } };
 * ```
 * @param a Start point
 * @param b End point
 * @returns 
 */
export const fromPoints = (a: Points.Point, b: Points.Point): Line => {
  guardPoint(a, `a`);
  guardPoint(b, `b`);
  a = Object.freeze({ ...a });
  b = Object.freeze({ ...b });
  return Object.freeze({
    a: a,
    b: b
  });
};

/**
 * Returns an array of lines that connects provided points. Note that line is not closed.
 * 
 * Eg, if points a,b,c are provided, two lines are provided: a->b and b->c.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const lines = Lines.joinPointsToLines(ptA, ptB, ptC);
 * // lines is an array of, well, lines
 * ```
 * @param points 
 * @returns 
 */
export const joinPointsToLines = (...points: ReadonlyArray<Points.Point>): PolyLine => {
  const lines = [];

  let start = points[ 0 ];

  for (let index = 1; index < points.length; index++) {
    //eslint-disable-next-line functional/immutable-data
    lines.push(fromPoints(start, points[ index ]));
    start = points[ index ];
  }
  return lines;
};

/**
 * Returns a {@link LinePath} from two points
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const path = Lines.fromPointsToPath(ptA, ptB);
 * ```
 * @param a 
 * @param b 
 * @returns 
 */
export const fromPointsToPath = (a: Points.Point, b: Points.Point): LinePath => toPath(fromPoints(a, b));

/**
 * Returns a rectangle that encompasses dimension of line
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js';
 * const rect = Lines.bbox(line);
 * ```
 */
export const bbox = (line: Line): RectPositioned => Points.bbox(line.a, line.b);

/**
 * Returns the relative position of `pt` along `line`.
 * Warning: assumes `pt` is actually on `line`. Results may be bogus if not.
 * @param line 
 * @param pt 
 */
export const relativePosition = (line: Line, pt: Points.Point): number => {
  const fromStart = Points.distance(line.a, pt);
  const total = length(line);
  return fromStart / total;
}

/**
 * Returns a path wrapper around a line instance. This is useful if there are a series
 * of operations you want to do with the same line because you don't have to pass it
 * in as an argument to each function.
 * 
 * Note that the line is immutable, so a function like `sum` returns a new LinePath,
 * wrapping the result of `sum`.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Create a path
 * const l = Lines.toPath(fromNumbers(0,0,10,10));
 * 
 * // Now we can use it...
 * l.length();
 * 
 * // Mutate functions return a new path
 * const ll = l.sum({x:10,y:10});
 * ll.length();
 * ```
 * @param line 
 * @returns 
 */
export const toPath = (line: Line): LinePath => {
  const { a, b } = line;
  return Object.freeze({
    ...line,
    length: () => length(a, b),
    interpolate: (amount: number) => interpolate(amount, a, b),
    relativePosition: (point: Points.Point) => relativePosition(line, point),
    bbox: () => bbox(line),
    toString: () => toString(a, b),
    toFlatArray: () => toFlatArray(a, b),
    toSvgString: () => toSvgString(a, b),
    toPoints: () => [ a, b ],
    rotate: (amountRadian: number, origin: Points.Point) => toPath(rotate(line, amountRadian, origin)),
    nearest: (point: Points.Point) => nearest(line, point),
    sum: (point: Points.Point) => toPath(sum(line, point)),
    divide: (point: Points.Point) => toPath(divide(line, point)),
    multiply: (point: Points.Point) => toPath(multiply(line, point)),
    subtract: (point: Points.Point) => toPath(subtract(line, point)),
    midpoint: () => midpoint(a, b),
    distanceToPoint: (point: Points.Point) => distanceSingleLine(line, point),
    parallel: (distance: number) => parallel(line, distance),
    perpendicularPoint: (distance: number, amount?: number) => perpendicularPoint(line, distance, amount),
    slope: () => slope(line),
    withinRange: (point: Points.Point, maxRange: number) => withinRange(line, point, maxRange),
    isEqual: (otherLine: Line) => isEqual(line, otherLine),
    apply: (fn: (point: Points.Point) => Points.Point) => toPath(apply(line, fn)),
    kind: `line`
  });
};

export type LinePath = Line & Path & {
  toFlatArray(): ReadonlyArray<number>
  toPoints(): ReadonlyArray<Points.Point>
  rotate(amountRadian: number, origin: Points.Point): LinePath
  sum(point: Points.Point): LinePath
  divide(point: Points.Point): LinePath
  multiply(point: Points.Point): LinePath
  subtract(point: Points.Point): LinePath
  apply(fn: (point: Points.Point) => Points.Point): LinePath
  midpoint(): Points.Point
  parallel(distance: number): Line
  perpendicularPoint(distance: number, amount?: number): Points.Point
  slope(): number
  withinRange(point: Points.Point, maxRange: number): boolean
  isEqual(otherLine: Line): boolean
}

/**
 * Returns a line that is rotated by `angleRad`. By default it rotates
 * around its center, but an arbitrary `origin` point can be provided.
 * If `origin` is a number, it's presumed to be a 0..1 percentage of the line.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Rotates line by 0.1 radians around point 10,10
 * const r = Lines.rotate(line, 0.1, {x:10,y:10});
 * 
 * // Rotate line by 5 degrees around its center
 * const r = Lines.rotate(line, degreeToRadian(5));
 * 
 * // Rotate line by 5 degres around its end point
 * const r = Lines.rotate(line, degreeToRadian(5), line.b);
 * 
 * // Rotate by 90 degrees at the 80% position
 * const r = Lines.rotated = rotate(line, Math.PI / 2, 0.8);
 * ```
 * @param line Line to rotate
 * @param amountRadian Angle in radians to rotate by
 * @param origin Point to rotate around. If undefined, middle of line will be used
 * @returns 
 */
export const rotate = (line: Line, amountRadian?: number, origin?: Points.Point | number): Line => {
  if (amountRadian === undefined || amountRadian === 0) return line;
  if (origin === undefined) origin = 0.5;
  if (typeof origin === `number`) {
    origin = interpolate(origin, line.a, line.b);
  }
  return Object.freeze({
    ...line,
    a: Points.rotate(line.a, amountRadian, origin),
    b: Points.rotate(line.b, amountRadian, origin)
  });
};