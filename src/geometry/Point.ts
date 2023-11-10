import { Circles, Lines, Points, Polar, Rects } from './index.js';
import { interpolate as lineInterpolate } from './Line.js';
import { throwNumberTest } from '../Guards.js';
import { clamp as clampNumber, wrap as wrapNumber } from '../data/index.js';
import { Arrays } from '../collections/index.js';
import { type RandomSource, defaultRandom } from '../Random.js';
import { quantiseEvery as quantiseEveryNumber, round as roundNumber } from '../Numbers.js';
/**
 * A point, consisting of x, y and maybe z fields.
 */
export type Point = {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
};

export type Point3d = Point & {
  readonly z: number;
};

/**
 * Returns a Point form of either a point, x,y params or x,y,z params.
 * If parameters are undefined, an empty point is returned (0, 0)
 * @ignore
 * @param a
 * @param b
 * @returns
 */
export function getPointParameter(
  //eslint-disable-next-line functional/prefer-readonly-type
  a?: Point | number | Array<number> | ReadonlyArray<number>,
  b?: number | boolean,
  c?: number
): Point | Point3d {
  if (a === undefined) return { x: 0, y: 0 };

  if (Array.isArray(a)) {
    if (a.length === 0) return Object.freeze({ x: 0, y: 0 });
    if (a.length === 1) return Object.freeze({ x: a[ 0 ], y: 0 });
    if (a.length === 2) return Object.freeze({ x: a[ 0 ], y: a[ 1 ] });
    if (a.length === 3) return Object.freeze({ x: a[ 0 ], y: a[ 1 ], z: a[ 2 ] });
    throw new Error(
      `Expected array to be 1-3 elements in length. Got ${ a.length }.`
    );
  }

  if (Points.isPoint(a)) {
    return a;
  } else if (typeof a !== `number` || typeof b !== `number`) {
    throw new TypeError(
      `Expected point or x,y as parameters. Got: a: ${ JSON.stringify(
        a
      ) } b: ${ JSON.stringify(b) }`
    );
  }

  // x,y,z
  if (typeof c === `number`) {
    return Object.freeze({ x: a, y: b, z: c });
  }
  // x,y
  return Object.freeze({ x: a, y: b });
}

export const dotProduct = (...pts: ReadonlyArray<Point>): number => {
  const a = pts.map(p => Points.toArray(p));
  return Arrays.dotProduct(a);
};

/**
 * An empty point of `{ x:0, y:0 }`.
 *
 * Use `isEmpty` to check if a point is empty.
 */
export const Empty = { x: 0, y: 0 } as const;

/**
 * Placeholder point, where x and y is `NaN`.
 * Use `isPlaceholder` to check if a point is a placeholder.
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Placeholder = Object.freeze({ x: Number.NaN, y: Number.NaN });

/**
 * Returns true if both x and y is 0.
 * Use `Points.Empty` to return an empty point.
 * @param p
 * @returns
 */
export const isEmpty = (p: Point) => p.x === 0 && p.y === 0;

/**
 * Returns true if point is a placeholder, where both x and y
 * are `NaN`.
 *
 * Use Points.Placeholder to return a placeholder point.
 * @param p
 * @returns
 */
export const isPlaceholder = (p: Point) =>
  Number.isNaN(p.x) && Number.isNaN(p.y);

/**
 * Returns true if p.x and p.y === null
 * @param p
 * @returns
 */
export const isNull = (p: Point) => p.x === null && p.y === null;

/***
 * Returns true if p.x or p.y isNaN
 */
export const isNaN = (p: Point) => Number.isNaN(p.x) || Number.isNaN(p.y);
/**
 * Returns the 'minimum' point from an array of points, using a comparison function.
 *
 * @example Find point closest to a coordinate
 * ```js
 * const points = [...];
 * const center = {x: 100, y: 100};
 *
 * const closestToCenter = findMinimum((a, b) => {
 *  const aDist = distance(a, center);
 *  const bDist = distance(b, center);
 *  if (aDistance < bDistance) return a;
 *  return b;
 * }, points);
 * ```
 * @param comparer Compare function returns the smallest of `a` or `b`
 * @param points
 * @returns
 */
export const findMinimum = (
  comparer: (a: Point, b: Point) => Point,
  ...points: ReadonlyArray<Point>
): Point => {
  if (points.length === 0) throw new Error(`No points provided`);
  //eslint-disable-next-line functional/no-let
  let min = points[ 0 ];
  for (const p of points) {
    min = comparer(min, p);
  }
  return min;
};

/**
 * Returns the left-most of the provided points.
 *
 * Same as:
 * ```js
 * findMinimum((a, b) => {
 *  if (a.x <= b.x) return a;
 *  return b;
 *}, ...points)
 * ```
 *
 * @param points
 * @returns
 */
export const leftmost = (...points: ReadonlyArray<Point>): Point =>
  findMinimum((a, b) => (a.x <= b.x ? a : b), ...points);

/**
 * Returns the right-most of the provided points.
 *
 * Same as:
 * ```js
 * findMinimum((a, b) => {
 *  if (a.x >= b.x) return a;
 *  return b;
 *}, ...points)
 * ```
 *
 * @param points
 * @returns
 */
export const rightmost = (...points: ReadonlyArray<Point>): Point =>
  findMinimum((a, b) => (a.x >= b.x ? a : b), ...points);

export function distance(a: Point, b?: Point): number;
export function distance(a: Point, x: number, y: number): number;
//export function distance(a: Point): number;


/**
 * Calculate distance between two points.
 *
 * ```js`
 * // Distance between two points
 * const ptA = { x: 0.5, y:0.8 };
 * const ptB = { x: 1, y: 0.4 };
 * distance(ptA, ptB);
 * // Or, provide x,y as parameters
 * distance(ptA, 0.4, 0.9);
 *
 * // Distance from ptA to x: 0.5, y:0.8, z: 0.1
 * const ptC = { x: 0.5, y:0.5, z: 0.3 };
 * // With x,y,z as parameters:
 * distance(ptC, 0.5, 0.8, 0.1);
 * ``
 * @param a First point
 * @param xOrB Second point, or x coord
 * @param y y coord, if x coord is given
 * @param z Optional z coord, if x and y are given.
 * @returns
 */
//eslint-disable-next-line func-style
export function distance(
  a: Point | Point3d,
  xOrB?: Point | Point3d | number,
  y?: number,
  z?: number
): number {
  const pt = getPointParameter(xOrB, y, z);
  guard(pt, `b`);
  guard(a, `a`);
  return isPoint3d(pt) && isPoint3d(a) ? Math.hypot(pt.x - a.x, pt.y - a.y, pt.z - a.z) : Math.hypot(pt.x - a.x, pt.y - a.y);
}

/**
 * Returns the distance from point `a` to the exterior of `shape`.
 *
 * @example Distance from point to rectangle
 * ```
 * const distance = distanceToExterior(
 *  {x: 50, y: 50},
 *  {x: 100, y: 100, width: 20, height: 20}
 * );
 * ```
 *
 * @example Find closest shape to point
 * ```
 * import {minIndex} from '../collections/arrays.js';
 * const shapes = [ some shapes... ]; // Shapes to compare against
 * const pt = { x: 10, y: 10 };       // Comparison point
 * const distances = shapes.map(v => distanceToExterior(pt, v));
 * const closest = shapes[minIndex(...distances)];
 * ```
 * @param a Point
 * @param shape Point, or a positioned Rect or Circle.
 * @returns
 */
export const distanceToExterior = (
  a: Point,
  shape: PointCalculableShape
): number => {
  if (Rects.isRectPositioned(shape)) {
    return Rects.distanceFromExterior(shape, a);
  }
  if (Circles.isCirclePositioned(shape)) {
    return Circles.distanceFromExterior(shape, a);
  }
  if (isPoint(shape)) return distance(a, shape);
  throw new Error(`Unknown shape`);
};

/**
 * Returns the distance from point `a` to the center of `shape`.
 * @param a Point
 * @param shape Point, or a positioned Rect or Circle.
 * @returns
 */
export const distanceToCenter = (
  a: Point,
  shape: PointCalculableShape
): number => {
  if (Rects.isRectPositioned(shape)) {
    return Rects.distanceFromExterior(shape, a);
  }
  if (Circles.isCirclePositioned(shape)) {
    return Circles.distanceFromExterior(shape, a);
  }
  if (isPoint(shape)) return distance(a, shape);
  throw new Error(`Unknown shape`);
};

export type PointCalculableShape =
  | Lines.PolyLine
  | Lines.Line
  | Rects.RectPositioned
  | Point
  | Circles.CirclePositioned;

/**
 * Throws an error if point is invalid
 * @param p
 * @param name
 */
export function guard(p: Point, name = `Point`) {
  if (p === undefined) {
    throw new Error(
      `'${ name }' is undefined. Expected {x,y} got ${ JSON.stringify(p) }`
    );
  }
  if (p === null) {
    throw new Error(
      `'${ name }' is null. Expected {x,y} got ${ JSON.stringify(p) }`
    );
  }
  if (p.x === undefined) {
    throw new Error(
      `'${ name }.x' is undefined. Expected {x,y} got ${ JSON.stringify(p) }`
    );
  }
  if (p.y === undefined) {
    throw new Error(
      `'${ name }.y' is undefined. Expected {x,y} got ${ JSON.stringify(p) }`
    );
  }
  if (typeof p.x !== `number`) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new TypeError(`'${ name }.x' must be a number. Got ${ p.x }`);
  }
  if (typeof p.y !== `number`) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new TypeError(`'${ name }.y' must be a number. Got ${ p.y }`);
  }

  if (p.x === null) throw new Error(`'${ name }.x' is null`);
  if (p.y === null) throw new Error(`'${ name }.y' is null`);

  if (Number.isNaN(p.x)) throw new Error(`'${ name }.x' is NaN`);
  if (Number.isNaN(p.y)) throw new Error(`'${ name }.y' is NaN`);
}

/**
 * Throws if parameter is not a valid point, or either x or y is 0
 * @param pt
 * @returns
 */
export const guardNonZeroPoint = (pt: Point | Point3d, name = `pt`) => {
  guard(pt, name);
  throwNumberTest(pt.x, `nonZero`, `${ name }.x`);
  throwNumberTest(pt.y, `nonZero`, `${ name }.y`);
  if (typeof pt.z !== `undefined`) {
    throwNumberTest(pt.z, `nonZero`, `${ name }.z`);
  }

  return true;
};

/**
 * Returns a point with Math.abs applied to x and y.
 * ```js
 * Points.abs({ x:1,  y:1  }); // { x: 1, y: 1 }
 * Points.abs({ x:-1, y:1  }); // { x: 1, y: 1 }
 * Points.abs({ x:-1, y:-1 }); // { x: 1, y: 1 }
 * ```
 * @param pt
 * @returns
 */
export const abs = (pt: Point) => ({
  ...pt,
  x: Math.abs(pt.x),
  y: Math.abs(pt.y),
});

/**
 * Returns the angle in radians between `a` and `b`.
 *
 * Eg if `a` is the origin, and `b` is another point,
 * in degrees one would get 0 to -180 when `b` was above `a`.
 *  -180 would be `b` in line with `a`.
 * Same for under `a`.
 *
 * Providing a third point `c` gives the interior angle, where `b` is the middle point.
 * @param a
 * @param b
 * @param c
 * @returns
 */
export const angle = (a: Point, b?: Point, c?: Point) => {
  guard(a, `a`);

  if (b === undefined) {
    return Math.atan2(a.y, a.x);
  }
  guard(b, `b`);
  if (c === undefined) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  guard(c, `c`);
  return Math.atan2(b.y - a.y, b.x - a.x) - Math.atan2(c.y - a.y, c.x - a.x);
};

/**
 * Calculates the [centroid](https://en.wikipedia.org/wiki/Centroid#Of_a_finite_set_of_points) of a set of points
 * Undefined values are skipped over.
 *
 * ```js
 * // Find centroid of a list of points
 * const c1 = centroid(p1, p2, p3, ...);
 *
 * // Find centroid of an array of points
 * const c2 = centroid(...pointsArray);
 * ```
 * @param points
 * @returns A single point
 */
export const centroid = (...points: ReadonlyArray<Point | undefined>): Point => {
  if (!Array.isArray(points)) throw new Error(`Expected list of points`);
  // eslint-disable-next-line unicorn/no-array-reduce
  const sum = points.reduce<Point>(
    (previous, p) => {
      if (p === undefined) return previous; // Ignore undefined
      if (Array.isArray(p)) {
        throw new TypeError(
          `'points' list contains an array. Did you mean: centroid(...myPoints)?`
        );
      }
      if (!isPoint(p)) {
        throw new Error(
          `'points' contains something which is not a point: ${ JSON.stringify(
            p
          ) }`
        );
      }
      return {
        x: previous.x + p.x,
        y: previous.y + p.y,
      };
    },
    { x: 0, y: 0 }
  );

  return Object.freeze({
    x: sum.x / points.length,
    y: sum.y / points.length,
  });
};

/**
 * Returns the minimum rectangle that can enclose all provided points
 * @param points
 * @returns
 */
export const bbox = (...points: ReadonlyArray<Point>): Rects.RectPositioned => {
  const leftMost = findMinimum((a, b) => {
    return a.x < b.x ? a : b;
  }, ...points);
  const rightMost = findMinimum((a, b) => {
    return a.x > b.x ? a : b;
  }, ...points);
  const topMost = findMinimum((a, b) => {
    return a.y < b.y ? a : b;
  }, ...points);
  const bottomMost = findMinimum((a, b) => {
    return a.y > b.y ? a : b;
  }, ...points);

  const topLeft = { x: leftMost.x, y: topMost.y };
  const topRight = { x: rightMost.x, y: topMost.y };
  const bottomRight = { x: rightMost.x, y: bottomMost.y };
  const bottomLeft = { x: leftMost.x, y: bottomMost.y };
  return Rects.maxFromCorners(topLeft, topRight, bottomRight, bottomLeft);
};

/**
 * Returns _true_ if the parameter has x and y fields
 * @param p
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export function isPoint(p: number | unknown): p is Point {
  if (p === undefined) return false;
  if (p === null) return false;
  if ((p as Point).x === undefined) return false;
  if ((p as Point).y === undefined) return false;
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const isPoint3d = (p: Point | unknown): p is Point3d => {
  if (p === undefined) return false;
  if (p === null) return false;
  if ((p as Point3d).x === undefined) return false;
  if ((p as Point3d).y === undefined) return false;
  if ((p as Point3d).z === undefined) return false;
  return true;
};

/**
 * Returns point as an array in the form [x,y]. This can be useful for some libraries
 * that expect points in array form.
 *
 * ```
 * const p = {x: 10, y:5};
 * const p2 = toArray(p); // yields [10,5]
 * ```
 * @param p
 * @returns
 */
export const toArray = (p: Point): ReadonlyArray<number> => [ p.x, p.y ];

/**
 * Returns a human-friendly string representation `(x, y)`.
 * If `precision` is supplied, this will be the number of significant digits.
 * @param p
 * @returns
 */
export function toString(p: Point, digits?: number): string {
  if (p === undefined) return `(undefined)`;
  if (p === null) return `(null)`;

  const x = digits ? p.x.toFixed(digits) : p.x;
  const y = digits ? p.y.toFixed(digits) : p.y;

  if (p.z === undefined) {
    return `(${ x },${ y })`;
  } else {
    const z = digits ? p.z.toFixed(digits) : p.z;
    return `(${ x },${ y },${ z })`;
  }
}

/**
 * Returns _true_ if the points have identical values
 *
 * ```js
 * const a = {x: 10, y: 10};
 * const b = {x: 10, y: 10;};
 * a === b        // False, because a and be are different objects
 * isEqual(a, b)   // True, because a and b are same value
 * ```
 * @param a
 * @param b
 * @returns _True_ if points are equal
 */
export const isEqual = (...p: ReadonlyArray<Point>): boolean => {
  if (p === undefined) throw new Error(`parameter 'p' is undefined`);
  if (p.length < 2) return true;

  //eslint-disable-next-line functional/no-let
  for (let index = 1; index < p.length; index++) {
    if (p[ index ].x !== p[ 0 ].x) return false;
    if (p[ index ].y !== p[ 0 ].y) return false;
  }
  return true;
};

/**
 * Returns true if two points are within a specified range on both axes.
 * 
 * Provide a point for the range to set different x/y range, or pass a number
 * to use the same range for both axis.
 *
 * Note this simply compares x,y values it does not calcuate distance.
 *
 * @example
 * ```js
 * withinRange({x:100,y:100}, {x:101, y:101}, 1); // True
 * withinRange({x:100,y:100}, {x:105, y:101}, {x:5, y:1}); // True
 * withinRange({x:100,y:100}, {x:105, y:105}, {x:5, y:1}); // False - y axis too far
 * ```
 * @param a
 * @param b
 * @param maxRange
 * @returns
 */
export const withinRange = (
  a: Point,
  b: Point,
  maxRange: Point | number
): boolean => {
  guard(a, `a`);
  guard(b, `b`);

  if (typeof maxRange === `number`) {
    throwNumberTest(maxRange, `positive`, `maxRange`);
    maxRange = { x: maxRange, y: maxRange };
  } else {
    guard(maxRange, `maxRange`);
  }
  const x = Math.abs(b.x - a.x);
  const y = Math.abs(b.y - a.y);
  return x <= maxRange.x && y <= maxRange.y;
};

/**
 * Returns a relative point between two points
 * ```js
 * interpolate(0.5, a, b); // Halfway point between a and b
 * ```
 *
 * Alias for Lines.interpolate(amount, a, b);
 *
 * @param amount Relative amount, 0-1
 * @param a
 * @param b
 * @param allowOverflow If true, length of line can be exceeded for `amount` of below 0 and above `1`.
 * @returns {@link Point}
 */
export const interpolate = (
  amount: number,
  a: Point,
  b: Point,
  allowOverflow = false
): Point => lineInterpolate(amount, a, b, allowOverflow); //({x: (1-amt) * a.x + amt * b.x, y:(1-amt) * a.y + amt * b.y });

/**
 * Returns a point from two coordinates or an array of [x,y]
 * @example
 * ```js
 * let p = from([10, 5]); // yields {x:10, y:5}
 * let p = from(10, 5);   // yields {x:10, y:5}
 * let p = from(10);      // yields {x:10, y:0} 0 is used for default y
 * let p = from();        // yields {x:0, y:0}  0 used for default x & y
 * ```
 * @param xOrArray
 * @param [y]
 * @returns Point
 */
export const from = (
  xOrArray?: number | ReadonlyArray<number>,
  y?: number
): Point => {
  if (Array.isArray(xOrArray)) {
    if (xOrArray.length !== 2) {
      throw new Error(`Expected array of length two, got ` + xOrArray.length);
    }
    return Object.freeze({
      x: xOrArray[ 0 ],
      y: xOrArray[ 1 ],
    });
  } else {
    if (xOrArray === undefined) xOrArray = 0;
    else if (Number.isNaN(xOrArray)) throw new Error(`x is NaN`);
    if (y === undefined) y = 0;
    else if (Number.isNaN(y)) throw new Error(`y is NaN`);
    return Object.freeze({ x: xOrArray as number, y: y });
  }
};

/**
 * Returns an array of points from an array of numbers.
 *
 * Array can be a continuous series of x, y values:
 * ```
 * [1,2,3,4] would yield: [{x:1, y:2}, {x:3, y:4}]
 * ```
 *
 * Or it can be an array of arrays:
 * ```
 * [[1,2], [3,4]] would yield: [{x:1, y:2}, {x:3, y:4}]
 * ```
 * @param coords
 * @returns
 */
export const fromNumbers = (
  ...coords: ReadonlyArray<ReadonlyArray<number>> | ReadonlyArray<number>
): ReadonlyArray<Point> => {
  const pts: Array<Point> = [];

  if (Array.isArray(coords[ 0 ])) {
    // [[x,y],[x,y]...]
    for (const coord of (coords as Array<Array<number>>)) {
      if (!(coord.length % 2 === 0)) {
        throw new Error(`coords array should be even-numbered`);
      }
      //eslint-disable-next-line  functional/immutable-data
      pts.push(Object.freeze({ x: coord[ 0 ], y: coord[ 1 ] }));
    }
  } else {
    // [x,y,x,y,x,y]
    if (coords.length % 2 !== 0) {
      throw new Error(`Expected even number of elements: [x,y,x,y...]`);
    }
    //eslint-disable-next-line functional/no-let
    for (let index = 0; index < coords.length; index += 2) {
      //eslint-disable-next-line  functional/immutable-data
      pts.push(
        Object.freeze({ x: coords[ index ] as number, y: coords[ index + 1 ] as number })
      );
    }
  }
  return pts;
};

/**
 * Returns `a` minus `b`
 *
 * ie.
 * ```js
 * return {
 *   x: a.x - b.x,
 *   y: a.y - b.y
 * };
 * ```
 * @param a Point a
 * @param b Point b
 * @returns Point
 */
export function subtract(a: Point, b: Point): Point;

/**
 * Returns `a` minus the given coordinates.
 *
 * ie:
 * ```js
 * return {
 *  x: a.x - x,
 *  y: a.y - y
 * }
 * ```
 * @param a Point
 * @param x X coordinate
 * @param y Y coordinate (if omitted, x is used as well)
 */
export function subtract(a: Point, x: number, y?: number): Point;

/**
 * Subtracts two sets of x,y pairs.
 *
 * If first parameter is a Point, any additional properties of it
 * are included in returned Point.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
export function subtract(x1: number, y1: number, x2: number, y2: number): Point;

//eslint-disable-next-line func-style
export function subtract(
  a: Point | number,
  b: Point | number,
  c?: number,
  d?: number
): Point {
  if (isPoint(a)) {
    guard(a, `a`);
    if (isPoint(b)) {
      guard(b, `b`);
      return Object.freeze({
        ...a,
        x: a.x - b.x,
        y: a.y - b.y,
      });
    } else {
      if (c === undefined) c = b;
      return Object.freeze({
        ...a,
        x: a.x - b,
        y: a.y - c,
      });
    }
  } else {
    throwNumberTest(a, ``, `a`);
    if (typeof b !== `number`) {
      throw new TypeError(`Second parameter is expected to by y value`);
    }
    throwNumberTest(b, ``, `b`);

    if (Number.isNaN(c)) throw new Error(`Third parameter is NaN`);
    if (Number.isNaN(d)) throw new Error(`Fourth parameter is NaN`);

    if (c === undefined) c = 0;
    if (d === undefined) d = 0;
    return Object.freeze({
      x: a - c,
      y: b - d,
    });
  }
}

/**
 * Applies `fn` on `x` and `y` fields, returning all other fields as well
 * ```js
 * const p = {x:1.234, y:4.9};
 * const p2 = Points.apply(p, Math.round);
 * // Yields: {x:1, y:5}
 * ```
 *
 * The name of the field is provided as well. Here we only round the `x` field:
 *
 * ```js
 * const p = {x:1.234, y:4.9};
 * const p2 = Points.apply(p, (v, field) => {
 *  if (field === `x`) return Math.round(v);
 *  return v;
 * });
 * ```
 * @param pt
 * @param fn
 * @returns
 */
export const apply = (
  pt: Point,
  fn: (v: number, field?: string) => number
): Point =>
  Object.freeze<Point>({
    ...pt,
    x: fn(pt.x, `x`),
    y: fn(pt.y, `y`),
  });

/**
 * Runs a sequential series of functions on `pt`. The output from one feeding into the next.
 * ```js
 * const p = Points.pipelineApply(somePoint, Points.normalise, Points.invert);
 * ```
 *
 * If you want to make a reusable pipeline of functions, consider {@link pipeline} instead.
 * @param pt
 * @param pipeline
 * @returns
 */
export const pipelineApply = (
  pt: Point,
  ...pipelineFns: ReadonlyArray<(pt: Point) => Point>
): Point => pipeline(...pipelineFns)(pt); // pipeline.reduce((prev, curr) => curr(prev), pt);

/**
 * Returns a pipeline function that takes a point to be transformed through a series of functions
 * ```js
 * // Create pipeline
 * const p = Points.pipeline(Points.normalise, Points.invert);
 *
 * // Now run it on `somePoint`.
 * // First we normalised, and then invert
 * const changedPoint = p(somePoint);
 * ```
 *
 * If you don't want to create a pipeline, use {@link pipelineApply}.
 * @param pipeline Pipeline of functions
 * @returns
 */
export const pipeline =
  (...pipeline: ReadonlyArray<(pt: Point) => Point>) =>
    (pt: Point) =>
      // eslint-disable-next-line unicorn/no-array-reduce
      pipeline.reduce((previous, current) => current(previous), pt);

/**
 * Reduces over points, treating _x_ and _y_ separately.
 *
 * ```
 * // Sum x and y values
 * const total = Points.reduce(points, (p, acc) => {
 *  return {x: p.x + acc.x, y: p.y + acc.y}
 * });
 * ```
 * @param pts Points to reduce
 * @param fn Reducer
 * @param initial Initial value, uses `{ x:0, y:0 }` by default
 * @returns
 */
export const reduce = (
  pts: ReadonlyArray<Point>,
  fn: (p: Point, accumulated: Point) => Point,
  initial?: Point
): Point => {
  if (initial === undefined) initial = { x: 0, y: 0 }
  //eslint-disable-next-line functional/no-let
  let accumulator = initial;
  for (const p of pts) {
    accumulator = fn(p, accumulator);
  };
  return accumulator;
};

type Sum = {
  /**
   * Adds two sets of coordinates. If y is omitted, the parameter for x is added to both x and y
   */
  (aX: number, aY: number, bX: number, bY: number): Point;
  /**
   * Add x,y to a
   */
  (a: Point, x: number, y?: number): Point;
  /**
   * Add two points
   */
  (a: Point, b?: Point): Point;
};

/**
 * Returns a Point of `a` plus `b`. ie:
 *
 * ```js
 * return {
 *   x: a.x + b.x,
 *   y: a.y + b.y
 * };
 * ```
 *
 * Usage:
 *
 * ```js
 * sum(ptA, ptB);
 * sum(x1, y1, x2, y2);
 * sum(ptA, x2, y2);
 * sum(ptA, xAndY);
 * ```
 */
export const sum: Sum = function (
  a: Point | number,
  b: Point | number | undefined,
  c?: number,
  d?: number
): Point {
  // ✔️ Unit tested
  if (a === undefined) throw new TypeError(`a missing`);

  //eslint-disable-next-line functional/no-let
  let ptA: Point | undefined;
  //eslint-disable-next-line functional/no-let
  let ptB: Point | undefined;
  if (isPoint(a)) {
    ptA = a;
    if (b === undefined) b = Empty;
    if (isPoint(b)) {
      ptB = b;
    } else {
      if (b === undefined) throw new Error(`Expects x coordinate`);
      ptB = { x: b, y: c ?? b };
    }
  } else if (!isPoint(b)) {
    // Neither of first two params are points
    if (b === undefined) throw new Error(`Expected number as second param`);
    ptA = { x: a, y: b };
    if (c === undefined) throw new Error(`Expects x coordiante`);
    ptB = { x: c, y: d ?? 0 };
  }

  if (ptA === undefined) throw new Error(`ptA missing. a: ${ JSON.stringify(a) }`);
  if (ptB === undefined) throw new Error(`ptB missing. b: ${ JSON.stringify(b) }`);
  guard(ptA, `a`);
  guard(ptB, `b`);
  return Object.freeze({
    x: ptA.x + ptB.x,
    y: ptA.y + ptB.y,
  });
};

/**
 * Multiply by a width,height or x,y
 * ```
 * return {
 *  x: a.x * rect.width,
 *  y: a.y * rect.height
 * };
 * ```
 * @param a
 * @param rect
 */
export function multiply(a: Point, rectOrPoint: Rects.Rect | Points.Point): Point;

/**
 * Returns `a` multipled by some x and/or y scaling factor
 *
 * ie.
 * ```js
 * return {
 *  x: a.x * x
 *   y: a.y * y
 * }
 * ```
 *
 * Usage:
 * ```js
 * multiply(pt, 10, 100); // Scale pt by x:10, y:100
 * multiply(pt, Math.min(window.innerWidth, window.innerHeight)); // Scale both x,y by viewport with or height, whichever is smaller
 * ```
 * @export
 * @parama Point to scale
 * @param x Scale factor for x axis
 * @param [y] Scale factor for y axis (if not specified, the x value is used)
 * @returns Scaled point
 */
export function multiply(a: Point, x: number, y?: number): Point;

/**
 * Returns `a` multiplied by `b` point, or given x and y.
 * ie.
 * ```js
 * return {
 *   x: a.x * b.x,
 *   y: a.y * b.y
 * };
 * ```
 * @param a
 * @param bOrX
 * @param y
 * @returns
 */
/* eslint-disable func-style */
export function multiply(
  a: Point,
  bOrX: Rects.Rect | Point | number,
  y?: number
): Point {
  // ✔️ Unit tested

  guard(a, `a`);
  if (typeof bOrX === `number`) {
    if (typeof y === `undefined`) y = bOrX;
    throwNumberTest(y, ``, `y`);
    throwNumberTest(bOrX, ``, `x`);
    return Object.freeze({ x: a.x * bOrX, y: a.y * y });
  } else if (isPoint(bOrX)) {
    guard(bOrX, `b`);
    return Object.freeze({
      x: a.x * bOrX.x,
      y: a.y * bOrX.y,
    });
  } else if (Rects.isRect(bOrX)) {
    Rects.guard(bOrX, `rect`);
    return Object.freeze({
      x: a.x * bOrX.width,
      y: a.y * bOrX.height,
    });
  } else {
    throw new Error(
      `Invalid arguments. a: ${ JSON.stringify(a) } b: ${ JSON.stringify(bOrX) }`
    );
  }
}

/**
 * Multiplies all components by `v`.
 * Existing properties of `pt` are maintained.
 *
 * ```js
 * multiplyScalar({ x:2, y:4 }, 2);
 * // Yields: { x:4, y:8 }
 * ```
 * @param pt Point
 * @param v Value to multiply by
 * @returns
 */
export const multiplyScalar = (
  pt: Point | Point3d,
  v: number
): Point | Point3d => {
  return isPoint3d(pt) ? Object.freeze({
    ...pt,
    x: pt.x * v,
    y: pt.y * v,
    z: pt.z * v,
  }) : Object.freeze({
    ...pt,
    x: pt.x * v,
    y: pt.y * v,
  });
};

/**
 * Divides point a by rectangle:
 * ```js
 * return {
 *  x: a.x / rect.width,
 *  y: a.y / rect.hight
 * };
 * ```
 * 
 * Or point:
 * ```js
 * return {
 *  x: a.x / b.x,
 *  y: a.y / b.y
 * }
 * ```
 * 
 * 
 * Dividing by zero will give Infinity for that dimension.
 * @param a
 * @param Rect
 */
export function divide(a: Point, rectOrPoint: Rects.Rect | Points.Point): Point;

/**
 * Divides a point by x,y.
 * ```js
 * return {
 *  x: a.x / x,
 *  y: b.y / y
 * };
 * ```
 * 
 * Dividing by zero will give Infinity for that dimension.
 * @param a Point
 * @param x X divisor
 * @param y Y divisor. If unspecified, x divisor is used.
 */
export function divide(a: Point, x: number, y?: number): Point;

/**
 * Divides two sets of points:
 * ```js
 * return {
 *  x: x1 / x2,
 *  y: y1 / y2
 * };
 * ```
 * 
 * Dividing by zero will give Infinity for that dimension.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
export function divide(x1: number, y1: number, x2?: number, y2?: number): Point;

/**
 * Divides a from b. If a contains a zero, that axis will be returned as zero
 * @param a
 * @param b
 * @param c
 * @param d
 * @returns
 */
export function divide(
  a: Point | number,
  b: Rects.Rect | Point | number,
  c?: number,
  d?: number
): Point {
  // ✔️ Unit tested

  if (isPoint(a)) {
    guard(a, `a`);
    if (isPoint(b)) {
      //guardNonZeroPoint(b);
      return Object.freeze({
        x: a.x / b.x,
        y: a.y / b.y,
      });
    } else if (Rects.isRect(b)) {
      Rects.guard(b, `rect`);
      return Object.freeze({
        x: a.x / b.width,
        y: a.y / b.height,
      });
    } else {
      if (c === undefined) c = b;
      guard(a);
      throwNumberTest(b, `nonZero`, `x`);
      throwNumberTest(c, `nonZero`, `y`);
      return Object.freeze({
        x: a.x / b,
        y: a.y / c,
      });
    }
  } else {
    if (typeof b !== `number`) {
      throw new TypeError(`expected second parameter to be y1 coord`);
    }
    throwNumberTest(a, `positive`, `x1`);
    throwNumberTest(b, `positive`, `y1`);
    if (c === undefined) c = 1;
    if (d === undefined) d = c;
    throwNumberTest(c, `nonZero`, `x2`);
    throwNumberTest(d, `nonZero`, `y2`);

    return Object.freeze({
      x: a / c,
      y: b / d,
    });
  }
}

/**
 * Returns a function that divides a point:
 * ```js
 * const f = divider(100, 200);
 * f(50,100); // Yields: { x: 0.5, y: 0.5 }
 * ```
 *
 * Input values can be Point, separate x,y and optional z values or an array:
 * ```js
 * const f = divider({ x: 100, y: 100 });
 * const f = divider( 100, 100 );
 * const f = divider([ 100, 100 ]);
 * ```
 *
 * Likewise the returned function an take these as inputs:
 * ```js
 * f({ x: 100, y: 100});
 * f( 100, 100 );
 * f([ 100, 100 ]);
 * ```
 *
 * Function throws if divisor has 0 for any coordinate (since we can't divide by 0)
 * @param a Divisor point, array of points or x
 * @param b Divisor y value
 * @param c Divisor z value
 * @returns
 */
//eslint-disable-next-line functional/prefer-readonly-type
export function divider(a: Point | number | Array<number>, b?: number, c?: number) {
  const divisor = getPointParameter(a, b, c);
  guardNonZeroPoint(divisor, `divisor`);

  return (
    aa: Point | number | Array<number>,
    bb?: number,
    cc?: number
  ): Point | Point3d => {
    const dividend = getPointParameter(aa, bb, cc);

    return typeof dividend.z === `undefined` ? Object.freeze({
      x: dividend.x / divisor.x,
      y: dividend.y / divisor.y,
    }) : Object.freeze({
      x: dividend.x / divisor.x,
      y: dividend.y / divisor.y,
      z: dividend.z / (divisor.z ?? 1),
    });
  };
}

export const quantiseEvery = (pt: Point, snap: Point, middleRoundsUp = true) =>
  Object.freeze({
    x: quantiseEveryNumber(pt.x, snap.x, middleRoundsUp),
    y: quantiseEveryNumber(pt.y, snap.y, middleRoundsUp),
  });
/**
 * Simple convex hull impementation. Returns a set of points which
 * enclose `pts`.
 *
 * For more power, see something like [Hull.js](https://github.com/AndriiHeonia/hull)
 * @param pts
 * @returns
 */
export const convexHull = (...pts: ReadonlyArray<Point>): ReadonlyArray<Point> => {
  const sorted = [ ...pts ].sort(compareByX);
  if (sorted.length === 1) return sorted;

  const x = (points: Array<Point>) => {
    const v: Array<Point> = [];
    for (const p of points) {
      while (v.length >= 2) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const q = v.at(-1)!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const r = v.at(-2)!;
        if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) {
          //eslint-disable-next-line functional/immutable-data
          v.pop();
        } else break;
      }
      //eslint-disable-next-line functional/immutable-data
      v.push(p);
    }
    //eslint-disable-next-line functional/immutable-data
    v.pop();
    return v;
  };

  const upper = x(sorted);
  //eslint-disable-next-line functional/immutable-data
  const lower = x(sorted.reverse());

  if (upper.length === 1 && lower.length === 1 && isEqual(lower[ 0 ], upper[ 0 ])) {
    return upper;
  }
  return [ ...upper, ...lower ];
};

/**
 * Returns -2 if both x & y of a is less than b
 * Returns -1 if either x/y of a is less than b
 *
 * Returns 2 if both x & y of a is greater than b
 * Returns 1 if either x/y of a is greater than b's x/y
 *
 * Returns 0 if x/y of a and b are equal
 * @param a
 * @param b
 * @returns
 */
export const compare = (a: Point, b: Point): number => {
  if (a.x < b.x && a.y < b.y) return -2;
  if (a.x > b.x && a.y > b.y) return 2;
  if (a.x < b.x || a.y < b.y) return -1;
  if (a.x > b.x || a.y > b.y) return 1;
  if (a.x === b.x && a.x === b.y) return 0;
  return Number.NaN;
};

/**
 * Compares points based on x value.
 * Returns above 0 if a.x > b.x (to the right)
 * Returns 0 if a.x === b.x
 * Returns below 0 if a.x < b.x (to the left)
 *
 * @example Sorting by x
 * ```js
 * arrayOfPoints.sort(Points.compareByX);
 * ```
 * @param a
 * @param b
 * @returns
 */
export const compareByX = (a: Point, b: Point): number =>
  a.x - b.x || a.y - b.y;

/**
 * Project `origin` by `distance` and `angle` (radians).
 *
 * To figure out rotation, imagine a horizontal line running through `origin`.
 * * Rotation = 0 deg puts the point on the right of origin, on same y-axis
 * * Rotation = 90 deg/3:00 puts the point below origin, on the same x-axis
 * * Rotation = 180 deg/6:00 puts the point on the left of origin on the same y-axis
 * * Rotation = 270 deg/12:00 puts the point above the origin, on the same x-axis
 *
 * ```js
 * // Yields a point 100 units away from 10,20 with 10 degrees rotation (ie slightly down)
 * const a = Points.project({x:10, y:20}, 100, degreeToRadian(10));
 * ```
 * @param origin
 * @param distance
 * @param angle
 * @returns
 */
export const project = (origin: Point, distance: number, angle: number) => {
  const x = Math.cos(angle) * distance + origin.x;
  const y = Math.sin(angle) * distance + origin.y;
  return { x, y };
};

/**
 * Rotate a single point by a given amount in radians
 * @param pt
 * @param amountRadian
 * @param origin
 */
export function rotate(pt: Point, amountRadian: number, origin?: Point): Point;

/**
 * Rotate several points by a given amount in radians
 * @param pt Points
 * @param amountRadian Amount to rotate in radians. If 0 is given, a copy of the input array is returned
 * @param origin Origin to rotate around. Defaults to 0,0
 */
export function rotate(
  pt: ReadonlyArray<Point>,
  amountRadian: number,
  origin?: Point
): ReadonlyArray<Point>;

export function rotate(
  pt: Point | ReadonlyArray<Point>,
  amountRadian: number,
  origin?: Point
): Point | ReadonlyArray<Point> {
  if (origin === undefined) origin = { x: 0, y: 0 };
  guard(origin, `origin`);
  throwNumberTest(amountRadian, ``, `amountRadian`);
  const arrayInput = Array.isArray(pt);

  // no-op
  if (amountRadian === 0) return pt;

  if (!arrayInput) {
    pt = [ pt as Point ];
  }

  const ptAr = pt as ReadonlyArray<Point>;
  for (const [ index, p ] of ptAr.entries()) guard(p, `pt[${ index }]`);

  //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const asPolar = ptAr.map((p) => Polar.fromCartesian(p, origin!));
  const rotated = asPolar.map((p) => Polar.rotate(p, amountRadian));
  const asCartesisan = rotated.map((p) => Polar.toCartesian(p, origin));
  return arrayInput ? asCartesisan : asCartesisan[ 0 ];

  //const p = Polar.fromCartesian(pt, origin);
  //const pp = Polar.rotate(p, amountRadian);
  //return Polar.toCartesian(pp, origin);
}

//eslint-disable-next-line functional/prefer-readonly-type
export const rotatePointArray = (
  v: ReadonlyArray<ReadonlyArray<number>>,
  amountRadian: number
): Array<Array<number>> => {
  const mat = [
    [ Math.cos(amountRadian), -Math.sin(amountRadian) ],
    [ Math.sin(amountRadian), Math.cos(amountRadian) ],
  ];
  const result = [];
  //eslint-disable-next-line functional/no-let
  for (const [ index, element ] of v.entries()) {
    //eslint-disable-next-line functional/immutable-data
    result[ index ] = [
      mat[ 0 ][ 0 ] * element[ 0 ] + mat[ 0 ][ 1 ] * element[ 1 ],
      mat[ 1 ][ 0 ] * element[ 0 ] + mat[ 1 ][ 1 ] * element[ 1 ],
    ];
  }
  return result;
};

const length = (ptOrX: Point | number, y?: number): number => {
  if (isPoint(ptOrX)) {
    y = ptOrX.y;
    ptOrX = ptOrX.x;
  }
  if (y === undefined) throw new Error(`Expected y`);
  return Math.hypot(ptOrX, y);
};

/**
 * Normalise point as a unit vector.
 *
 * ```js
 * normalise({x:10, y:20});
 * normalise(10, 20);
 * ```
 * @param ptOrX Point, or x value
 * @param y y value if first param is x
 * @returns
 */
export const normalise = (ptOrX: Point | number, y?: number): Point => {
  const pt = getPointParameter(ptOrX, y);
  const l = length(pt);
  if (l === 0) return Points.Empty;
  return Object.freeze({
    ...pt,
    x: pt.x / l,
    y: pt.y / l,
  });
};

/**
 * Round the point's _x_ and _y_ to given number of digits
 * @param ptOrX 
 * @param yOrDigits 
 * @param digits 
 * @returns 
 */
export const round = (ptOrX: Point | number, yOrDigits?: number, digits?: number): Point => {
  const pt = getPointParameter(ptOrX, yOrDigits);
  digits = digits ?? yOrDigits;
  digits = digits ?? 2;
  return Object.freeze({
    ...pt,
    x: roundNumber(digits, pt.x),
    y: roundNumber(digits, pt.y)
  })
}
/**
 * Normalises a point by a given width and height
 * @param pt Point
 * @param width Width
 * @param height Height
 */
export function normaliseByRect(
  pt: Point,
  width: number,
  height: number
): Point;

export function normaliseByRect(pt: Point, rect: Rects.Rect): Point;

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
  b: number | Rects.Rect,
  c?: number,
  d?: number
): Point {
  // ✔️ Unit tested
  if (isPoint(a)) {
    if (typeof b === `number` && c !== undefined) {
      throwNumberTest(b, `positive`, `width`);
      throwNumberTest(c, `positive`, `height`);
    } else {
      if (!Rects.isRect(b)) {
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
    throwNumberTest(a, `positive`, `x`);
    if (typeof b !== `number`) {
      throw new TypeError(`Expecting second parameter to be a number (width)`);
    }
    if (typeof c !== `number`) {
      throw new TypeError(`Expecting third parameter to be a number (height)`);
    }

    throwNumberTest(b, `positive`, `y`);
    throwNumberTest(c, `positive`, `width`);
    if (d === undefined) throw new Error(`Expected height parameter`);
    throwNumberTest(d, `positive`, `height`);
    return Object.freeze({
      x: a / c,
      y: b / d,
    });
  }
}

/**
 * Returns a random point on a 0..1 scale.
 * ```js
 * import { Points } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const pt = Points.random(); // eg {x: 0.2549012, y:0.859301}
 * ```
 *
 * A custom source of randomness can be provided:
 * ```js
 * import { Points } from "https://unpkg.com/ixfx/dist/geometry.js";
 * import { weightedSource } from "https://unpkg.com/ixfx/dist/random.js"
 * const pt = Points.random(weightedSource(`quadIn`));
 * ```
 * @param rando
 * @returns
 */
export const random = (rando?: RandomSource): Point => {
  if (rando === undefined) rando = defaultRandom;

  return Object.freeze({
    x: rando(),
    y: rando(),
  });
};

/**
 * Wraps a point to be within `ptMin` and `ptMax`.
 * Note that max values are _exclusive_, meaning the return value will always be one less.
 *
 * Eg, if a view port is 100x100 pixels, wrapping the point 150,100 yields 50,99.
 *
 * ```js
 * // Wraps 150,100 to on 0,0 -100,100 range
 * wrap({x:150,y:100}, {x:100,y:100});
 * ```
 *
 * Wrap normalised point:
 * ```js
 * wrap({x:1.2, y:1.5}); // Yields: {x:0.2, y:0.5}
 * ```
 * @param pt Point to wrap
 * @param ptMax Maximum value, or `{ x:1, y:1 }` by default
 * @param ptMin Minimum value, or `{ x:0, y:0 }` by default
 * @returns Wrapped point
 */
export const wrap = (
  pt: Point,
  ptMax?: Point,
  ptMin?: Point
): Point => {

  if (ptMax === undefined) ptMax = { x: 1, y: 1 };
  if (ptMin === undefined) ptMin = { x: 0, y: 0 };

  // ✔️ Unit tested
  guard(pt, `pt`);
  guard(ptMax, `ptMax`);
  guard(ptMin, `ptMin`);

  return Object.freeze({
    x: wrapNumber(pt.x, ptMin.x, ptMax.x),
    y: wrapNumber(pt.y, ptMin.y, ptMax.y),
  });
};

/**
 * Inverts one or more axis of a point
 * ```js
 * invert({x:10, y:10}); // Yields: {x:-10, y:-10}
 * invert({x:10, y:10}, `x`); // Yields: {x:-10, y:10}
 * ```
 * @param pt Point to invert
 * @param what Which axis. If unspecified, both axies are inverted
 * @returns
 */
export const invert = (
  pt: Point | Point3d,
  what: `both` | `x` | `y` | `z` = `both`
): Point => {
  switch (what) {
    case `both`: {
      return isPoint3d(pt) ? Object.freeze({
        ...pt,
        x: pt.x * -1,
        y: pt.y * -1,
        z: pt.z * -1,
      }) : Object.freeze({
        ...pt,
        x: pt.x * -1,
        y: pt.y * -1,
      });
    }
    case `x`: {
      return Object.freeze({
        ...pt,
        x: pt.x * -1,
      });
    }
    case `y`: {
      return Object.freeze({
        ...pt,
        y: pt.y * -1,
      });
    }
    case `z`: {
      if (isPoint3d(pt)) {
        return Object.freeze({
          ...pt,
          z: pt.z * -1,
        });
      } else throw new Error(`pt parameter is missing z`);
    }
    default: {
      throw new Error(`Unknown what parameter. Expecting 'both', 'x' or 'y'`);
    }
  }
};

/**
 * Returns a point with rounded x,y coordinates. By default uses `Math.round` to round.
 * ```js
 * toIntegerValues({x:1.234, y:5.567}); // Yields: {x:1, y:6}
 * ```
 *
 * ```js
 * toIntegerValues(pt, Math.ceil); // Use Math.ceil to round x,y of `pt`.
 * ```
 * @param pt Point to round
 * @param rounder Rounding function, or Math.round by default
 * @returns
 */
export const toIntegerValues = (
  pt: Point,
  rounder: (x: number) => number = Math.round
): Point => {
  guard(pt, `pt`);
  return Object.freeze({
    x: rounder(pt.x),
    y: rounder(pt.y),
  });
};

/**
 * Clamps the magnitude of a point.
 * This is useful when using a Point as a vector, to limit forces.
 * @param pt
 * @param max Maximum magnitude (1 by default)
 * @param min Minimum magnitude (0 by default)
 * @returns
 */
export const clampMagnitude = (pt: Point, max = 1, min = 0): Point => {
  const length = distance(pt);
  //eslint-disable-next-line functional/no-let
  let ratio = 1;
  if (length > max) {
    ratio = max / length;
  } else if (length < min) {
    ratio = min / length;
  }
  return ratio === 1 ? pt : multiply(pt, ratio, ratio);
};

/**
 * Clamps a point to be between `min` and `max` (0 & 1 by default)
 * @param pt Point
 * @param min Minimum value (0 by default)
 * @param max Maximum value (1 by default)
 */
export function clamp(pt: Point, min?: number, max?: number): Point;

/**
 * Clamps an x,y pair to be between `min` and `max` (0 & 1 by default)
 * @param x X coordinate
 * @param y Y coordinate
 * @param min Minimum value (0 by default)
 * @param max Maximum value (1 by default)
 */
export function clamp(x: number, y: number, min?: number, max?: number): Point;
export function clamp(
  a: Point | number,
  b?: number,
  c?: number,
  d?: number
): Point {
  // ✔️ Unit tested

  if (isPoint(a)) {
    if (b === undefined) b = 0;
    if (c === undefined) c = 1;
    throwNumberTest(b, ``, `min`);
    throwNumberTest(c, ``, `max`);
    return Object.freeze({
      x: clampNumber(a.x, b, c),
      y: clampNumber(a.y, b, c),
    });
  } else {
    if (b === undefined) throw new Error(`Expected y coordinate`);
    if (c === undefined) c = 0;
    if (d === undefined) d = 1;
    throwNumberTest(a, ``, `x`);
    throwNumberTest(b, ``, `y`);
    throwNumberTest(c, ``, `min`);
    throwNumberTest(d, ``, `max`);

    return Object.freeze({
      x: clampNumber(a, c, d),
      y: clampNumber(b, c, d),
    });
  }
}

export type PointRelation = (
  a: Point | number,
  b?: number
) => PointRelationResult;

export type PointRelationResult = {
  /**
   * Angle from start
   */
  readonly angle: number;
  /**
   * Distance from start
   */
  readonly distanceFromStart: number;
  /**
   * Distance from last compared point
   */
  readonly distanceFromLast: number;

  /**
   * Center point from start
   */
  readonly centroid: Point;
  /**
   * Average of all points seen
   * This is calculated by summing x,y and dividing by total points
   */
  readonly average: Point;

  /**
   * Speed. Distance/millisecond from one sample to the next.
   */
  readonly speed: number;
};

/**
 * Tracks the relation between two points.
 * 
 * 1. Call `Points.relation` with the initial reference point
 * 2. You get back a function
 * 3. Call the function with a new point to compute relational information.
 * 
 * It computes angle, average, centroid, distance and speed.
 * 
 * ```js
 * import { Points } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Reference point: 50,50
 * const t = Points.relation({x:50,y:50}); // t is a function
 *
 * // Invoke the returned function with a point
 * const relation = t({ x:0, y:0 }); // Juicy relational data
 * ```
 * 
 * Or with destructuring:
 * 
 * ```js
 * const { angle, distanceFromStart, distanceFromLast, average, centroid, speed } = t({ x:0,y:0 });
 * ```
 *
 * x & y coordinates can also be used as parameters:
 * ```js
 * const t = Points.relation(50, 50);
 * const result = t(0, 0);
 * // result.speed, result.angle ...
 * ```
 *
 * Note that intermediate values are not stored. It keeps the initial
 * and most-recent point. If you want to compute something over a set
 * of prior points, you may want to use [Data.pointsTracker](./Data.pointsTracker.html)
 * @param start
 * @returns
 */
export const relation = (a: Point | number, b?: number): PointRelation => {
  const start = getPointParameter(a, b);
  //eslint-disable-next-line functional/no-let
  let totalX = 0;
  //eslint-disable-next-line functional/no-let
  let totalY = 0;
  //eslint-disable-next-line functional/no-let
  let count = 0;
  //eslint-disable-next-line functional/no-let
  let lastUpdate = performance.now();
  //eslint-disable-next-line functional/no-let
  let lastPoint = start;
  const update = (aa: Point | number, bb?: number) => {
    const p = getPointParameter(aa, bb);
    totalX += p.x;
    totalY += p.y;
    count++;

    const distanceFromStart = distance(p, start);
    const distanceFromLast = distance(p, lastPoint);

    // Track speed
    const now = performance.now();
    const speed = distanceFromLast / (now - lastUpdate);
    lastUpdate = now;

    lastPoint = p;

    return Object.freeze({
      angle: angle(p, start),
      distanceFromStart,
      distanceFromLast,
      speed,
      centroid: centroid(p, start),
      average: {
        x: totalX / count,
        y: totalY / count,
      },
    });
  };

  return update;
};

export const progressBetween = (
  currentPos: Points.Point | Points.Point3d,
  from: Points.Point | Points.Point3d,
  to: Points.Point | Points.Point3d
) => {
  // Via: https://www.habrador.com/tutorials/math/2-passed-waypoint/?s=09
  // from -> current
  const a = Points.subtract(currentPos, from);

  // from -> to
  const b = Points.subtract(to, from);

  return Points.isPoint3d(a) && Points.isPoint3d(b) ? (
    (a.x * b.x + a.y * b.y + a.z * b.z) / (b.x * b.x + b.y * b.y + b.z * b.z)
  ) : (a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y);
};
// const p = { x: 100, y: 100 };
// console.log(`distance: ` + distance(p));
// const pp = clampMagnitude(p, 10);
// console.log(`c1: ${toString(pp)} distance: ${distance(pp)}`);

// const p = { x: 42, y: 1337};
// const pNorm = normalise(p);
// console.log(`normalised: ${toString(pNorm)}`);
