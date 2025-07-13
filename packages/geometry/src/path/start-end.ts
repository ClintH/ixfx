import { isQuadraticBezier } from "../bezier/guard.js";
import { isLine } from "../line/guard.js";
import type { Point } from "../point/point-type.js";
import type { Path } from "./path-type.js";

/**
 * Return the start point of a path
 *
 * @param path
 * @return Point
 */
export const getStart = function (path: Path): Point {
  if (isQuadraticBezier(path)) return path.a;
  else if (isLine(path)) return path.a;
  else throw new Error(`Unknown path type ${ JSON.stringify(path) }`);
};

/**
 * Return the end point of a path
 *
 * @param path
 * @return Point
 */
export const getEnd = function (path: Path): Point {
  if (isQuadraticBezier(path)) return path.b;
  else if (isLine(path)) return path.b;
  else throw new Error(`Unknown path type ${ JSON.stringify(path) }`);
};