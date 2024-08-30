import type { Point, Point3d } from "./PointType.js";
import { throwNumberTest } from '../../util/GuardNumbers.js';

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
    throw new TypeError(`'${ name }.x' must be a number. Got ${ typeof p.x }`);
  }
  if (typeof p.y !== `number`) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new TypeError(`'${ name }.y' must be a number. Got ${ typeof p.y }`);
  }
  if (p.z !== undefined) {
    if (typeof p.z !== `number`) throw new TypeError(`${ name }.z must be a number. Got: ${ typeof p.z }`)
    if (Number.isNaN(p.z)) throw new Error(`'${ name }.z' is NaN`);
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
 * Returns _true_ if `p` has x & y properties.
 * Returns _false_ if `p` is undefined, null or does not contain properties.
 * Use {@link isPoint3d} to check further check for `z`.
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

/**
 * Returns _true_ if `p` has x, y, & z properties.
 * Returns _false_ if `p` is undefined, null or does not contain properties.
 * @param p 
 * @returns 
 */
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
