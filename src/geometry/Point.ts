import { Circles, Lines, Points, Polar, Rects} from "./index.js";
import {interpolate as lineInterpolate} from './Line.js';
import { number as guardNumber} from '../Guards.js';
import {clamp as clampNumber, wrapInteger as wrapNumber} from '../Util.js';
import {Arrays} from "~/collections/index.js";

/**
 * A point, consisting of x, y and maybe z fields.
 */
export type Point = {
  readonly x: number
  readonly y: number
  readonly z?: number
};

/**
 * 
 * @ignore
 * @param a 
 * @param b 
 * @returns 
 */
export const getPointParam = (a?:Point|number, b?:number):Point => {
  if (a === undefined) return {x:0, y:0};

  if (Points.isPoint(a)) {
    return a;
  } else if (typeof a !== `number` || typeof b !== `number`) {
    throw new Error(`Expected point or x,y as parameters. Got: a: ${JSON.stringify(a)} b: ${JSON.stringify(b)}`);
  } else {
    return {x: a, y: b};
  }
};

export const dotProduct = (...pts:readonly Point[]):number => {
  const a = pts.map(p => Points.toArray(p));
  return Arrays.dotProduct(a);
};

/**
 * An empty point of {x:0, y:0}
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Empty = Object.freeze({ x:0, y: 0});
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Placeholder = Object.freeze({x:NaN, y:NaN});

export const isEmpty = (p:Point) => p.x === 0 && p.y === 0;

export const isPlaceholder = (p:Point) => Number.isNaN(p.x) && Number.isNaN(p.y);


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

export function distance(a:Point, b:Point):number;
export function distance(a:Point, x:number, y:number):number;
export function distance(a:Point):number;

/**
 * Calculate distance between two points
 * @param a 
 * @param b 
 * @returns 
 */
//eslint-disable-next-line func-style
export function distance(a:Point, xOrB?:Point|number, y?:number):number {
  const pt = getPointParam(xOrB, y);
  guard(a, `a`);
  guard(pt);
  
  return Math.hypot(pt.x-a.x, pt.y-a.y);
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
export const distanceToExterior = (a:Point, shape:PointCalculableShape):number => {
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
export const distanceToCenter = (a:Point, shape:PointCalculableShape):number => {
  if (Rects.isRectPositioned(shape)) {
    return Rects.distanceFromExterior(shape, a);
  }
  if (Circles.isCirclePositioned(shape)) {
    return Circles.distanceFromExterior(shape, a);
  }
  if (isPoint(shape)) return distance(a, shape);
  throw new Error(`Unknown shape`);
};

export type PointCalculableShape =  Lines.PolyLine | Lines.Line | Rects.RectPositioned | Point | Circles.CirclePositioned

/**
 * Throws an error if point is invalid
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
 * Throws if parameter is not a valid point, or either x or y is 0
 * @param pt
 * @returns 
 */
export const guardNonZeroPoint = (pt: Point, name = `pt`) => {
  guard(pt, name);
  guardNumber(pt.x, `nonZero`, `${name}.x`);
  guardNumber(pt.y, `nonZero`, `${name}.y`);
  return true;
};


/**
 * Returns the angle in radians between `a` and `b`.
 * Eg if `a` is the origin, and `b` is another point,
 * in degrees one would get 0 to -180 when `b` was above `a`.
 *  -180 would be `b` in line with `a`.
 * Same for under `a`.
 * @param a 
 * @param b 
 * @returns 
 */
export const angleBetween = (a: Point, b: Point) => Math.atan2(b.y - a.y, b.x - a.x);

/**
 * Calculates the centroid of a set of points
 * 
 * As per {@link https://en.wikipedia.org/wiki/Centroid#Of_a_finite_set_of_points}
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
export const centroid = (...points:readonly Point[]):Point => {
  if (!Array.isArray(points)) throw new Error(`Expected list of points`); 
  const sum = points.reduce((prev, p) => {
    if (Array.isArray(p)) throw new Error(`'points' list contains an array. Did you mean: centroid(...myPoints)?`);
    if (!isPoint(p)) throw new Error(`'points' contains something which is not a point: ${JSON.stringify(p)}`);
    return {
      x: prev.x + p.x,
      y: prev.y + p.y
    };
  }, {x:0, y:0});

  return {
    x: sum.x / points.length,
    y: sum.y / points.length
  };
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
 * Returns _true_ if the parameter has x and y fields
 * @param p 
 * @returns 
 */
export const isPoint = (p: number|unknown): p is Point => {
  if (p === undefined) return false;
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
export const isEqual = (...p:readonly Point[]):boolean => {
  if (p === undefined) throw new Error(`parameter 'p' is undefined`);
  if (p.length < 2) return true;

  //eslint-disable-next-line functional/no-loop-statement,functional/no-let
  for (let i=1;i<p.length;i++) {
    if (p[i].x !== p[0].x) return false;
    if (p[i].y !== p[0].y) return false;
  }
  return true;
};

//export const isEqual = (a: Point, b: Point): boolean =>  a.x === b.x && a.y === b.y;

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
 * ```js
 * interpolate(0.5, a, b); // Halfway point between a and b
 * ```
 * 
 * Alias for Lines.interpolate(amount, a, b);
 * 
 * @param amount Relative amount, 0-1
 * @param a 
 * @param b 
 * @returns {@link Point}
 */
export const interpolate =(amount:number, a:Point, b:Point):Point => lineInterpolate(amount, a, b); //({x: (1-amt) * a.x + amt * b.x, y:(1-amt) * a.y + amt * b.y });

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
    // [x,y,x,y,x,y]
    if (coords.length % 2 !== 0) throw new Error(`Expected even number of elements: [x,y,x,y...]`);
    //eslint-disable-next-line functional/no-loop-statement,functional/no-let
    for (let i=0;i<coords.length;i+=2) {
      //eslint-disable-next-line  functional/immutable-data
      pts.push(Object.freeze({x: coords[i] as number, y: coords[i+1] as number}));
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
 * @param y Y coordinate
 */
export function subtract (a:Point, x:number, y:number):Point;

/**
 * Subtracts two sets of x,y pairs
 * @param x1 
 * @param y1 
 * @param x2 
 * @param y2 
 */
export function subtract (x1:number, y1:number, x2:number, y2:number):Point;

//eslint-disable-next-line func-style
export function subtract(a:Point|number, b:Point|number, c?:number, d?:number):Point {
  if (isPoint(a)) {
    guard(a, `a`);
    if (isPoint(b)) {
      guard(b, `b`);
      return {
        x: a.x - b.x,
        y: a.y - b.y
      };
    } else {
      if (c === undefined) c = 0;
      return {
        x: a.x - b,
        y: a.y - c
      };
    }
  } else {
    guardNumber(a, ``, `a`);
    if (typeof b !== `number`) throw new Error(`Second parameter is expected to by y value`);
    guardNumber(b, ``, `b`);
    if (c === undefined) c = 0;
    if (d === undefined) d = 0;
    return {
      x: a - c,
      y: b - d
    };
  }
}

/**
 * Applies `fn` on `x` and `y` fields, returning all other fields as well
 * ```js
 * const p = {x:1.234, y:4.9};
 * const p2 = apply(p, Math.round);
 * // Yields: {x:1, y:5}
 * ```
 * 
 * The name of the field is provided as well. Here we only round the `x` field:
 * 
 * ```js
 * const p = {x:1.234, y:4.9};
 * const p2 = apply(p, (v, field) => {
 *  if (field === `x`) return Math.round(v);
 *  return v;
 * });
 * ```
 * @param pt 
 * @param fn 
 * @returns 
 */
export const apply = (pt:Point, fn:(v:number, field?:string)=>number):Point => (Object.freeze<Point>({
  ...pt,
  x: fn(pt.x, `x`),
  y: fn(pt.y, `y`)
}));

/**
 * Reduces over points, treating x,y separately.
 * 
 * ```
 * // Sum x and y valuse
 * const total = reduce(points, (p, acc) => {
 *  return {x: p.x + acc.x, y: p.y + acc.y}
 * });
 * ```
 * @param pts Points to reduce
 * @param fn Reducer
 * @param initial Initial value, uses {x:0,y:0} by default
 * @returns 
 */
export const reduce = (pts:readonly Point[], fn:(p:Point, accumulated:Point) => Point, initial:Point = {x:0, y:0}):Point => {
  //eslint-disable-next-line functional/no-let
  let acc = initial;
  pts.forEach(p => {
    acc = fn(p, acc);
  });
  return acc;
};

type Sum = {
  /**
   * Adds two sets of coordinates
   */
  (aX:number, aY:number, bX:number, bY:number):Point;
  /**
   * Add x,y to a
   */
  (a:Point, x:number, y?:number):Point;
  /**
   * Add two points
   */
  (a:Point, b?:Point):Point;
};

/**
 * Returns `a` plus `b`
 * ie.
 * ```js
 * return {
 *   x: a.x + b.x,
 *   y: a.y + b.y
 * };
 * ```
 */
export const sum:Sum = function (a: Point|number, b: Point|number|undefined, c?:number, d?:number): Point {
  // ✔️ Unit tested

  //eslint-disable-next-line functional/no-let
  let ptA:Point|undefined;
  //eslint-disable-next-line functional/no-let
  let ptB:Point|undefined;
  if (isPoint(a)) {
    ptA = a;
    if (b === undefined) b = Empty;
    if (isPoint(b)) {
      ptB = b;
    } else {
      if (b === undefined) throw new Error(`Expects x coordinate`);
      ptB = {x: b, y: (c === undefined ? 0 : c)};    
    }
  } else if (!isPoint(b)) {
    // Neither of first two params are points
    if (b === undefined) throw new Error(`Expected number as second param`);
    ptA = {x: a, y: b};
    if (c === undefined) throw new Error(`Expects x coordiante`);
    ptB = {x: c, y: (d === undefined ? 0 : d)};    
  }

  if (ptA === undefined) throw new Error(`ptA missing`);
  if (ptB === undefined) throw new Error(`ptB missing`);
  guard(ptA, `a`);
  guard(ptB, `b`);
  return {
    x: ptA.x + ptB.x,
    y: ptA.y + ptB.y
  };
};

/**
 * Returns `a` multiplied by `b`
 * 
 * ie.
 * ```js
 * return {
 *  x: a.x * b.x,
*   y: a.y * b.y
 * }
 * ```
 * @param a
 * @param b
 * @returns
 */
export function multiply(a: Point, b: Point): Point;

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
 * @export
 * @parama Point to scale
 * @param x Scale factor for x axis
 * @param [y] Scale factor for y axis (defaults to no scaling)
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
export function multiply(a: Point, bOrX: Point | number, y?: number):Point {
  // ✔️ Unit tested

  guard(a, `a`);
  if (typeof bOrX === `number`) {
    if (typeof y === `undefined`) y = 1;
    guardNumber(y, ``, `y`);
    guardNumber(bOrX, ``, `x`);

    return {x: a.x * bOrX, y: a.y * y};
  } else if (isPoint(bOrX)) {
    guard(bOrX, `b`);
    return {
      x: a.x * bOrX.x,
      y: a.y * bOrX.y
    };
  } else throw new Error(`Invalid arguments`);
}

/**
 * Divides a / b
 * @param a 
 * @param b 
 */
export function divide(a: Point, b:Point):Point;

/**
 * Divides a point by x,y.
 * ie: a.x / x, b.y / y
 * @param a Point
 * @param x X divisor
 * @param y Y divisor
 */
export function divide(a:Point, x:number, y:number):Point;
export function divide(x1:number, y1:number, x2?:number, y2?:number):Point;

export function divide(a: Point|number, b: Point | number, c?: number, d?:number):Point {
  // ✔️ Unit tested

  if (isPoint(a)) {
    if (isPoint(b)) {
      guard(a);
      guardNonZeroPoint(b);
      
      return {
        x: a.x / b.x,
        y: a.y / b.y
      };
    } else {
      if (c === undefined) c = 1;
      guard(a);
      guardNumber(b, `nonZero`, `x`);
      guardNumber(c, `nonZero`, `y`);
      return {
        x: a.x / b,
        y: a.y / c
      };
    }
  } else {
    if (typeof b !== `number`) throw new Error(`expected second parameter to be y1 coord`);
    guardNumber(a, `positive`, `x1`);
    guardNumber(b, `positive`, `y1`);
    if (c === undefined) c = 1;
    if (d === undefined) d = 1;
    guardNumber(c, `nonZero`, `x2`);
    guardNumber(d, `nonZero`, `y2`);

    return {
      x: a / c,
      y: b / d
    };
  }
}

/**
 * Simple convex hull impementation. Returns a set of points which
 * enclose `pts`.
 * 
 * For a more power, see something like [Hull.js](https://github.com/AndriiHeonia/hull)
 * @param pts 
 * @returns 
 */
export const convexHull = (...pts:readonly Point[]):readonly Point[] => {
  const sorted = [...pts].sort(compareByX);
  if (sorted.length === 1) return sorted;

  const x = (points:Point[]) => {
    const v:Point[] = [];
    points.forEach(p => {
      //eslint-disable-next-line functional/no-loop-statement
      while (v.length >= 2) {
        const q = v[v.length-1];
        const r = v[v.length-2];
        if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) {
          //eslint-disable-next-line functional/immutable-data
          v.pop();
        } else break;
      }
      //eslint-disable-next-line functional/immutable-data
      v.push(p);
    });
    //eslint-disable-next-line functional/immutable-data
    v.pop();
    return v;
  };

  const upper = x(sorted);
  //eslint-disable-next-line functional/immutable-data
  const lower = x(sorted.reverse());

  if (upper.length === 1 && lower.length === 1 && isEqual(lower[0], upper[0])) return upper;
  return upper.concat(lower);
};

/**
 * Returns -1 if either x/y of a is less than b's x/y
 * Returns 1 if either x/y of a is greater than b's x/y
 * Returns 0 if x/y of a and b are equal
 * @param a 
 * @param b 
 * @returns 
 */
export const compare = (a: Point, b:Point):number => {
  if (a.x < b.x || a.y < b.y) return -1;
  if (a.x > b.x || a.y > b.y) return 1;
  return 0;
};


export const compareByX = (a:Point, b:Point):number =>  a.x - b.x || a.y - b.y;


/**
 * Rotate a single point by a given amount in radians
 * @param pt 
 * @param amountRadian 
 * @param origin 
 */
export function rotate(pt:Point, amountRadian:number, origin?:Point):Point;

/**
 * Rotate several points by a given amount in radians
 * @param pt Points
 * @param amountRadian Amount to rotate in radians 
 * @param origin Origin to rotate around. Defaults to 0,0
 */
export function rotate(pt:ReadonlyArray<Point>, amountRadian:number, origin?:Point):ReadonlyArray<Point>;

export function rotate(pt:Point|ReadonlyArray<Point>, amountRadian:number, origin?:Point):Point|ReadonlyArray<Point> {
  if (origin === undefined) origin = {x:0, y:0};
  guard(origin, `origin`);
  guardNumber(amountRadian, ``, `amountRadian`);
  const arrayInput = Array.isArray(pt);

  if (!arrayInput) {
    pt = [pt as Point];
  }
  const ptAr = pt as ReadonlyArray<Point>;
  ptAr.forEach((p, index) => guard(p, `pt[${index}]`));
  
  //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const asPolar = ptAr.map(p => Polar.fromCartesian(p, origin!));
  const rotated = asPolar.map(p => Polar.rotate(p, amountRadian));
  const asCartesisan = rotated.map(p => Polar.toCartesian(p, origin));
  if (arrayInput) return asCartesisan;
  else return asCartesisan[0];

  //const p = Polar.fromCartesian(pt, origin);
  //const pp = Polar.rotate(p, amountRadian);
  //return Polar.toCartesian(pp, origin);
}

//eslint-disable-next-line functional/prefer-readonly-type
export const rotatePointArray = (v:ReadonlyArray<readonly number[]>, amountRadian:number): number[][] => {
  const mat = [[Math.cos(amountRadian), -Math.sin(amountRadian)], [Math.sin(amountRadian), Math.cos(amountRadian)]];
  const result = [];
  //eslint-disable-next-line functional/no-loop-statement,functional/no-let
  for (let i=0; i < v.length; ++i) {
    //eslint-disable-next-line functional/immutable-data
    result[i] = [mat[0][0]*v[i][0] + mat[0][1]*v[i][1], mat[1][0]*v[i][0] + mat[1][1]*v[i][1]];
  }
  return result;
};

const length = (ptOrX:Point|number, y?:number): number => {
  if (isPoint(ptOrX)) {
    y = ptOrX.y;
    ptOrX = ptOrX.x;
  }
  if (y === undefined) throw new Error(`Expected y`);
  return Math.sqrt(ptOrX*ptOrX + y*y);
};

/**
 * Normalise point as a unit vector
 * 
 * @param ptOrX 
 * @param y 
 * @returns 
 */
export const normalise = (ptOrX:Point|number, y?:number): Point => {
  if (isPoint(ptOrX)) {
    y = ptOrX.y;
    ptOrX = ptOrX.x;
  }
  if (y === undefined) throw new Error(`Expected y`);
  const l = length(ptOrX, y);
  return Object.freeze({
    x: ptOrX / l,
    y: y / l
  });
};

/**
 * Normalises a point by a given width and height
 * @param pt Point
 * @param width Width
 * @param height Height
 */
export function normaliseByRect(pt:Point, width:number, height:number):Point;

export function normaliseByRect(pt:Point, rect:Rects.Rect):Point;

/**
 * Normalises x,y by width and height so it is on a 0..1 scale
 * @param x 
 * @param y 
 * @param width 
 * @param height 
 */
export function normaliseByRect(x:number, y:number, width:number, height:number):Point;

/**
 * Normalises a point so it is on a 0..1 scale
 * @param a Point, or x
 * @param b y coord or width
 * @param c height or width
 * @param d height
 * @returns Point
 */
export function normaliseByRect(a:Point|number, b:number|Rects.Rect, c?:number, d?:number):Point {
  // ✔️ Unit tested
  if (isPoint(a)) {
    if (typeof b === `number` && c !== undefined) {
      guardNumber(b, `positive`, `width`);
      guardNumber(c, `positive`, `height`);
    } else {
      if (!Rects.isRect(b)) throw new Error(`Expected second parameter to be a rect`);
      c = b.height;
      b = b.width;
    }
    return {
      x: a.x / b,
      y: a.y / c
    };
  } else {
    guardNumber(a, `positive`, `x`);
    if (typeof b !== `number`) throw new Error(`Expecting second parameter to be a number (width)`);
    if (typeof c !== `number`) throw new Error(`Expecting third parameter to be a number (height)`);

    guardNumber(b, `positive`, `y`);
    guardNumber(c, `positive`, `width`);
    if (d === undefined) throw new Error(`Expected height parameter`);
    guardNumber(d, `positive`, `height`);
    return {
      x: a / c,
      y: b / d
    };
  }
}

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
 * If `ptMin` is not specified, {x:0,y:0} is used.
 * @param pt Point to wrap
 * @param ptMax Maximum value
 * @param ptMin Minimum value, or {x:0, y:0} by default
 * @returns Wrapped point
 */
export const wrap = (pt:Point, ptMax:Point, ptMin:Point = {x:0, y:0}):Point => {
  // ✔️ Unit tested
  guard(pt, `pt`);
  guard(ptMax, `ptMax`);
  guard(ptMin, `ptMin`);
  
  return {
    x: wrapNumber(pt.x, ptMin.x, ptMax.x),
    y: wrapNumber(pt.y, ptMin.y, ptMax.y)
  };
};

/**
 * Clamps a point to be between `min` and `max` (0 & 1 by default)
 * @param pt Point
 * @param min Minimum value (0 by default)
 * @param max Maximum value (1 by default)
 */
export function clamp(pt:Point, min?:number, max?:number):Point;

/**
 * Clamps an x,y pair to be between `min` and `max` (0 & 1 by default)
 * @param x X coordinate
 * @param y Y coordinate
 * @param min Minimum value (0 by default)
 * @param max Maximum value (1 by default)
 */
export function clamp(x:number, y:number, min?:number, max?:number):Point;
export function clamp(a:Point|number, b?:number, c?:number, d?:number):Point {
  // ✔️ Unit tested

  if (isPoint(a)) {
    if (b === undefined) b = 0;
    if (c === undefined) c = 1;
    guardNumber(b, ``, `min`);
    guardNumber(c, ``, `max`);
    return {
      x: clampNumber(a.x, b, c),
      y: clampNumber(a.y, b, c)
    };
  } else {
    if (b === undefined) throw new Error(`Expected y coordinate`);
    if (c === undefined) c = 0;
    if (d === undefined) d = 1;
    guardNumber(a, ``, `x`);
    guardNumber(b, ``, `y`);
    guardNumber(c, ``, `min`);
    guardNumber(d, ``, `max`);

    return {
      x: clampNumber(a, c, d),
      y: clampNumber(b, c, d)
    };
  }
}

/**
 * Tracks the relation between two points
 * 
 * ```js
 * // Start point: 50,50
 * const t = track({x:50,y:50});
 * 
 * // Compare to a 0,0
 * const {angle, distance, centroid} = t({x:0,y:0});
 * ```
 * 
 * X,y coordinates can also be used as parameters:
 * ```js
 * const t = track(50, 50);
 * const {angle, distance, centroid} = t(0, 0);
 * ```
 * @param start 
 * @returns 
 */
export const relation = (a:Point|number, b?:number) => {
  const start = getPointParam(a, b);
  const update = (aa:Point|number, bb?:number) => {
    const p = getPointParam(aa, bb);
    return {
      angle: angleBetween(p, start),
      distance: distance(p, start),
      centroid: centroid(p, start)
    };
  };

  return update;
};