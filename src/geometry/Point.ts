import {Rects} from "../index";

export type Point = {
  readonly x: number
  readonly y: number
  readonly z?: number
}


export const pointToString = (p: Point): string => {
  if (p.z !== undefined) {
    return `(${p.x},${p.y},${p.z})`;
  } else {
    return `(${p.x},${p.y})`;
  }
};

export const compareTo = (compareFn:(a:Point, b:Point)=>Point, ...points:Point[]):Point => {
  if (points.length === 0) throw new Error(`No points provided`);
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
  if (p === undefined) throw new Error(`Parameter '${name}' is undefined. Expected {x,y}`);
  if (p === null) throw new Error(`Parameter '${name}' is null. Expected {x,y}`);
  if (p.x === undefined) throw new Error(`Parameter '${name}.x' is undefined. Expected {x,y}`);
  if (p.y === undefined) throw new Error(`Parameter '${name}.y' is undefined. Expected {x,y}`);
  if (Number.isNaN(p.x)) throw new Error(`Parameter '${name}.x' is NaN`);
  if (Number.isNaN(p.y)) throw new Error(`Parameter '${name}.y' is NaN`);
};

//export const isPoint = (p: Point|any): p is Point => (p as Point).x !== undefined;

export const bbox = (...points:Point[]):Rects.Rect => {
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

export const isPoint = (p: Point): p is Point => {
  if (p.x === undefined) return false;
  if (p.y === undefined) return false;
  return true;
};

/**
 * Returns point as an array in the form [x,y]
 * let a = toArray({x:10, y:5}); // yields [10,5]
 * @param {Point} p
 * @returns {number[]}
 */
export const toArray = (p: Point): number[] => ([p.x, p.y]);

export const equals = (a: Point, b: Point): boolean =>  a.x === b.x && a.y === b.y;


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
export const from = (xOrArray?: number | number[], y?: number): Point => {
  if (Array.isArray(xOrArray)) {
    if (xOrArray.length !== 2) throw new Error(`Expected array of length two, got ` + xOrArray.length);
    return Object.freeze({
      x: xOrArray[0],
      y: xOrArray[1]
    });
  } else {
    if (xOrArray === undefined) xOrArray =0;
    else if (Number.isNaN(xOrArray)) throw new Error(`x is NaN`);
    if (y === undefined) y = 0;
    else if (Number.isNaN(y)) throw new  Error(`y is NaN`);
    return Object.freeze({x: xOrArray, y: y});
  }
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

