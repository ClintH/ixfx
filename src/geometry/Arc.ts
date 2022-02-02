import * as MathUtil from './Math.js';
import {guard as guardPoint} from './Point.js';
import {Path} from './Path.js';
import {Lines, Points, Rects} from './index.js';
export const isArc = (p: Arc|number): p is Arc => (p as Arc).startRadian !== undefined && (p as Arc).endRadian !== undefined;

//const isArc = (p: Circle | Arc): p is Arc => (p as Arc).startRadian !== undefined && (p as Arc).endRadian !== undefined;
export const isPositioned = (p: Points.Point | Arc| ArcPositioned): p is Points.Point => (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;
//export const isPositioned = (p: Circle | Points.Point | Arc| ArcPositioned): p is Points.Point => (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;

export type Arc = {
  readonly radius:number
  readonly startRadian:number
  readonly endRadian:number
  readonly counterClockwise?:boolean
}

export type ArcPositioned = Points.Point & Arc;

const piPi = Math.PI *2;

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
 * Returns a Line from start to end point of arc
 *
 * @param {ArcPositioned} arc
 * @returns {Lines.Line}
 */
export const toLine = (arc:ArcPositioned):Lines.Line => Lines.fromPoints(
  pointOnArc(arc, arc.startRadian),
  pointOnArc(arc, arc.endRadian)
);

/**
 * Calculates a coordinate on an arc, based on an angle
 * @param arc Arc
 * @param angleRadian Angle of desired coordinate 
 * @param origin Origin of arc (0,0 used by default)
 * @returns Coordinate
 */
export const pointOnArc = (arc:Arc|ArcPositioned, angleRadian:number, origin?:Points.Point): Points.Point => {
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

// const guard = (circleOrArc:CirclePositioned|Circle|Arc|ArcPositioned) => {
//   if (isPositioned(circleOrArc)) {
//     guardPoint(circleOrArc, `circleOrArc`);
//   }

//   if (Number.isNaN(circleOrArc.radius)) throw new Error(`Radius is NaN`);
//   if (circleOrArc.radius <= 0) throw new Error(`Radius must be greater than zero`);

//   if (isArc(circleOrArc)) {
//     if(circleOrArc.startRadian >= circleOrArc.endRadian) throw new Error(`startRadian is expected to be les than endRadian`);  
//   }
// };

export const compute = (arc:ArcPositioned|Arc, t:number, origin?:Points.Point):Points.Point => {
  guard(arc);
  return pointOnArc(arc, arc.startRadian + ((arc.endRadian-arc.startRadian)*t), origin);
};

// export const compute = (circleOrArc:ArcPositioned|CirclePositioned, t:number):Points.Point => {
//   if (isArc(circleOrArc)) {
//     return pointOnArc(circleOrArc, circleOrArc.startRadian + ((circleOrArc.endRadian-circleOrArc.startRadian)*t));
//   } else if (isCircle(circleOrArc)) {
//     return pointOnCircle(circleOrArc, t*PIPI);
//   } else throw new Error(`Parameter invalid`);
// };

export const arcToPath = (arc:ArcPositioned): Path => {
  guard(arc);

  return Object.freeze({
    ...arc,
    compute:(t:number) => compute(arc, t),
    bbox:() => bbox(arc) as Rects.RectPositioned,
    length: () => length(arc),
    toSvgString:() => `blerg`,
    kind: `arc`
  });
};

// export const length = (circleOrArc:Circle|Arc):number => {
//   if (isArc(circleOrArc)) {
//     return PIPI*circleOrArc.radius*((circleOrArc.startRadian-circleOrArc.endRadian)/PIPI);
//   } else if (isCircle(circleOrArc)) {
//     return PIPI*circleOrArc.radius;
//   } else throw new Error(`Invalid parameter`);
// };

export const length = (arc:Arc):number =>  piPi*arc.radius*((arc.startRadian-arc.endRadian)/piPi);

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


// export const bbox = (circleOrArc:CirclePositioned|ArcPositioned):Rects.RectPositioned => {
//   if (isArc(circleOrArc)) {
//     const middle = compute(circleOrArc, 0.5);
//     const asLine = toLine(circleOrArc);
//     return Points.bbox(middle, asLine.a, asLine.b);
//   } else if (isCircle(circleOrArc)) {
//     return Rects.fromCenter(circleOrArc, circleOrArc.radius*2, circleOrArc.radius*2);
//   } else {
//     throw new Error(`Invalid parameter`);
//   }
// };

export const toSvg = (origin:Points.Point, radiusOrArc:number|Arc, startAngle?:number, endAngle?:number) => {
  if (isArc(radiusOrArc)) return toSvgFull(origin, radiusOrArc.radius, radiusOrArc.startRadian, radiusOrArc.endRadian);
  if (startAngle === undefined) throw new Error(`startAngle undefined`);
  if (endAngle === undefined) throw new Error(`endAngle undefined`);
  return toSvgFull(origin, radiusOrArc, startAngle, endAngle);
};

const toSvgFull = (origin:Points.Point, radius:number, startAngle:number, endAngle:number) => {
  const isFullCircle = endAngle - startAngle === 360;
  const start = MathUtil.polarToCartesian(origin, radius, endAngle - 0.01);
  const end = MathUtil.polarToCartesian(origin, radius, startAngle);
  const arcSweep = endAngle - startAngle <= 180 ? `0` : `1`;

  const d = [
    `M`, start.x, start.y,
    `A`, radius, radius, 0, arcSweep, 0, end.x, end.y,
  ];

  //eslint-disable-next-line functional/immutable-data
  if (isFullCircle) d.push(`z`);

  return d.map(x => x.toString()).join(` `).trim();
};

//export const distanceCenter = (a:CirclePositioned|ArcPositioned, b:CirclePositioned|ArcPositioned):number => Points.distance(a, b);
export const distanceCenter = (a:ArcPositioned, b:ArcPositioned):number => Points.distance(a, b);

/**
 * Returns true if the two objects have the same values
 *
 * @param {CirclePositioned} a
 * @param {CirclePositioned} b
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

