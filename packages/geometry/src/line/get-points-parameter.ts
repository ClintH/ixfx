import type { Point } from "../point/point-type.js";
import { isLine } from "./guard.js";
import type { Line } from "./line-type.js";
import { guard as guardPoint } from '../point/guard.js';

/**
 * Returns [a,b] points from either a line parameter, or two points.
 * It additionally applies the guardPoint function to ensure validity.
 * This supports function overloading.
 * @ignore
 * @param aOrLine 
 * @param b 
 * @returns 
 */
export const getPointParameter = (aOrLine: Point | Line, b?: Point): readonly [ Point, Point ] => {

  let a;
  if (isLine(aOrLine)) {
    b = aOrLine.b;
    a = aOrLine.a;
  } else {
    a = aOrLine;
    if (b === undefined) throw new Error(`Since first parameter is not a line, two points are expected. Got a: ${ JSON.stringify(a) } b: ${ JSON.stringify(b) }`);
  }
  guardPoint(a, `a`);
  guardPoint(a, `b`);

  return [ a, b ];
};