import * as Lines from '../line/index.js';
import * as Beziers from '../Bezier.js';
import type { Point, RectPositioned } from '../Types.js';

export type Path = {
  /**
   * Length of path
   */
  length(): number
  /**
   * Returns a point at a relative (0.0-1.0) position along the path
   *
   * Inverse of {@link relativePosition}.
   * @param {number} t Relative position (0.0-1.0)
   * @returns {Point} Point
   */
  interpolate(t: number): Point
  /**
   * Returns relative position of `point` along path.
   * If `pt` is same as start, result will be 0, if it's the same as end, it will be 1.
   * 
   * Inverse of {@link interpolate}.
   * @param point
   * @param intersectionThreshold
   */
  relativePosition(point: Point, intersectionThreshold: number): number
  /**
   * Gets smallest box that encloses path
   */
  bbox(): RectPositioned
  /**
   * Returns the nearest point on path to `point`
   * @param point 
   */
  nearest(point: Point): Point
  /**
   * Distance from start of path to this point.
   * If path is closed (eg. a circle) it may have some arbitary 'start' point
   * @param point 
   */
  distanceToPoint(point: Point): number,
  /**
   * Returns a string representation of pth values
   */
  toString(): string
  /**
   * Returns an array of SVG segments that can render path
   */
  toSvgString(): ReadonlyArray<string>
  /**
   * Well-known path kind
   */
  readonly kind: `compound` | `elliptical` | `circular` | `arc` | `bezier/cubic` | `bezier/quadratic` | `line`
}

export type WithBeziers = {
  getBeziers(): ReadonlyArray<Path>
};

export type CompoundPath = Path & {
  readonly segments: ReadonlyArray<Path>
  readonly kind: `compound`
};

export type Dimensions = {
  /**
   * Width of each path (based on bounding box)
   */
  readonly widths: ReadonlyArray<number>,
  /**
   * Length of each path
   */
  readonly lengths: ReadonlyArray<number>,

  /**
   * Total length of all paths
   */
  readonly totalLength: number,
  /**
   * Total width of all paths
   */
  readonly totalWidth: number
}

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

