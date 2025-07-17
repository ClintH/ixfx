import { degreeToRadian, radianArc, radiansSum } from '../angles.js';
import { guard as guardPoint, isPoint } from '../point/guard.js';
import { distance as pointsDistance } from '../point/distance.js';
import { bbox as pointsBbox } from '../point/bbox.js';
import { toCartesian } from '../polar/index.js';
import type { Point } from '../point/point-type.js';
import type { Line } from '../line/line-type.js';
import type { Path } from '../path/path-type.js';
import type { Rect, RectPositioned } from '../rect/rect-types.js';
import { fromPoints as LinesFromPoints } from '../line/from-points.js';
import type { Arc, ArcInterpolate, ArcPositioned, ArcSvgOpts, ArcToSvg } from './arc-type.js';
import type { CirclePositioned } from '../circle/circle-type.js';
import { piPi } from '../pi.js';

export type * from './arc-type.js';

/**
 * Returns true if parameter is an arc
 * @param p Arc or number
 * @returns 
 */
export const isArc = (p: unknown): p is Arc => typeof (p as Arc).startRadian !== `undefined` && typeof (p as Arc).endRadian !== `undefined` && typeof (p as Arc).clockwise !== `undefined`;

/**
 * Returns true if parameter has a positioned (x,y) 
 * @param p Point, Arc or ArcPositiond
 * @returns 
 */
export const isPositioned = (p: Point | Arc | ArcPositioned): p is Point => typeof (p as Point).x !== `undefined` && typeof (p as Point).y !== `undefined`;

//const piPi = Math.PI * 2;

/**
 * Returns an arc from degrees, rather than radians
 * @param radius Radius of arc
 * @param startDegrees Start angle in degrees
 * @param endDegrees End angle in degrees
 * @returns Arc
 */
export function fromDegrees(radius: number, startDegrees: number, endDegrees: number, clockwise: boolean): Arc;

/**
 * Returns an arc from degrees, rather than radians
 * @param radius Radius of arc
 * @param startDegrees Start angle in degrees
 * @param endDegrees End angle in degrees
 * @param origin Optional center of arc
 * @param clockwise Whether arc moves in clockwise direction
 * @returns Arc
 */export function fromDegrees(radius: number, startDegrees: number, endDegrees: number, clockwise: boolean, origin: Point): ArcPositioned

/**
 * Returns an arc from degrees, rather than radians
 * @param radius Radius of arc
 * @param startDegrees Start angle in degrees
 * @param endDegrees End angle in degrees
 * @param origin Optional center of arc
 * @param clockwise Whether arc moves in clockwise direction
 * @returns Arc
 */
export function fromDegrees(radius: number, startDegrees: number, endDegrees: number, clockwise: boolean, origin?: Point): Arc | ArcPositioned {
  const a: Arc = {
    radius,
    startRadian: degreeToRadian(startDegrees),
    endRadian: degreeToRadian(endDegrees),
    clockwise
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
 * Returns a {@link Line} linking the start and end points of an {@link ArcPositioned}.
 *
 * @param arc
 * @returns Line from start to end of arc
 */
export const toLine = (arc: ArcPositioned): Line => LinesFromPoints(
  point(arc, arc.startRadian),
  point(arc, arc.endRadian)
);

/**
 * Return start and end points of `arc`.
 * `origin` will override arc's origin, if defined.
 * 
 * See also: 
 * * {@link point} - get point on arc by angle
 * * {@link interpolate} - get point on arc by interpolation percentage
 * @param arc 
 * @param origin 
 * @returns 
 */
export const getStartEnd = (arc: ArcPositioned | Arc, origin?: Point): [ start: Point, end: Point ] => {
  guard(arc);
  const start = point(arc, arc.startRadian, origin);
  const end = point(arc, arc.endRadian, origin);
  return [ start, end ];
}

/**
 * Calculates a coordinate on an arc, based on an angle.
 * `origin` will override arc's origin, if defined.
 * 
 * See also:
 * * {@link getStartEnd} - get start and end of arc
 * * {@link interpolate} - get point on arc by interpolation percentage
 * @param arc Arc
 * @param angleRadian Angle of desired coordinate 
 * @param origin Origin of arc (0,0 used by default)
 * @returns Coordinate
 */
export const point = (arc: Arc | ArcPositioned, angleRadian: number, origin?: Point): Point => {

  if (typeof origin === `undefined`) {
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
  if (typeof arc === `undefined`) throw new TypeError(`Arc is undefined`);
  if (isPositioned(arc)) {
    guardPoint(arc, `arc`);
  }
  if (typeof arc.radius === `undefined`) throw new TypeError(`Arc radius is undefined (${ JSON.stringify(arc) })`);
  if (typeof arc.radius !== `number`) throw new TypeError(`Radius must be a number`);
  if (Number.isNaN(arc.radius)) throw new TypeError(`Radius is NaN`);
  if (arc.radius <= 0) throw new TypeError(`Radius must be greater than zero`);

  if (typeof arc.startRadian === `undefined`) throw new TypeError(`Arc is missing 'startRadian' field`);
  if (typeof arc.endRadian === `undefined`) throw new TypeError(`Arc is missing 'startRadian' field`);
  if (Number.isNaN(arc.endRadian)) throw new TypeError(`Arc endRadian is NaN`);
  if (Number.isNaN(arc.startRadian)) throw new TypeError(`Arc endRadian is NaN`);

  if (typeof arc.clockwise === `undefined`) throw new TypeError(`Arc is missing 'clockwise field`);
  if (arc.startRadian >= arc.endRadian) throw new TypeError(`startRadian is expected to be les than endRadian`);
};




/**
 * Compute relative position on arc.
 * 
 * See also:
 * * {@link getStartEnd} - get start and end of arc
 * * {@link point} - get point on arc by angle
 * @param arc Arc
 * @param amount Relative position 0-1
 * @param origin If arc is not positioned, pass in an origin
 * @param allowOverflow If _true_ allows point to overflow arc dimensions (default: _false_)
 * @returns 
 */
export const interpolate: ArcInterpolate = (amount: number, arc: ArcPositioned | Arc, allowOverflow?: boolean, origin?: Point): Point => {
  guard(arc);
  const overflowOk = allowOverflow ?? false;
  if (!overflowOk) {
    if (amount < 0) throw new Error(`Param 'amount' is under zero, and overflow is not allowed`);
    if (amount > 1) throw new Error(`Param 'amount' is above 1 and overflow is not allowed`);
  }
  const span = angularSize(arc); // angular size
  const rel = span * amount;
  const angle = radiansSum(arc.startRadian, rel, arc.clockwise);
  //console.log(`interpolate span: ${ span.toFixed(2) } rel: ${ rel.toFixed(2) } angle: ${ angle.toFixed(2) } amt: ${ amount.toFixed(2) } cw: ${ arc.clockwise } start: ${ arc.startRadian }`);
  return point(arc, angle, origin);
  //return point(arc, arc.startRadian + ((arc.endRadian - arc.startRadian) * amount), origin);
};

/**
 * Returns the angular size of arc.
 * Eg if arc runs from 45-315deg in clockwise direction, size will be 90deg.
 * @param arc 
 */
export const angularSize = (arc: Arc) => radianArc(arc.startRadian, arc.endRadian, arc.clockwise)

/**
 * Creates a {@link Path} instance from the arc. This wraps up some functions for convienence.
 * @param arc 
 * @returns Path
 */
export const toPath = (arc: ArcPositioned): Path => {
  guard(arc);

  return Object.freeze({
    ...arc,
    nearest: (_point: Point) => { throw new Error(`not implemented`); },
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
 * Returns an arc based on a circle using start and end angles.
 * If you don't have the end angle, but rather the size of the arc, use {@link fromCircleAmount}
 * @param circle Circle
 * @param startRadian Start radian
 * @param endRadian End radian
 * @param clockwise Whether arc goes in a clockwise direction (default: true)
 * @returns 
 */
export const fromCircle = (circle: CirclePositioned, startRadian: number, endRadian: number, clockwise = true): ArcPositioned => {
  const a: ArcPositioned = Object.freeze({
    ...circle,
    endRadian,
    startRadian,
    clockwise
  });
  return a;
}

/**
 * Returns an arc based on a circle, a start angle, and the size of the arc.
 * See {@link fromCircle} if you already have start and end angles.
 * @param circle Circle to base off
 * @param startRadian Starting angle
 * @param sizeRadian Size of arc
 * @param clockwise Whether arc moves in clockwise direction (default: true)
 * @returns 
 */
export const fromCircleAmount = (circle: CirclePositioned, startRadian: number, sizeRadian: number, clockwise = true): ArcPositioned => {
  const endRadian = radiansSum(startRadian, sizeRadian, clockwise);
  return fromCircle(circle, startRadian, endRadian)
}


/**
 * Calculates the length of the arc
 * @param arc 
 * @returns Length
 */
export const length = (arc: Arc): number => piPi * arc.radius * ((arc.startRadian - arc.endRadian) / piPi);

/**
 * Calculates a {@link Rect} bounding box for arc.
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





/**
 * Creates an SV path snippet for arc
 * @returns 
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
export const toSvg: ArcToSvg = (a: Point | Arc | ArcPositioned, b?: number | Point | ArcSvgOpts, c?: number | ArcSvgOpts, d?: number, e?: ArcSvgOpts) => {
  if (isArc(a)) {
    if (isPositioned(a)) {
      if (isPoint(b)) {
        // Passing in a origin override
        return toSvgFull(b, a.radius, a.startRadian, a.endRadian, c as ArcSvgOpts)
      } else {
        // Using origin in arc
        return toSvgFull(a, a.radius, a.startRadian, a.endRadian, b as ArcSvgOpts);
      }
    } else {
      return isPoint(b) ? toSvgFull(b, a.radius, a.startRadian, a.endRadian, c as ArcSvgOpts) : toSvgFull({ x: 0, y: 0 }, a.radius, a.startRadian, a.endRadian);
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



const toSvgFull = (origin: Point, radius: number, startRadian: number, endRadian: number, opts?: ArcSvgOpts): readonly string[] => {
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
  if (a.endRadian !== b.endRadian) return false;
  if (a.startRadian !== b.startRadian) return false;
  if (a.clockwise !== b.clockwise) return false;

  if (isPositioned(a) && isPositioned(b)) {
    if (a.x !== b.x) return false;
    if (a.y !== b.y) return false;
    if (a.z !== b.z) return false;
  } else if (!isPositioned(a) && !isPositioned(b)) {
    // no-op
  } else return false; // one is positioned one not

  return true;
};