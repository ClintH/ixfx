import type { Point } from '../point/point-type.js';
import type { Line } from './line-type.js';
//import * as Points from '../point/index.js';
import { normaliseByRect as PointsNormaliseByRect } from '../point/normalise-by-rect.js';
import { minFast } from '@ixfx/numbers';
import { distanceSingleLine } from './distance-single-line.js';
import { isLine } from './guard.js';
import { length } from './length.js';
import { interpolate } from './interpolate.js';
import { isPoint, isEmpty as PointIsEmpty, isPlaceholder as PointIsPlaceholder } from '../point/guard.js';

export * from './angles.js';
export * from './bbox.js';
export * from './distance-single-line.js';
export * from './divide.js';
export * from './from-flat-array.js';
export * from './from-numbers.js';
export * from './from-points.js';
export * from './from-pivot.js';
export * from './from-points-to-path.js';
export * from './get-points-parameter.js';
export * from './guard.js';
export * from './interpolate.js';
export * from './is-equal.js';
export * from './join-points-to-lines.js';
export * from './length.js';
export type * from './line-path-type.js';
export type * from './line-type.js';
export * from './midpoint.js';
export * from './multiply.js';
export * from './nearest.js';
export * from './relative-position.js';
export * from './reverse.js';
export * from './rotate.js';
export * from './subtract.js';
export * from './sum.js';
export * from './to-path.js';
export * from './to-string.js';


export const Empty = Object.freeze({
  a: Object.freeze({ x: 0, y: 0 }),
  b: Object.freeze({ x: 0, y: 0 })
});


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
export const isEmpty = (l: Line): boolean => PointIsEmpty(l.a) && PointIsEmpty(l.b);

export const isPlaceholder = (l: Line): boolean => PointIsPlaceholder(l.a) && PointIsPlaceholder(l.b);




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
export const apply = (line: Line, fn: (p: Point) => Point) => Object.freeze<Line>(
  {
    ...line,
    a: fn(line.a),
    b: fn(line.b)
  }
);


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
export const angleRadian = (lineOrPoint: Line | Point, b?: Point): number => {
  let a: Point;
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
  a: PointsNormaliseByRect(line.a, width, height),
  b: PointsNormaliseByRect(line.b, width, height)
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
export const withinRange = (line: Line, point: Point, maxRange: number): boolean => {
  const calculatedDistance = distance(line, point);
  return calculatedDistance <= maxRange;
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
export const slope = (lineOrPoint: Line | Point, b?: Point): number => {

  let a: Point;
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
export const pointAtX = (line: Line, x: number): Point => {
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

export function* pointsOf(line: Line): Generator<Point> {
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
export const distance = (line: Line | readonly Line[], point: Point): number => {
  if (Array.isArray(line)) {
    const distances = line.map(l => distanceSingleLine(l, point));
    return minFast(distances);
  } else {
    return distanceSingleLine(line as Line, point);
  }
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
 * @param {Point} a
 * @param {Point} b
 * @returns {number[]}
 */
export const toFlatArray = (a: Point | Line, b: Point): readonly number[] => {
  if (isLine(a)) {
    return [ a.a.x, a.a.y, a.b.x, a.b.y ];
  } else if (isPoint(a) && isPoint(b)) {
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
export const toSvgString = (a: Point, b: Point): readonly string[] => [ `M${ a.x } ${ a.y } L ${ b.x } ${ b.y }` ];
