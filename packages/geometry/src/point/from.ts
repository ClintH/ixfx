import { guard } from "./guard.js";
import type { Point, Point3d } from "./point-type.js";

export function from(x: number, y: number, z: number): Point3d;
export function from(x: number, y: number): Point;
export function from(array: [ x: number, y: number, z: number ]): Point3d;
export function from(array: [ x: number, y: number ]): Point;

/**
 * Returns a point from two or three coordinates or an array of [x,y] or [x,y,z].
 * @example
 * ```js
 * let p = from([10, 5]);    // yields {x:10, y:5}
 * let p = from([10, 5, 2]); // yields: {x:10, y:5, z:2}
 * let p = from(10, 5);      // yields {x:10, y:5}
 * let p = from(10, 5, 2);   // yields: {x:10, y:5, z:2}
 * ```
 * @param xOrArray
 * @param [y]
 * @returns Point
 */
export function from(
  xOrArray?: number | readonly number[],
  y?: number,
  z?: number
): Point {
  if (Array.isArray(xOrArray)) {
    if (xOrArray.length === 3) {
      return Object.freeze({
        x: xOrArray[ 0 ],
        y: xOrArray[ 1 ],
        z: xOrArray[ 2 ]
      });
    } else if (xOrArray.length === 2) {
      return Object.freeze({
        x: xOrArray[ 0 ],
        y: xOrArray[ 1 ],
      });
    } else {
      throw new Error(`Expected array of length two or three, got ${ xOrArray.length }`);
    }
  } else {
    if (xOrArray === undefined) throw new Error(`Requires an array of [x,y] or x,y parameters at least`)
    else if (Number.isNaN(xOrArray)) throw new Error(`x is NaN`);
    if (y === undefined) throw new Error(`Param 'y' is missing`);
    else if (Number.isNaN(y)) throw new Error(`y is NaN`);
    if (z === undefined) {
      return Object.freeze({ x: xOrArray as number, y: y });
    } else {
      return Object.freeze({ x: xOrArray as number, y, z })
    }
  }
};

/**
 * Parses a point as a string, in the form 'x,y' or 'x,y,z'.
 * eg '10,15' will be returned as `{ x: 10, y: 15 }`.
 * 
 * Throws an error if `str` is not a string.
 * 
 * ```js
 * Points.fromString(`10,15`);  // { x:10, y:15 }
 * Points.fromString(`a,10`);   // { x:NaN, y:10 }
 * ```
 * 
 * Use {@link Points.isNaN} to check if returned point has NaN for either coordinate.
 * @param string_ 
 */
export const fromString = (string_: string): Point => {
  if (typeof string_ !== `string`) throw new TypeError(`Param 'str' ought to be a string. Got: ${ typeof string_ }`);
  const comma = string_.indexOf(`,`);
  const x = Number.parseFloat(string_.substring(0, comma));
  const nextComma = string_.indexOf(',', comma + 1);
  if (nextComma > 0) {
    // z component
    const y = Number.parseFloat(string_.substring(comma + 1, nextComma - comma + 2));
    const z = Number.parseFloat(string_.substring(nextComma + 1));
    return { x, y, z };
  } else {
    const y = Number.parseFloat(string_.substring(comma + 1));
    return { x, y };
  }
}


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
  ...coords: readonly (readonly number[])[] | readonly number[]
): readonly Point[] => {
  const pts: Point[] = [];

  if (Array.isArray(coords[ 0 ])) {
    // [[x,y],[x,y]...]
    for (const coord of (coords as number[][])) {
      if (!(coord.length % 2 === 0)) {
        throw new Error(`coords array should be even-numbered`);
      }
      pts.push(Object.freeze({ x: coord[ 0 ], y: coord[ 1 ] }));
    }
  } else {
    // [x,y,x,y,x,y]
    if (coords.length % 2 !== 0) {
      throw new Error(`Expected even number of elements: [x,y,x,y...]`);
    }

    for (let index = 0; index < coords.length; index += 2) {
      pts.push(
        Object.freeze({ x: coords[ index ] as number, y: coords[ index + 1 ] as number })
      );
    }
  }
  return pts;
};
