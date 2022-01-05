
import {Point} from './Point.js';
import * as Rects from './Rect.js';
import * as Beziers from './Bezier.js';
import * as Lines from  './Line.js';

export type Path = {
  length(): number
  /**
   * Returns a point at a relative (0.0-1.0) position along the path
   *
   * @param {number} t Relative position (0.0-1.0)
   * @returns {Point} Point
   */
  compute(t: number): Point
  bbox(): Rects.RectPositioned
  toString(): string
  toSvgString(): string
  kind: `compound` | `circular` | `arc` | `bezier/cubic` | `bezier/quadratic` | `line`
}

export const getStart = function (path: Path): Point {
  if (Beziers.isQuadraticBezier(path)) return path.a;
  else if (Lines.isLine(path)) return path.a;
  else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};


export const getEnd = function (path: Path): Point {
  if (Beziers.isQuadraticBezier(path)) return path.b;
  else if (Lines.isLine(path)) return path.b;
  else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};
// export const getEnd = function (path: Path): Point {
//   const p = path as any;
//   if (p.a && p.b) return p.b as Point;
//   throw Error(`Cannot get end for path`);
// };

export type WithBeziers = {
  getBeziers(): Path[]
};