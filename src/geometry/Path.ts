import {Lines, Beziers, Rects, Point} from './index.js';

//eslint-disable-next-line  functional/no-mixed-type
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
  readonly kind: `compound` | `circular` | `arc` | `bezier/cubic` | `bezier/quadratic` | `line`
}
/**
 * Return the start point of a path
 *
 * @param {Path} path
 * @return {*}  {Point}
 */
export const getStart = function (path: Path): Point {
  if (Beziers.isQuadraticBezier(path)) return path.a;
  else if (Lines.isLine(path)) return path.a;
  else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};

/**
 * Return the end point of a path
 *
 * @param {Path} path
 * @return {*}  {Point}
 */
export const getEnd = function (path: Path): Point {
  if (Beziers.isQuadraticBezier(path)) return path.b;
  else if (Lines.isLine(path)) return path.b;
  else throw new Error(`Unknown path type ${JSON.stringify(path)}`);
};

export type WithBeziers = {
  //eslint-disable-next-line  functional/no-method-signature
  getBeziers(): readonly Path[]
};