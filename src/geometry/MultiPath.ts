import {Points} from "../index.js";
import * as Paths from "./Path.js";
import * as Rects from './Rect.js';

export type MultiPath = Paths.Path & {
  segments: Paths.Path[]
}
/**
 * Returns a new multipath, replacing a path at a given index
 *
 * @param {MultiPath} multiPath Existing multipath
 * @param {number} index Index to replace at
 * @param {Paths.Path} path Path to substitute in
 * @returns {MultiPath} New multipath
 */
export const setSegment = (multiPath: MultiPath, index: number, path: Paths.Path): MultiPath => {
  let existing = multiPath.segments;
  existing[index] = path;
  return fromPaths(...existing);
}

/**
 * Computes x,y point at a relative position along multipath
 *
 * @param {Paths.Path[]} paths Combined paths (assumes contiguous)
 * @param {number} t Position (given as a percentage from 0 to 1)
 * @param {boolean} [useWidth] If true, widths are used for calulcating. If false, lengths are used
 * @param {Dimensions} [dimensions] Precalculated dimensions of paths, will be computed if omitted
 * @returns
 */
export const compute = (paths: Paths.Path[], t: number, useWidth?: boolean, dimensions?: Dimensions) => {
  if (dimensions === undefined) {
    dimensions = computeDimensions(paths);
  }

  // Expected value to land on
  const expected = t * (useWidth ? dimensions.totalWidth : dimensions.totalLength);
  let soFar = 0;

  // Use widths or lengths?
  let l = useWidth ? dimensions.widths : dimensions.lengths;
  for (let i = 0; i < l.length; i++) {
    if (soFar + l[i] >= expected) {
      let relative = expected - soFar;
      let amt = relative / l[i];
      if (amt > 1) amt = 1;
      return paths[i].compute(amt);
    } else soFar += l[i];
  }
  return {x: 0, y: 0}
}

type Dimensions = {
  /**
   * Width of each path (based on bounding box)
   *
   * @type {number[]}
   */
  widths: number[],
  /**
   * Length of each path
   *
   * @type {number[]}
   */
  lengths: number[],

  /**
   * Total length of all paths
   *
   * @type {number}
   */
  totalLength: number,
  /**
   * Total width of all paths
   *
   * @type {number}
   */
  totalWidth: number
}
/**
 * Computes the widths and lengths of all paths, adding them up as well
 *
 * @param {Paths.Path[]} paths
 * @returns {Dimensions}
 */
export const computeDimensions = (paths: Paths.Path[]): Dimensions => {
  let widths = paths.map(l => l.bbox().width);
  let lengths = paths.map(l => l.length());
  let totalLength = 0;
  let totalWidth = 0;
  for (let i = 0; i < lengths.length; i++) totalLength += lengths[i];
  for (let i = 0; i < widths.length; i++) totalWidth += widths[i];

  return {totalLength, totalWidth, widths, lengths};
}
/**
 * Computes the bounding box that encloses entire multipath
 *
 * @param {Paths.Path[]} paths
 * @returns {Rects.Rect}
 */
const boundingBox = (paths: Paths.Path[]): Rects.Rect => {
  throw Error('Not yet implemented');
  return Rects.fromTopLeft({x: 0, y: 0}, 10, 10);
}
/**
 * Produce a human-friendly representation of paths
 *
 * @param {Paths.Path[]} paths
 * @returns {string}
 */
export const toString = (paths: Paths.Path[]): string => {
  return paths.map(p => p.toString()).join(', ');
}
/**
 * Throws an error if paths are not connected together, in order
 *
 * @param {Paths.Path[]} paths
 */
export const guardContinuous = (paths: Paths.Path[]) => {
  let lastPos = Paths.getEnd(paths[0]);
  for (let i = 1; i < paths.length; i++) {
    let start = Paths.getStart(paths[i]);
    if (!Points.equals(start, lastPos))
      throw Error('Path index ' + i + ' does not start at prior path end. Start: ' + start.x + ',' + start.y + ' expected: ' + lastPos.x + ',' + lastPos.y + '');
    lastPos = Paths.getEnd(paths[i]);
  }
}

export const toSvgString = (paths: Paths.Path[]): string => {
  let svg = paths.map(p => p.toSvgString());
  return svg.join(' ');
}

/**
 * Create a multipath from an array of paths.
 * All this does is verify they are connected, and precomputes dimensions
 *
 * @param {...Paths.Path[]} paths
 * @returns {MultiPath}
 */
export const fromPaths = (...paths: Paths.Path[]): MultiPath => {
  guardContinuous(paths) // Throws an error if paths are not connected
  const dims = computeDimensions(paths);

  return Object.freeze({
    segments: paths,
    length: () => dims.totalLength,
    compute: (t: number, useWidth: boolean = false) => compute(paths, t, useWidth, dims),
    bbox: () => boundingBox(paths),
    toString: () => toString(paths),
    toSvgString: () => toSvgString(paths)
  });
}
