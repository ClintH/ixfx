import type { Point } from "./PointType.js";

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
      throw new Error(`Expected array of length two, got ${ xOrArray.length }`);
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

    for (let index = 0; index < coords.length; index += 2) {
      //eslint-disable-next-line  functional/immutable-data
      pts.push(
        Object.freeze({ x: coords[ index ] as number, y: coords[ index + 1 ] as number })
      );
    }
  }
  return pts;
};
