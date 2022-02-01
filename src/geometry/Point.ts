import * as Rects from "./Rect.js";

export type Point = Readonly<{
  readonly x: number
  readonly y: number
  readonly z?: number
}>


export const compareTo = (compareFn:(a:Point, b:Point)=>Point, ...points:readonly Point[]):Point => {
  if (points.length === 0) throw new Error(`No points provided`);
  //eslint-disable-next-line functional/no-let
  let min = points[0];
  points.forEach(p => {
    min = compareFn(min, p);
  });
  return min;
};

export const distance = (a:Point, b:Point):number => {
  guard(a, `a`);
  guard(b, `b`);
  return Math.hypot(b.x-a.x, b.y-a.y);
};

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

export const bbox = (...points:readonly Point[]):Rects.RectPositioned => {
  const leftMost = compareTo((a, b) => {
    if (a.x < b.x) return a;
    else return b;
  }, ...points);
  const rightMost = compareTo((a, b) => {
    if (a.x > b.x) return a;
    else return b;
  }, ...points);
  const topMost = compareTo((a, b) => {
    if (a.y < b.y) return a;
    else return b;
  }, ...points);
  const bottomMost = compareTo((a, b) => {
    if (a.y > b.y) return a;
    else return b;
  }, ...points);


  const topLeft = {x:leftMost.x, y:topMost.y};
  const topRight = {x:rightMost.x, y:topMost.y};
  const bottomRight = {x:rightMost.x, y:bottomMost.y};
  const bottomLeft = {x:leftMost.x, y:bottomMost.y};
  return Rects.maxFromCorners(topLeft, topRight, bottomRight, bottomLeft);
};

export const isPoint = (p: Point|Rects.RectPositioned|Rects.Rect): p is Point => {
  if ((p as Point).x === undefined) return false;
  if ((p as Point).y === undefined) return false;
  return true;
};

/**
 * Returns point as an array in the form [x,y]
 * let a = toArray({x:10, y:5}); // yields [10,5]
 * @param {Point} p
 * @returns {number[]}
 */
export const toArray = (p: Point): readonly number[] => ([p.x, p.y]);

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
 * @param {Point} a
 * @param {Point} b
 * @returns {boolean}
 */
export const equals = (a: Point, b: Point): boolean =>  a.x === b.x && a.y === b.y;

/**
 * Returns true if two points are within a specified range.
 * Provide a point for the range to set different x/y range, or pass a number
 * to use the same range for both axis.
 *
 * Examples:
 * ```
 * withinRange({x:100,y:100}, {x:101, y:101}, 1); // True
 * withinRange({x:100,y:100}, {x:105, y:101}, {x:5, y:1}); // True 
 * withinRange({x:100,y:100}, {x:105, y:105}, {x:5, y:1}); // False - y axis too far 
 * ```
 * @param {Point} a
 * @param {Point} b
 * @param {(Point|number)} maxRange
 * @returns {boolean}
 */
export const withinRange = (a:Point, b:Point, maxRange:Point|number):boolean =>  {
  if (typeof maxRange === `number`) {
    maxRange = {x:maxRange, y:maxRange};
  }
  const x = Math.abs(b.x - a.x);
  const y = Math.abs(b.y - a.y);
  return (x <= maxRange.x && y<= maxRange.y);
};

export const lerp =(amt:number, a:Point, b:Point) => ({x: (1-amt) * a.x + amt * b.x, y:(1-amt) * a.y + amt * b.y });

/**
 * Returns a point from two coordinates or an array of [x,y]
* ```
* let p = fromArray([10, 5]); // yields {x:10, y:5}
* let p = from(10, 5);        // yields {x:10, y:5}
* let p = from(10);           // yields {x:10, y:0} 0 is used for default y
* let p = from();             // yields {x:0, y:0} 0 used for default x & y
* ```
 * @param {(number | number[])} xOrArray
 * @param {number} [y]
 * @returns {Point}
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
 * @param {Point} a
 * @param {Point} b
 * @returns {Point}
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
 * Returns `a` minus `b`
 *
 * @param {Point} a
 * @param {Point} b
 * @returns {Point}
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
 * @param {Point} a
 * @param {Point} b
 * @returns {Point}
 */
export function multiply(a: Point, b: Point): Point;

/**
 * Returns `a` multipled by some x and/or y scaling factor
 *
 * @export
 * @param {Point} a Point to scale
 * @param {number} x Scale factor for x axis
 * @param {number} [y] Scale factor for y axis (defaults to no scaling)
 * @returns {Point} Scaled point
 */
export function multiply(a: Point, x: number, y?: number): Point;

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

