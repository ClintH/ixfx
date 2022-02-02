import {Rects} from "./index.js";

/**
 * A point, consisting of x, y and maybe z fields.
 */
export type Point = {
  readonly x: number
  readonly y: number
  readonly z?: number
};

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
 * @param compareFn Compare function returns the smallest of `a` or `b`
 * @param points 
 * @returns 
 */
export const findMinimum = (compareFn:(a:Point, b:Point)=>Point, ...points:readonly Point[]):Point => {
  if (points.length === 0) throw new Error(`No points provided`);
  //eslint-disable-next-line functional/no-let
  let min = points[0];
  points.forEach(p => {
    min = compareFn(min, p);
  });
  return min;
};

/**
 * Calculate distance between two points
 * @param a 
 * @param b 
 * @returns 
 */
export const distance = (a:Point, b:Point):number => {
  guard(a, `a`);
  guard(b, `b`);
  return Math.hypot(b.x-a.x, b.y-a.y);
};

/**
 * Throws an error if point parameter is invalid
 * @param p 
 * @param name 
 */
export const guard = (p: Point, name = `Point`) => {
  if (p === undefined) throw new Error(`'${name}' is undefined. Expected {x,y} got ${JSON.stringify(p)}`);
  if (p === null) throw new Error(`'${name}' is null. Expected {x,y} got ${JSON.stringify(p)}`);
  if (p.x === undefined) throw new Error(`'${name}.x' is undefined. Expected {x,y} got ${JSON.stringify(p)}`);
  if (p.y === undefined) throw new Error(`'${name}.y' is undefined. Expected {x,y} got ${JSON.stringify(p)}`);
  if (typeof p.x !== `number`) throw new Error(`'${name}.x' must be a number`);
  if (typeof p.y !== `number`) throw new Error(`'${name}.y' must be a number`);
 
  if (Number.isNaN(p.x)) throw new Error(`'${name}.x' is NaN`);
  if (Number.isNaN(p.y)) throw new Error(`'${name}.y' is NaN`);
};

/**
 * Returns the minimum rectangle that can enclose all provided points
 * @param points
 * @returns 
 */
export const bbox = (...points:readonly Point[]):Rects.RectPositioned => {
  const leftMost = findMinimum((a, b) => {
    if (a.x < b.x) return a;
    else return b;
  }, ...points);
  const rightMost = findMinimum((a, b) => {
    if (a.x > b.x) return a;
    else return b;
  }, ...points);
  const topMost = findMinimum((a, b) => {
    if (a.y < b.y) return a;
    else return b;
  }, ...points);
  const bottomMost = findMinimum((a, b) => {
    if (a.y > b.y) return a;
    else return b;
  }, ...points);

  const topLeft = {x:leftMost.x, y:topMost.y};
  const topRight = {x:rightMost.x, y:topMost.y};
  const bottomRight = {x:rightMost.x, y:bottomMost.y};
  const bottomLeft = {x:leftMost.x, y:bottomMost.y};
  return Rects.maxFromCorners(topLeft, topRight, bottomRight, bottomLeft);
};

/**
 * Returns true if the parameter has x and y
 * @param p 
 * @returns 
 */
export const isPoint = (p: Point|Rects.RectPositioned|Rects.Rect): p is Point => {
  if ((p as Point).x === undefined) return false;
  if ((p as Point).y === undefined) return false;
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
export const toArray = (p: Point): readonly number[] => ([p.x, p.y]);

/**
 * Returns a human-friendly string representation `(x, y)`
 * @param p
 * @returns 
 */
export const toString = (p: Point): string => {
  if (p.z !== undefined) {
    return `(${p.x},${p.y},${p.z})`;
  } else {
    return `(${p.x},${p.y})`;
  }
};

/**
 * Returns true if the two points have identical values
 *
 * @param a
 * @param b
 * @returns
 */
export const equals = (a: Point, b: Point): boolean =>  a.x === b.x && a.y === b.y;

/**
 * Returns true if two points are within a specified range.
 * Provide a point for the range to set different x/y range, or pass a number
 * to use the same range for both axis.
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
export const withinRange = (a:Point, b:Point, maxRange:Point|number):boolean =>  {
  if (typeof maxRange === `number`) {
    maxRange = {x:maxRange, y:maxRange};
  }
  const x = Math.abs(b.x - a.x);
  const y = Math.abs(b.y - a.y);
  return (x <= maxRange.x && y<= maxRange.y);
};

/**
 * Returns a relative point between two points
 * @param amt Relative amount, 0-1
 * @param a 
 * @param b 
 * @returns {@link Point}
 */
export const lerp =(a:Point, b:Point, amt:number):Point => ({x: (1-amt) * a.x + amt * b.x, y:(1-amt) * a.y + amt * b.y });

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
export const from = (xOrArray?: number | readonly number[], y?: number): Point => {
  if (Array.isArray(xOrArray)) {
    if (xOrArray.length !== 2) throw new Error(`Expected array of length two, got ` + xOrArray.length);
    return Object.freeze({
      x: xOrArray[0],
      y: xOrArray[1]
    });
  } else {
    if (xOrArray === undefined) xOrArray = 0;
    else if (Number.isNaN(xOrArray)) throw new Error(`x is NaN`);
    if (y === undefined) y = 0;
    else if (Number.isNaN(y)) throw new  Error(`y is NaN`);
    return Object.freeze({x: xOrArray as number, y: y});
  }
};

/**
 * Returns an array of points from an array of numbers. 
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
export const fromNumbers = (...coords:readonly ReadonlyArray<number>[]|readonly number[]): readonly Point[] => {
  const pts:Point[] = [];

  if (Array.isArray(coords[0])) {
    // [[x,y],[x,y]...]
    (coords as number[][]).forEach(coord => {
      if (!(coord.length % 2 === 0)) throw new Error(`coords array should be even-numbered`);
      //eslint-disable-next-line  functional/immutable-data
      pts.push(Object.freeze({x: coord[0], y: coord[1]}));    
    });
  } else {
    if (coords.length !== 2) throw new Error(`Expected two elements: [x,y]`);
    // [x,y]
    //eslint-disable-next-line  functional/immutable-data
    pts.push(Object.freeze({x: coords[0] as number, y: coords[1] as number}));
  }
  return pts;
};

/**
 * Returns `a` minus `b`
 *
 * @param a
 * @param b
 * @returns Point
 */
export const diff = function (a: Point, b: Point): Point {
  guard(a, `a`);
  guard(b, `b`);
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
};

/**
 * Returns `a` plus `b`
 *
 * @param a
 * @param b
 * @returns
 */
export const sum = function (a: Point, b: Point): Point {
  guard(a, `a`);
  guard(b, `b`);
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
};

/**
 * Returns `a` multiplied by `b`
 *
 * @param a
 * @param b
 * @returns
 */
export function multiply(a: Point, b: Point): Point;

/**
 * Returns `a` multipled by some x and/or y scaling factor
 *
 * @export
 * @parama Point to scale
 * @param x Scale factor for x axis
 * @param [y] Scale factor for y axis (defaults to no scaling)
 * @returns Scaled point
 */
export function multiply(a: Point, x: number, y?: number): Point;

/**
 * Returns `a` multiplied by `b` point, or given x and y.
 * @param a 
 * @param bOrX 
 * @param y 
 * @returns 
 */
/* eslint-disable func-style */
export function multiply(a: Point, bOrX: Point | number, y?: number) {
  guard(a, `a`);
  if (typeof bOrX === `number`) {
    if (typeof y === `undefined`) y = 1;
    return {x: a.x * bOrX, y: a.y * y};
  } else if (isPoint(bOrX)) {
    guard(bOrX, `b`);
    return {
      x: a.x * bOrX.x,
      y: a.y * bOrX.y
    };
  } else throw new Error(`Invalid arguments`);
}