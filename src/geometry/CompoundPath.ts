
import { Points, Paths } from './index.js';
import type { RectPositioned, Point, Path } from './Types.js';
import { corners as RectsCorners } from './rect/index.js';
export type CompoundPath = Path & {
  readonly segments: ReadonlyArray<Path>
  readonly kind: `compound`
};

/**
 * Returns a new compoundpath, replacing a path at a given index
 *
 * @param compoundPath Existing compoundpath
 * @param index Index to replace at
 * @param path Path to substitute in
 * @returns New compoundpath
 */
export const setSegment = (compoundPath: CompoundPath, index: number, path: Path): CompoundPath => {
  const existing = [ ...compoundPath.segments ];
  //eslint-disable-next-line functional/prefer-readonly-type,functional/immutable-data
  existing[ index ] = path;
  return fromPaths(...existing);
};

/**
 * Computes x,y point at a relative position along compoundpath
 *
 * @param paths Combined paths (assumes contiguous)
 * @param t Position (given as a percentage from 0 to 1)
 * @param useWidth If true, widths are used for calulcating. If false, lengths are used
 * @param dimensions Precalculated dimensions of paths, will be computed if omitted
 * @returns
 */
export const interpolate = (paths: ReadonlyArray<Path>, t: number, useWidth?: boolean, dimensions?: Dimensions) => {
  if (dimensions === undefined) {
    dimensions = computeDimensions(paths);
  }

  // Expected value to land on
  const expected = t * (useWidth ? dimensions.totalWidth : dimensions.totalLength);
  let soFar = 0;

  // Use widths or lengths?
  const l = useWidth ? dimensions.widths : dimensions.lengths;
  for (const [ index, element ] of l.entries()) {
    if (soFar + element >= expected) {
      const relative = expected - soFar;
      let amt = relative / element;
      if (amt > 1) amt = 1;
      return paths[ index ].interpolate(amt);
    } else soFar += element;
  }
  return { x: 0, y: 0 };
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
 * Computes the widths and lengths of all paths, adding them up as well
 *
 * @param paths
 * @returns
 */
export const computeDimensions = (paths: ReadonlyArray<Path>): Dimensions => {
  const widths = paths.map(l => l.bbox().width);
  const lengths = paths.map(l => l.length());
  let totalLength = 0;
  let totalWidth = 0;
  for (const length of lengths) {
    totalLength += length;
  }
  for (const width of widths) {
    totalWidth += width;
  }

  return { totalLength, totalWidth, widths, lengths };
};

/**
 * Computes the bounding box that encloses entire compoundpath
 *
 * @param paths
 * @returns
 */
export const bbox = (paths: ReadonlyArray<Path>): RectPositioned => {
  const boxes = paths.map(p => p.bbox());
  const corners = boxes.flatMap(b => RectsCorners(b));

  return Points.bbox(...corners);
};

/**
 * Produce a human-friendly representation of paths
 *
 * @param paths
 * @returns
 */
export const toString = (paths: ReadonlyArray<Path>): string => paths.map(p => p.toString()).join(`, `);

/**
 * Throws an error if paths are not connected together, in order
 *
 * @param paths
 */
export const guardContinuous = (paths: ReadonlyArray<Path>) => {
  let lastPos = Paths.getEnd(paths[ 0 ]);
  for (let index = 1; index < paths.length; index++) {
    const start = Paths.getStart(paths[ index ]);
    if (!Points.isEqual(start, lastPos)) throw new Error(`Path index ` + index + ` does not start at prior path end. Start: ` + start.x + `,` + start.y + ` expected: ` + lastPos.x + `,` + lastPos.y + ``);
    lastPos = Paths.getEnd(paths[ index ]);
  }
};

export const toSvgString = (paths: ReadonlyArray<Path>): ReadonlyArray<string> => paths.flatMap(p => p.toSvgString());

/**
 * Create a compoundpath from an array of paths.
 * All this does is verify they are connected, and precomputes dimensions
 *
 * @param paths
 * @returns
 */
export const fromPaths = (...paths: ReadonlyArray<Path>): CompoundPath => {
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
