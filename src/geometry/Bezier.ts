import {Bezier as BezierLib} from 'bezier-js';
import * as Paths from './Path.js';
import * as Points from './Point.js';
import * as Rects from './Rect.js';
import * as Lines from './Line.js';

export type QuadraticBezier = {
  readonly a: Points.Point,
  readonly b: Points.Point,
  readonly quadratic: Points.Point
}

export type QuadraticBezierPath = Paths.Path & QuadraticBezier;
export type CubicBezier = {
  readonly a: Points.Point,
  readonly b: Points.Point,
  readonly cubic1: Points.Point,
  readonly cubic2: Points.Point,
}

export type CubicBezierPath = Paths.Path & CubicBezier;


export const isQuadraticBezier = (path: Paths.Path | QuadraticBezier | CubicBezier): path is QuadraticBezier => (path as QuadraticBezier).quadratic !== undefined;
export const isCubicBezier = (path: Paths.Path | CubicBezier | QuadraticBezier): path is CubicBezier => (path as CubicBezier).cubic1 !== undefined && (path as CubicBezier).cubic2 !== undefined;

/**
 * Returns a new quadratic bezier with specified bend amount
 *
 * @param {QuadraticBezier} b Curve
 * @param {number} [bend=0] Bend amount, from -1 to 1
 * @returns {QuadraticBezier}
 */
 export const quadraticBend = (a:Points.Point, b: Points.Point, bend = 0): QuadraticBezier => quadraticSimple(a, b, bend);
 //export const quadraticBend = (b: QuadraticBezier, bend = 0): QuadraticBezier => quadraticSimple(b.a, b.b, bend);

/**
 * Creates a simple quadratic bezier with a specified amount of 'bend'.
 * Bend of -1 will pull curve down, 1 will pull curve up. 0 is no curve
 * @param {Points.Point} start Start of curbe
 * @param {Points.Point} end End of curbe
 * @param {number} [bend=0] Bend amount, -1 to 1
 * @returns {QuadraticBezier}
 */
export const quadraticSimple = (start: Points.Point, end: Points.Point, bend = 0): QuadraticBezier => {
  if (isNaN(bend)) throw Error(`bend is NaN`);
  if (bend < -1 || bend > 1) throw Error(`Expects bend range of -1 to 1`);

  const middle = Lines.compute(start, end, 0.5);
  // eslint-disable-next-line functional/no-let
  let target = middle;
  if (end.y < start.y) {
    // Upward slope
    target = bend > 0 ? {x: Math.min(start.x, end.x), y: Math.min(start.y, end.y)} :
      {x: Math.max(start.x, end.x), y: Math.max(start.y, end.y)};
  } else {
    // Downward slope
    target = bend > 0 ? {x: Math.max(start.x, end.x), y: Math.min(start.y, end.y)} :
      {x: Math.min(start.x, end.x), y: Math.max(start.y, end.y)};
  }

  const handle = Lines.compute(middle, target, Math.abs(bend));
  //console.log(`quadraticSimple: bend: ${bend} middle: ${middle.x},${middle.y} handle: ${handle.x},${handle.y}`);
  return quadratic(start, end, handle);
};

//https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
export const quadraticToSvgString = (start: Points.Point, end: Points.Point, handle: Points.Point): string => `M ${start.x} ${start.y} Q ${handle.x} ${handle.y} ${end.x} ${end.y}`;

export const toPath = (cubicOrQuadratic:CubicBezier|QuadraticBezier): CubicBezierPath|QuadraticBezierPath => {
  if (isCubicBezier(cubicOrQuadratic)) {
    return cubicToPath(cubicOrQuadratic);
  } else if (isQuadraticBezier(cubicOrQuadratic)) {
    return quadratictoPath(cubicOrQuadratic);
  } else {
    throw new Error(`Unknown bezier type`);
  }
};

export const cubic = (start:Points.Point, end:Points.Point, cubic1:Points.Point, cubic2:Points.Point): CubicBezier => (
  {
    a: Object.freeze(start),
    b: Object.freeze(end),
    cubic1: Object.freeze(cubic1),
    cubic2: Object.freeze(cubic2) 
  });

const cubicToPath = (cubic:CubicBezier): CubicBezierPath => {
  const {a, cubic1, cubic2, b} = cubic;

  const bzr = new BezierLib(a, cubic1, cubic2, b);
  return Object.freeze({
    ...cubic,
    length: () => bzr.length(),
    compute: (t: number) => bzr.compute(t),
    bbox: () => {
      const {x, y} = bzr.bbox();
      const xSize = x.size;
      const ySize = y.size;
      if (xSize === undefined) throw new Error(`x.size not present on calculated bbox`);
      if (ySize === undefined) throw new Error(`x.size not present on calculated bbox`);

      return Rects.fromTopLeft({x: x.min, y: y.min}, xSize, ySize);
    },
    toString: () => bzr.toString(),
    toSvgString: () => `brrup`,
    kind: `bezier/cubic`
  });
};

export const quadratic = (start: Points.Point, end: Points.Point, handle: Points.Point): QuadraticBezier => ({
  a: Object.freeze(start),
  b: Object.freeze(end),
  quadratic: Object.freeze(handle)
});


const quadratictoPath = (quadraticBezier:QuadraticBezier): QuadraticBezierPath => {
  const {a, b, quadratic} = quadraticBezier;
  const bzr = new BezierLib(a, quadratic, b);
  return Object.freeze({
    ...quadraticBezier,
    length: () => bzr.length(),
    compute: (t: number) => bzr.compute(t),
    bbox: () => {
      const {x, y} = bzr.bbox();
      const xSize = x.size;
      const ySize = y.size;
      if (xSize === undefined) throw new Error(`x.size not present on calculated bbox`);
      if (ySize === undefined) throw new Error(`x.size not present on calculated bbox`);
      return Rects.fromTopLeft({x: x.min, y: y.min}, xSize, ySize);
    },
    toString: () => bzr.toString(),
    toSvgString: () => quadraticToSvgString(a, b, quadratic),
    kind: `bezier/quadratic`
  });
};

