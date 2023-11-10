import type { Point } from './points/Types.js';
import { Points, Paths, Rects } from './index.js';

export type CompoundPath = Paths.Path & {
  readonly segments: readonly Paths.Path[]
  readonly kind: `compound`
};

/**
 * Returns a new compoundpath, replacing a path at a given index
 *
 * @param {CompoundPath} compoundPath Existing compoundpath
 * @param {number} index Index to replace at
 * @param {Paths.Path} path Path to substitute in
 * @returns {CompoundPath} New compoundpath
 */
export const setSegment = (compoundPath: CompoundPath, index: number, path: Paths.Path): CompoundPath => {
  const existing = [ ...compoundPath.segments ];
  //eslint-disable-next-line functional/prefer-readonly-type,functional/immutable-data
  existing[ index ] = path;
  return fromPaths(...existing);
};

/**
 * Computes x,y point at a relative position along compoundpath
 *
 * @param {Paths.Path[]} paths Combined paths (assumes contiguous)
 * @param {number} t Position (given as a percentage from 0 to 1)
 * @param {boolean} [useWidth] If true, widths are used for calulcating. If false, lengths are used
 * @param {Dimensions} [dimensions] Precalculated dimensions of paths, will be computed if omitted
 * @returns
 */
export const interpolate = (paths: readonly Paths.Path[], t: number, useWidth?: boolean, dimensions?: Dimensions) => {
  if (dimensions === undefined) {
    dimensions = computeDimensions(paths);
  }

  // Expected value to land on
  const expected = t * (useWidth ? dimensions.totalWidth : dimensions.totalLength);
  //eslint-disable-next-line functional/no-let
  let soFar = 0;

  // Use widths or lengths?
  const l = useWidth ? dimensions.widths : dimensions.lengths;
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < l.length; i++) {
    if (soFar + l[ i ] >= expected) {
      const relative = expected - soFar;
      //eslint-disable-next-line functional/no-let
      let amt = relative / l[ i ];
      //eslint-disable-next-line functional/no-let
      if (amt > 1) amt = 1;
      return paths[ i ].interpolate(amt);
    } else soFar += l[ i ];
  }
  return { x: 0, y: 0 };
};

export type Dimensions = {
  /**
   * Width of each path (based on bounding box)
   *
   * @type {number[]}
   */
  readonly widths: readonly number[],
  /**
   * Length of each path
   *
   * @type {number[]}
   */
  readonly lengths: readonly number[],

  /**
   * Total length of all paths
   *
   * @type {number}
   */
  readonly totalLength: number,
  /**
   * Total width of all paths
   *
   * @type {number}
   */
  readonly totalWidth: number
}
/**
 * Computes the widths and lengths of all paths, adding them up as well
 *
 * @param {Paths.Path[]} paths
 * @returns {Dimensions}
 */
export const computeDimensions = (paths: readonly Paths.Path[]): Dimensions => {
  const widths = paths.map(l => l.bbox().width);
  const lengths = paths.map(l => l.length());
  //eslint-disable-next-line functional/no-let
  let totalLength = 0;
  //eslint-disable-next-line functional/no-let
  let totalWidth = 0;
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < lengths.length; i++) totalLength += lengths[ i ];
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < widths.length; i++) totalWidth += widths[ i ];

  return { totalLength, totalWidth, widths, lengths };
};

/**
 * Computes the bounding box that encloses entire compoundpath
 *
 * @param {Paths.Path[]} paths
 * 
 * @returns {Rects.Rect}
 */
export const bbox = (paths: readonly Paths.Path[]): Rects.RectPositioned => {
  const boxes = paths.map(p => p.bbox());
  const corners = boxes.map(b => Rects.corners(b)).flat();

  return Points.bbox(...corners);
};

/**
 * Produce a human-friendly representation of paths
 *
 * @param {Paths.Path[]} paths
 * @returns {string}
 */
export const toString = (paths: readonly Paths.Path[]): string => paths.map(p => p.toString()).join(`, `);

/**
 * Throws an error if paths are not connected together, in order
 *
 * @param {Paths.Path[]} paths
 */
export const guardContinuous = (paths: readonly Paths.Path[]) => {
  //eslint-disable-next-line functional/no-let
  let lastPos = Paths.getEnd(paths[ 0 ]);
  //eslint-disable-next-line functional/no-let
  for (let i = 1; i < paths.length; i++) {
    const start = Paths.getStart(paths[ i ]);
    if (!Points.isEqual(start, lastPos)) throw new Error(`Path index ` + i + ` does not start at prior path end. Start: ` + start.x + `,` + start.y + ` expected: ` + lastPos.x + `,` + lastPos.y + ``);
    lastPos = Paths.getEnd(paths[ i ]);
  }
};

export const toSvgString = (paths: readonly Paths.Path[]): readonly string[] => paths.flatMap(p => p.toSvgString());

/**
 * Create a compoundpath from an array of paths.
 * All this does is verify they are connected, and precomputes dimensions
 *
 * @param {...Paths.Path[]} paths
 * @returns {CompoundPath}
 */
export const fromPaths = (...paths: readonly Paths.Path[]): CompoundPath => {
  guardContinuous(paths); // Throws an error if paths are not connected
  const dims = computeDimensions(paths);

  return Object.freeze({
    segments: paths,
    length: () => dims.totalLength,
    nearest: (_: Point) => { throw new Error(`not implemented`); },
    interpolate: (t: number, useWidth = false) => interpolate(paths, t, useWidth, dims),
    bbox: () => bbox(paths),
    toString: () => toString(paths),
    toSvgString: () => toSvgString(paths),
    kind: `compound`
  });
};
