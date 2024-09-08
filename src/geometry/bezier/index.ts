import { Bezier as BezierLibrary } from 'bezier-js';
import { interpolate as LinesInterpolate } from '../line/Interpolate.js';
import { fromTopLeft as RectsFromTopLeft } from '../rect/FromTopLeft.js';
import type { Point } from '../point/PointType.js';
import type { CubicBezier, CubicBezierPath, QuadraticBezier, QuadraticBezierPath } from './BezierType.js';
import { isCubicBezier, isQuadraticBezier } from './Guard.js';
import { to2d } from '../point/To.js';
export * from './BezierType.js';
export * from './Guard.js';
/**
 * Returns a new quadratic bezier with specified bend amount
 *
 * @param {QuadraticBezier} b Curve
 * @param {number} [bend=0] Bend amount, from -1 to 1
 * @returns {QuadraticBezier}
 */
export const quadraticBend = (a: Point, b: Point, bend = 0): QuadraticBezier => quadraticSimple(a, b, bend);

/**
 * Creates a simple quadratic bezier with a specified amount of 'bend'.
 * Bend of -1 will pull curve down, 1 will pull curve up. 0 is no curve.
 * 
 * Use {@link interpolator} to calculate a point along the curve.
 * @param {Point} start Start of curve
 * @param {Point} end End of curve
 * @param {number} [bend=0] Bend amount, -1 to 1
 * @returns {QuadraticBezier}
 */
export const quadraticSimple = (start: Point, end: Point, bend = 0): QuadraticBezier => {
  if (Number.isNaN(bend)) throw new Error(`bend is NaN`);
  if (bend < -1 || bend > 1) throw new Error(`Expects bend range of -1 to 1`);

  const middle = LinesInterpolate(0.5, start, end);
  // eslint-disable-next-line functional/no-let
  let target = middle;
  if (end.y < start.y) {
    // Upward slope
    target = bend > 0 ? { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) } :
      { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) };
  } else {
    // Downward slope
    target = bend > 0 ? { x: Math.max(start.x, end.x), y: Math.min(start.y, end.y) } :
      { x: Math.min(start.x, end.x), y: Math.max(start.y, end.y) };
  }

  const handle = LinesInterpolate(Math.abs(bend), middle, target,);
  return quadratic(start, end, handle);
};

/**
 * Returns a relative point on a simple quadratic 
 * @param start Start
 * @param end  End
 * @param bend Bend (-1 to 1)
 * @param amt Amount
 * @returns Point
 */
// export const computeQuadraticSimple = (start: Point, end: Point, bend: number, amt: number): Point => {
//   const q = quadraticSimple(start, end, bend);
//   const bzr = new BezierLibrary(q.a, q.quadratic, q.b);
//   return bzr.compute(amt);
// };

/**
 * Interpolate cubic or quadratic bezier
 * ```js
 * const i = interpolator(myBezier);
 * 
 * // Get point at 50%
 * i(0.5); // { x, y }
 * ```
 * @param q 
 * @returns 
 */
export const interpolator = (q: QuadraticBezier | CubicBezier): (amount: number) => Point => {
  //console.log(q);
  //if (isCubicBezier(q)) console.log(`is cubic`);
  //const bzr = isCubicBezier(q) ? new BezierLibrary(to2d(q.a), to2d(q.cubic1), to2d(q.cubic2), to2d(q.b)) : new BezierLibrary(q.a, q.quadratic, q.b);
  const bzr = isCubicBezier(q) ?
    new BezierLibrary(q.a.x, q.a.y, q.cubic1.x, q.cubic1.y, q.cubic2.x, q.cubic2.y, q.b.x, q.b.y) :
    new BezierLibrary(q.a, q.quadratic, q.b);

  return (amount: number) => bzr.compute(amount);
};

//https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
export const quadraticToSvgString = (start: Point, end: Point, handle: Point): ReadonlyArray<string> => [ `M ${ start.x } ${ start.y } Q ${ handle.x } ${ handle.y } ${ end.x } ${ end.y }` ];

export const toPath = (cubicOrQuadratic: CubicBezier | QuadraticBezier): CubicBezierPath | QuadraticBezierPath => {
  if (isCubicBezier(cubicOrQuadratic)) {
    return cubicToPath(cubicOrQuadratic);
  } else if (isQuadraticBezier(cubicOrQuadratic)) {
    return quadratictoPath(cubicOrQuadratic);
  } else {
    throw new Error(`Unknown bezier type`);
  }
};

export const cubic = (start: Point, end: Point, cubic1: Point, cubic2: Point): CubicBezier => (
  {
    a: Object.freeze(start),
    b: Object.freeze(end),
    cubic1: Object.freeze(cubic1),
    cubic2: Object.freeze(cubic2)
  });

const cubicToPath = (cubic: CubicBezier): CubicBezierPath => {
  const { a, cubic1, cubic2, b } = cubic;

  const bzr = new BezierLibrary(a, cubic1, cubic2, b);
  return Object.freeze({
    ...cubic,
    length: () => bzr.length(),
    interpolate: (t: number) => bzr.compute(t),
    nearest: (_: Point) => { throw new Error(`not implemented`); },
    bbox: () => {
      const { x, y } = bzr.bbox();
      const xSize = x.size;
      const ySize = y.size;
      if (xSize === undefined) throw new Error(`x.size not present on calculated bbox`);
      if (ySize === undefined) throw new Error(`x.size not present on calculated bbox`);

      return RectsFromTopLeft({ x: x.min, y: y.min }, xSize, ySize);
    },
    relativePosition: (_point: Point, _intersectionThreshold: number) => {
      throw new Error(`Not implemented`);
    },
    distanceToPoint: (_point: Point): number => {
      throw new Error(`Not implemented`);
    },
    toSvgString: () => [ `brrup` ],
    kind: `bezier/cubic`
  });
};

export const quadratic = (start: Point, end: Point, handle: Point): QuadraticBezier => ({
  a: Object.freeze(start),
  b: Object.freeze(end),
  quadratic: Object.freeze(handle)
});


const quadratictoPath = (quadraticBezier: QuadraticBezier): QuadraticBezierPath => {
  const { a, b, quadratic } = quadraticBezier;
  const bzr = new BezierLibrary(a, quadratic, b);
  return Object.freeze({
    ...quadraticBezier,
    length: () => bzr.length(),
    interpolate: (t: number) => bzr.compute(t),
    nearest: (_: Point) => { throw new Error(`not implemented`); },
    bbox: () => {
      const { x, y } = bzr.bbox();
      const xSize = x.size;
      const ySize = y.size;
      if (xSize === undefined) throw new Error(`x.size not present on calculated bbox`);
      if (ySize === undefined) throw new Error(`x.size not present on calculated bbox`);
      return RectsFromTopLeft({ x: x.min, y: y.min }, xSize, ySize);
    },
    distanceToPoint: (_point: Point): number => {
      throw new Error(`Not implemented`);

    },
    relativePosition: (_point: Point, _intersectionThreshold: number): number => {
      throw new Error(`Not implemented`);

    },
    toString: () => bzr.toString(),
    toSvgString: () => quadraticToSvgString(a, b, quadratic),
    kind: `bezier/quadratic`
  });
};

