import { fromNumbers } from "./from-numbers.js";
import type { Line } from "./line-type.js";

/**
 * Returns a line from four numbers [x1,y1,x2,y2].
 * 
 * See {@link toFlatArray} to create an array from a line.
 * 
 * ```js
 * const line = Lines.fromFlatArray(...[0, 0, 100, 100]);
 * // line is {a: { x:0, y:0 }, b: { x: 100, y: 100 } }
 * ```
 * @param array Array in the form [x1,y1,x2,y2]
 * @returns Line
 */
export const fromFlatArray = (array: readonly number[]): Line => {
  if (!Array.isArray(array)) throw new Error(`arr parameter is not an array`);
  if (array.length !== 4) throw new Error(`array is expected to have length four`);
  return fromNumbers(array[ 0 ], array[ 1 ], array[ 2 ], array[ 3 ]);
};