import * as Lines from './Line.js';
import * as Beziers from './Bezier.js';
import type { Point, Path } from './Types.js';

/**
 * Return the start point of a path
 *
 * @param path
 * @return Point
 */
export const getStart = function (path: Path): Point {
  if (Beziers.isQuadraticBezier(path)) return path.a;
  else if (Lines.isLine(path)) return path.a;
  else throw new Error(`Unknown path type ${ JSON.stringify(path) }`);
};

/**
 * Return the end point of a path
 *
 * @param path
 * @return Point
 */
export const getEnd = function (path: Path): Point {
  if (Beziers.isQuadraticBezier(path)) return path.b;
  else if (Lines.isLine(path)) return path.b;
  else throw new Error(`Unknown path type ${ JSON.stringify(path) }`);
};

export type WithBeziers = {
  getBeziers(): ReadonlyArray<Path>
};