import * as MathUtil from './Math.js';
import {guard as guardPoint} from './Point.js';
import {Path} from './Path.js';
import {Lines, Points, Rects} from './index.js';

/**
 * Returns true if parameter is an arc
 * @param p Arc or number
 * @returns 
 */
export const isArc = (p: Arc|number): p is Arc => (p as Arc).startRadian !== undefined && (p as Arc).endRadian !== undefined;

/**
 * Returns true if parameter has a positioned (x,y) 
 * @param p Point, Arc or ArcPositiond
 * @returns 
 */
export const isPositioned = (p: Points.Point | Arc| ArcPositioned): p is Points.Point => (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;

/**
 * Arc, defined by radius, start and end point in radians, and whether it is counter-clockwise.
 */
export type Arc = {
/**
 * Radius of arc
 */
  readonly radius:number
/**
 * Start radian
 */
  readonly startRadian:number
/**
 * End radian
 */
  readonly endRadian:number
/**
 * If true, arc is counter-clockwise
 */
  readonly counterClockwise?:boolean
}

/**
 * An {@link Arc} that also has a position, given in x, y
 */
export type ArcPositioned = Points.Point & Arc;

const piPi = Math.PI *2;

/**
 * Returns an arc from degrees, rather than radians
 * @param radius Radius of arc
 * @param startDegrees Start angle in degrees
 * @param endDegrees End angle in degrees
 * @param origin Optional center of arc
 * @returns Arc
 */
export const fromDegrees = (radius:number, startDegrees:number, endDegrees:number, origin?:Points.Point): Arc|ArcPositioned => {
  const a = {
    radius,
    startRadian:MathUtil.degreeToRadian(startDegrees),
    endRadian:MathUtil.degreeToRadian(endDegrees)
  };
  if (origin !== undefined) {
    guardPoint(origin);
    return Object.freeze({
      ...a,
      x: origin.x,
      y: origin.y
    });
  } else return Object.freeze(a);
};

/**
 * Returns a {@link Line} linking the start and end points of an {@link ArcPositioned}.
 *
 * @param arc
 * @returns Line from start to end of arc
 */
export const toLine = (arc:ArcPositioned):Lines.Line => Lines.fromPoints(
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
export const point = (arc:Arc|ArcPositioned, angleRadian:number, origin?:Points.Point): Points.Point => {
  if (angleRadian > arc.endRadian) throw new Error(`angleRadian beyond end angle of arc`);
  if (angleRadian < arc.startRadian) throw new Error(`angleRadian beyond start angle of arc`);

  if (origin === undefined) {
    if (isPositioned(arc)) {
      origin = arc;
    } else {
      origin = {x:0, y:0};
    }
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
export const guard = (arc:Arc|ArcPositioned) => {
  if (arc === undefined) throw new Error(`Arc is undefined`);
  if (isPositioned(arc)) {
    guardPoint(arc, `arc`);
  }
  if (arc.radius === undefined) throw new Error(`Radius undefined`);
  if (typeof arc.radius !== `number`) throw new Error(`Radius must be a number`);
  if (Number.isNaN(arc.radius)) throw new Error(`Radius is NaN`);
  if (arc.radius <= 0) throw new Error(`Radius must be greater than zero`);

  if (arc.startRadian === undefined) throw new Error(`Arc is missing 'startRadian' field`);
  if (arc.endRadian === undefined) throw new Error(`Arc is missing 'startRadian' field`);
  if (Number.isNaN(arc.endRadian)) throw new Error(`Arc endRadian is NaN`);
  if (Number.isNaN(arc.startRadian)) throw new Error(`Arc endRadian is NaN`);

  if (arc.startRadian >= arc.endRadian) throw new Error(`startRadian is expected to be les than endRadian`);  
};

/**
 * Compute relative position on arc
 * @param arc Arc
 * @param t Relative position 0-1
 * @param origin If arc is not positioned, pass in an origin
 * @returns 
 */
export const compute = (arc:ArcPositioned|Arc, t:number, origin?:Points.Point):Points.Point => {
  guard(arc);
  return point(arc, arc.startRadian + ((arc.endRadian-arc.startRadian)*t), origin);
};

/**
 * Creates a {@link Path} instance from the arc. This wraps up some functions for convienence.
 * @param arc 
 * @returns Path
 */
export const toPath = (arc:ArcPositioned): Path => {
  guard(arc);

  return Object.freeze({
    ...arc,
    compute:(t:number) => compute(arc, t),
    bbox:() => bbox(arc) as Rects.RectPositioned,
    length: () => length(arc),
    toSvgString:() => toSvg({x: arc.x, y: arc.y}, arc),
    kind: `arc`
  });
};

/**
 * Calculates the length of the arc
 * @param arc 
 * @returns Length
 */
export const length = (arc:Arc):number =>  piPi*arc.radius*((arc.startRadian-arc.endRadian)/piPi);

/**
 * Calculates a {@link Rects.Rect|Rect} bounding box for arc.
 * @param arc 
 * @returns Rectangle encompassing arc.
 */
export const bbox = (arc:ArcPositioned|Arc):Rects.RectPositioned|Rects.Rect => {
  if (isPositioned(arc)) {
    const middle = compute(arc, 0.5);
    const asLine = toLine(arc);
    return Points.bbox(middle, asLine.a, asLine.b);
  } else {
    return {
      width: arc.radius*2,
      height: arc.radius*2
    };
  }
};

/**
 * Returns SVG string for an arc, suitable for Svg.js
 * @param origin Origin
 * @param radiusOrArc Radius, or {@link Arc} instance
 * @param startRadian Start radian
 * @param endRadian End radian
 * @returns Svg string
 */
export const toSvg = (origin:Points.Point, radiusOrArc:number|Arc, startRadian?:number, endRadian?:number) => {
  if (isArc(radiusOrArc)) return toSvgFull(origin, radiusOrArc.radius, radiusOrArc.startRadian, radiusOrArc.endRadian);
  if (startRadian === undefined) throw new Error(`startAngle undefined`);
  if (endRadian === undefined) throw new Error(`endAngle undefined`);
  return toSvgFull(origin, radiusOrArc, startRadian, endRadian);
};

const toSvgFull = (origin:Points.Point, radius:number, startRadian:number, endRadian:number) => {
  const isFullCircle = endRadian - startRadian === 360;
  const start = MathUtil.polarToCartesian(origin, radius, endRadian - 0.01);
  const end = MathUtil.polarToCartesian(origin, radius, startRadian);
  const arcSweep = endRadian - startRadian <= 180 ? `0` : `1`;

  const d = [
    `M`, start.x, start.y,
    `A`, radius, radius, 0, arcSweep, 0, end.x, end.y,
  ];

  //eslint-disable-next-line functional/immutable-data
  if (isFullCircle) d.push(`z`);

  return d.map(x => x.toString()).join(` `).trim();
};

/**
 * Calculates the distance between the centers of two arcs
 * @param a
 * @param b 
 * @returns Distance 
 */
export const distanceCenter = (a:ArcPositioned, b:ArcPositioned):number => Points.distance(a, b);

/**
 * Returns true if the two arcs have the same values
 *
 * @param a
 * @param b
 * @returns {boolean}
 */
export const isEquals = (a:Arc|ArcPositioned, b:Arc|ArcPositioned):boolean => {
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