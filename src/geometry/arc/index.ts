import { degreeToRadian } from '../Angles.js';
import { guard as guardPoint, isPoint } from '../point/Guard.js';
import { distance as pointsDistance } from '../point/Distance.js';
import { bbox as pointsBbox } from '../point/Bbox.js';
import { toCartesian } from '../Polar.js';
import type { Point } from '../point/PointType.js';
import type { Line } from '../line/LineType.js';
import type { Path } from '../path/index.js';
import type { Rect, RectPositioned } from '../rect/index.js';
import { fromPoints as LinesFromPoints } from '../line/FromPoints.js';
import type { Arc, ArcPositioned } from './ArcType.js';

export type * from './ArcType.js';

/**
 * Returns true if parameter is an arc
 * @param p Arc or number
 * @returns 
 */
export const isArc = (p: unknown): p is Arc => (p as Arc).startRadian !== undefined && (p as Arc).endRadian !== undefined;

/**
 * Returns true if parameter has a positioned (x,y) 
 * @param p Point, Arc or ArcPositiond
 * @returns 
 */
export const isPositioned = (p: Point | Arc | ArcPositioned): p is Point => (p as Point).x !== undefined && (p as Point).y !== undefined;

const piPi = Math.PI * 2;

/**
 * Returns an arc from degrees, rather than radians
 * @param radius Radius of arc
 * @param startDegrees Start angle in degrees
 * @param endDegrees End angle in degrees
 * @returns Arc
 */
export function fromDegrees(radius: number, startDegrees: number, endDegrees: number): Arc;

/**
 * Returns an arc from degrees, rather than radians
 * @param radius Radius of arc
 * @param startDegrees Start angle in degrees
 * @param endDegrees End angle in degrees
 * @param origin Optional center of arc
 * @returns Arc
 */export function fromDegrees(radius: number, startDegrees: number, endDegrees: number, origin: Point): ArcPositioned

/**
 * Returns an arc from degrees, rather than radians
 * @param radius Radius of arc
 * @param startDegrees Start angle in degrees
 * @param endDegrees End angle in degrees
 * @param origin Optional center of arc
 * @returns Arc
 */
//eslint-disable-next-line func-style
export function fromDegrees(radius: number, startDegrees: number, endDegrees: number, origin?: Point): Arc | ArcPositioned {
  const a: Arc = {
    radius,
    startRadian: degreeToRadian(startDegrees),
    endRadian: degreeToRadian(endDegrees)
  };
  if (isPoint(origin)) {
    guardPoint(origin);
    const ap: ArcPositioned = {
      ...a,
      x: origin.x,
      y: origin.y
    };
    return Object.freeze(ap);
  } else {
    return Object.freeze(a);
  }
}

/**
 * Returns a {@link Geometry.Line} linking the start and end points of an {@link ArcPositioned}.
 *
 * @param arc
 * @returns Line from start to end of arc
 */
export const toLine = (arc: ArcPositioned): Line => LinesFromPoints(
  point(arc, arc.startRadian),
  point(arc, arc.endRadian)
);

/**
 * Calculates a coordinate on an arc, based on an angle
 * @param arc Arc
 * @param angleRadian Angle of desired coordinate 
 * @param origin Origin of arc (0,0 used by default)
 * @returns Coordinate
 */
export const point = (arc: Arc | ArcPositioned, angleRadian: number, origin?: Point): Point => {
  if (angleRadian > arc.endRadian) throw new Error(`angleRadian beyond end angle of arc`);
  if (angleRadian < arc.startRadian) throw new Error(`angleRadian beyond start angle of arc`);

  if (origin === undefined) {
    origin = isPositioned(arc) ? arc : { x: 0, y: 0 };
  }
  return {
    x: (Math.cos(angleRadian) * arc.radius) + origin.x,
    y: (Math.sin(angleRadian) * arc.radius) + origin.y
  };
};

/**
 * Throws an error if arc instance is invalid
 * @param arc 
 */
export const guard = (arc: Arc | ArcPositioned) => {
  if (arc === undefined) throw new Error(`Arc is undefined`);
  if (isPositioned(arc)) {
    guardPoint(arc, `arc`);
  }
  if (arc.radius === undefined) throw new Error(`Arc radius is undefined (${ JSON.stringify(arc) })`);
  if (typeof arc.radius !== `number`) throw new Error(`Radius must be a number`);
  if (Number.isNaN(arc.radius)) throw new Error(`Radius is NaN`);
  if (arc.radius <= 0) throw new Error(`Radius must be greater than zero`);

  if (arc.startRadian === undefined) throw new Error(`Arc is missing 'startRadian' field`);
  if (arc.endRadian === undefined) throw new Error(`Arc is missing 'startRadian' field`);
  if (Number.isNaN(arc.endRadian)) throw new Error(`Arc endRadian is NaN`);
  if (Number.isNaN(arc.startRadian)) throw new Error(`Arc endRadian is NaN`);

  if (arc.startRadian >= arc.endRadian) throw new Error(`startRadian is expected to be les than endRadian`);
};


type Interpolate = {
  (amount: number, arc: Arc, origin: Point): Point;
  (amount: number, arc: ArcPositioned): Point;
};

/**
 * Compute relative position on arc
 * @param arc Arc
 * @param amount Relative position 0-1
 * @param origin If arc is not positioned, pass in an origin
 * @returns 
 */
export const interpolate: Interpolate = (amount: number, arc: ArcPositioned | Arc, origin?: Point): Point => {
  guard(arc);
  return point(arc, arc.startRadian + ((arc.endRadian - arc.startRadian) * amount), origin);
};

/**
 * Creates a {@link Geometry.Path} instance from the arc. This wraps up some functions for convienence.
 * @param arc 
 * @returns Path
 */
export const toPath = (arc: ArcPositioned): Path => {
  guard(arc);

  return Object.freeze({
    ...arc,
    nearest: (point: Point) => { throw new Error(`not implemented`); },
    interpolate: (amount: number) => interpolate(amount, arc),
    bbox: () => bbox(arc) as RectPositioned,
    length: () => length(arc),
    toSvgString: () => toSvg(arc),
    relativePosition: (_point: Point, _intersectionThreshold: number) => {
      throw new Error(`Not implemented`)
    },
    distanceToPoint: (_point: Point): number => {
      throw new Error(`Not implemented`)
    },
    kind: `arc`
  });
};

/**
 * Calculates the length of the arc
 * @param arc 
 * @returns Length
 */
export const length = (arc: Arc): number => piPi * arc.radius * ((arc.startRadian - arc.endRadian) / piPi);

/**
 * Calculates a {@link Geometry.Rect | Rect} bounding box for arc.
 * @param arc 
 * @returns Rectangle encompassing arc.
 */
export const bbox = (arc: ArcPositioned | Arc): RectPositioned | Rect => {
  if (isPositioned(arc)) {
    const middle = interpolate(0.5, arc);
    const asLine = toLine(arc);
    return pointsBbox(middle, asLine.a, asLine.b);
  } else {
    return {
      width: arc.radius * 2,
      height: arc.radius * 2
    };
  }
};


type ToSvg = {
  /**
   * SVG path for arc description
   * @param origin Origin of arc
   * @param radius Radius
   * @param startRadian Start
   * @param endRadian End
   */
  (origin: Point, radius: number, startRadian: number, endRadian: number, opts?: SvgOpts): ReadonlyArray<string>;
  /**
   * SVG path for non-positioned arc
   */
  (arc: Arc, origin: Point, opts?: SvgOpts): ReadonlyArray<string>;
  /**
   * SVG path for positioned arc
   */
  (arc: ArcPositioned, opts?: SvgOpts): ReadonlyArray<string>;
};


/**
 * Creates an SV path snippet for arc
 * @returns 
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
export const toSvg: ToSvg = (a: Point | Arc | ArcPositioned, b?: number | Point | SvgOpts, c?: number | SvgOpts, d?: number, e?: SvgOpts) => {
  if (isArc(a)) {
    if (isPositioned(a)) {
      return toSvgFull(a, a.radius, a.startRadian, a.endRadian, b as SvgOpts);
    } else {
      return isPoint(b) ? toSvgFull(b, a.radius, a.startRadian, a.endRadian, c as SvgOpts) : toSvgFull({ x: 0, y: 0 }, a.radius, a.startRadian, a.endRadian);
    }
  } else {
    if (c === undefined) throw new Error(`startAngle undefined`);
    if (d === undefined) throw new Error(`endAngle undefined`);

    if (isPoint(a)) {
      if (typeof b === `number` && typeof c === `number` && typeof d === `number`) {
        return toSvgFull(a, b, c, d, e);
      } else {
        throw new TypeError(`Expected (point, number, number, number). Missing a number param.`);
      }
    } else {
      throw new Error(`Expected (point, number, number, number). Missing first point.`);
    }
  }
};

export type SvgOpts = {

  /**
   * "If the arc should be greater or less than 180 degrees"
   * ie. tries to maximise arc length
   */
  readonly largeArc?: boolean

  /**
   * "If the arc should begin moving at positive angles"
   * ie. the kind of bend it makes to reach end point
   */
  readonly sweep?: boolean
}

const toSvgFull = (origin: Point, radius: number, startRadian: number, endRadian: number, opts?: SvgOpts): ReadonlyArray<string> => {
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
  // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  // a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy

  if (opts === undefined || typeof opts !== `object`) opts = {};

  const isFullCircle = endRadian - startRadian === 360;
  const start = toCartesian(radius, endRadian - 0.01, origin);
  const end = toCartesian(radius, startRadian, origin);

  const { largeArc = false, sweep = false } = opts;

  const d = [ `
    M ${ start.x } ${ start.y }
    A ${ radius } ${ radius } 0 ${ largeArc ? `1` : `0` } ${ sweep ? `1` : `0` } ${ end.x } ${ end.y },
  `];

  //eslint-disable-next-line functional/immutable-data
  if (isFullCircle) d.push(`z`);

  return d;
};

/**
 * Calculates the distance between the centers of two arcs
 * @param a
 * @param b 
 * @returns Distance 
 */
export const distanceCenter = (a: ArcPositioned, b: ArcPositioned): number => pointsDistance(a, b);

/**
 * Returns true if the two arcs have the same values
 *
 * ```js
 * const arcA = { radius: 5, endRadian: 0, startRadian: 1 };
 * const arcA = { radius: 5, endRadian: 0, startRadian: 1 };
 * arcA === arcB; // false, because object identities are different
 * Arcs.isEqual(arcA, arcB); // true, because values are identical
 * ```
 * @param a
 * @param b
 * @returns {boolean}
 */
export const isEqual = (a: Arc | ArcPositioned, b: Arc | ArcPositioned): boolean => {
  if (a.radius !== b.radius) return false;

  if (isPositioned(a) && isPositioned(b)) {
    if (a.x !== b.x) return false;
    if (a.y !== b.y) return false;
    if (a.z !== b.z) return false;
    return true;
  } else if (!isPositioned(a) && !isPositioned(b)) {
    // no-op
  } else return false; // one is positioned one not

  if (a.endRadian !== b.endRadian) return false;
  if (a.startRadian !== b.startRadian) return false;
  return true;
};