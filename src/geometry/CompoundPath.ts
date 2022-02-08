import {Points, Paths, Rects} from './index.js';

export type CompoundPath = Paths.Path & {
  segments: Paths.Path[]
  kind: `compound`
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
  const existing = compoundPath.segments;
  existing[index] = path;
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
export const compute = (paths: Paths.Path[], t: number, useWidth?: boolean, dimensions?: Dimensions) => {
  if (dimensions === undefined) {
    dimensions = computeDimensions(paths);
  }

  // Expected value to land on
  const expected = t * (useWidth ? dimensions.totalWidth : dimensions.totalLength);
  let soFar = 0;

  // Use widths or lengths?
  const l = useWidth ? dimensions.widths : dimensions.lengths;
  for (let i = 0; i < l.length; i++) {
    if (soFar + l[i] >= expected) {
      const relative = expected - soFar;
      let amt = relative / l[i];
      if (amt > 1) amt = 1;
      return paths[i].compute(amt);
    } else soFar += l[i];
  }
  return {x: 0, y: 0};
};

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
  const widths = paths.map(l => l.bbox().width);
  const lengths = paths.map(l => l.length());
  let totalLength = 0;
  let totalWidth = 0;
  for (let i = 0; i < lengths.length; i++) totalLength += lengths[i];
  for (let i = 0; i < widths.length; i++) totalWidth += widths[i];

  return {totalLength, totalWidth, widths, lengths};
};

/**
 * Computes the bounding box that encloses entire compoundpath
 *
 * @param {Paths.Path[]} paths
 * 
 * @returns {Rects.Rect}
 */
export const bbox = (paths: Paths.Path[]): Rects.RectPositioned => {
  const boxes = paths.map(p => p.bbox());
  const corners = boxes.map(b => Rects.getCorners(b)).flat();
  
  return Points.bbox(...corners);
};

/**
 * Produce a human-friendly representation of paths
 *
 * @param {Paths.Path[]} paths
 * @returns {string}
 */
export const toString = (paths: Paths.Path[]): string => paths.map(p => p.toString()).join(`, `);

/**
 * Throws an error if paths are not connected together, in order
 *
 * @param {Paths.Path[]} paths
 */
export const guardContinuous = (paths: Paths.Path[]) => {
  let lastPos = Paths.getEnd(paths[0]);
  for (let i = 1; i < paths.length; i++) {
    const start = Paths.getStart(paths[i]);
    if (!Points.equals(start, lastPos)) throw new Error(`Path index ` + i + ` does not start at prior path end. Start: ` + start.x + `,` + start.y + ` expected: ` + lastPos.x + `,` + lastPos.y + ``);
    lastPos = Paths.getEnd(paths[i]);
  }
};

export const toSvgString = (paths: Paths.Path[]): readonly string[] => paths.flatMap(p => p.toSvgString());

/**
 * Create a compoundpath from an array of paths.
 * All this does is verify they are connected, and precomputes dimensions
 *
 * @param {...Paths.Path[]} paths
 * @returns {CompoundPath}
 */
export const fromPaths = (...paths: Paths.Path[]): CompoundPath => {
  guardContinuous(paths); // Throws an error if paths are not connected
  const dims = computeDimensions(paths);

  return Object.freeze({
    segments: paths,
    length: () => dims.totalLength,
    compute: (t: number, useWidth = false) => compute(paths, t, useWidth, dims),
    bbox: () => bbox(paths),
    toString: () => toString(paths),
    toSvgString: () => toSvgString(paths),
    kind: `compound`
  });
};
