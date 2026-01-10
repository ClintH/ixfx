import type { Point, Point3d } from "./point-type.js";
import { errorResult, numberTest, resultThrow, type Result } from '@ixfx/guards';

/**
 * Returns true if xy (and z, if present) are _null_.
 * @param p
 * @returns
 */
export const isNull = (p: Point): boolean => {
  if (isPoint3d(p)) {
    if (p.z !== null) return false;
  }
  return p.x === null && p.y === null;
}

/***
 * Returns true if either x, y, z isNaN.
 */
export const isNaN = (p: Point): boolean => {
  if (isPoint3d(p)) {
    if (!Number.isNaN(p.z)) return false;
  }
  return Number.isNaN(p.x) || Number.isNaN(p.y)
}

export function test(p: Point, name = `Point`, extraInfo = ``): Result<Point, string> {
  if (p === undefined) {
    return errorResult(`'${ name }' is undefined. Expected {x,y} got ${ JSON.stringify(p) }`, extraInfo);
  }
  if (p === null) {
    return errorResult(
      `'${ name }' is null. Expected {x,y} got ${ JSON.stringify(p) }`, extraInfo
    );
  }
  if (typeof p !== `object`) return errorResult(
    `'${ name }' is type '${ typeof p }'. Expected object.`, extraInfo
  );
  if (p.x === undefined) {
    return errorResult(
      `'${ name }.x' is undefined. Expected {x,y} got ${ JSON.stringify(p) }`, extraInfo
    );
  }
  if (p.y === undefined) {
    return errorResult(
      `'${ name }.y' is undefined. Expected {x,y} got ${ JSON.stringify(p) }`, extraInfo
    );
  }
  if (typeof p.x !== `number`) {
    return errorResult(`'${ name }.x' must be a number. Got ${ typeof p.x }`, extraInfo);
  }
  if (typeof p.y !== `number`) {
    return errorResult(`'${ name }.y' must be a number. Got ${ typeof p.y }`, extraInfo);
  }
  if (p.z !== undefined) {
    if (typeof p.z !== `number`) return errorResult(`${ name }.z must be a number. Got: ${ typeof p.z }`, extraInfo)
    if (Number.isNaN(p.z)) return errorResult(`'${ name }.z' is NaN. Got: ${ JSON.stringify(p) }`, extraInfo);
  }

  if (p.x === null) return errorResult(`'${ name }.x' is null`, extraInfo);
  if (p.y === null) return errorResult(`'${ name }.y' is null`, extraInfo);

  if (Number.isNaN(p.x)) return errorResult(`'${ name }.x' is NaN`, extraInfo);
  if (Number.isNaN(p.y)) return errorResult(`'${ name }.y' is NaN`, extraInfo);

  return { success: true, value: p }
}

/**
 * Throws an error if point is invalid
 * @param p
 * @param name
 */
export function guard(p: Point, name = `Point`, info?: string): void {
  resultThrow(test(p, name, info))
  // if (p === undefined) {
  //   throw new Error(
  //     `'${ name }' is undefined. Expected {x,y} got ${ JSON.stringify(p) }`
  //   );
  // }
  // if (p === null) {
  //   throw new Error(
  //     `'${ name }' is null. Expected {x,y} got ${ JSON.stringify(p) }`
  //   );
  // }
  // if (p.x === undefined) {
  //   throw new Error(
  //     `'${ name }.x' is undefined. Expected {x,y} got ${ JSON.stringify(p) }`
  //   );
  // }
  // if (p.y === undefined) {
  //   throw new Error(
  //     `'${ name }.y' is undefined. Expected {x,y} got ${ JSON.stringify(p) }`
  //   );
  // }
  // if (typeof p.x !== `number`) {

  //   throw new TypeError(`'${ name }.x' must be a number. Got ${ typeof p.x }`);
  // }
  // if (typeof p.y !== `number`) {

  //   throw new TypeError(`'${ name }.y' must be a number. Got ${ typeof p.y }`);
  // }
  // if (p.z !== undefined) {
  //   if (typeof p.z !== `number`) throw new TypeError(`${ name }.z must be a number. Got: ${ typeof p.z }`)
  //   if (Number.isNaN(p.z)) throw new Error(`'${ name }.z' is NaN. Got: ${ JSON.stringify(p) }`);
  // }

  // if (p.x === null) throw new Error(`'${ name }.x' is null`);
  // if (p.y === null) throw new Error(`'${ name }.y' is null`);

  // if (Number.isNaN(p.x)) throw new Error(`'${ name }.x' is NaN`);
  // if (Number.isNaN(p.y)) throw new Error(`'${ name }.y' is NaN`);
}

/**
 * Throws if parameter is not a valid point, or either x or y is 0
 * @param pt
 * @returns
 */
export const guardNonZeroPoint = (pt: Point | Point3d, name = `pt`) => {
  guard(pt, name);
  resultThrow(
    numberTest(pt.x, `nonZero`, `${ name }.x`),
    numberTest(pt.y, `nonZero`, `${ name }.y`),
    () => {
      if (typeof pt.z !== `undefined`) {
        return numberTest(pt.z, `nonZero`, `${ name }.z`);
      }
    }
  );
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
 * Returns true if both xy (and z, if present) are 0.
 * Use `Points.Empty` to return an empty point.
 * @param p
 * @returns
 */
export const isEmpty = (p: Point): boolean => {
  if (isPoint3d(p)) {
    if (p.z !== 0) return false;
  }
  return p.x === 0 && p.y === 0

}

/**
 * Returns true if point is a placeholder, where xy (and z, if present)
 * are `NaN`.
 *
 * Use Points.Placeholder to return a placeholder point.
 * @param p
 * @returns
 */
export const isPlaceholder = (p: Point): boolean => {
  if (isPoint3d(p)) {
    if (!Number.isNaN(p.z)) return false;
  }
  return Number.isNaN(p.x) && Number.isNaN(p.y);
}
