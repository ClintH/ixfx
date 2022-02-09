import * as Points from "./Point.js";

export type Coord = {
  readonly distance: number,
  readonly angleRadian: number
}

type ToCartesian = {
  (point:Coord, origin?:Points.Point) :Points.Point
  (distance:number, angleRadians:number, origin?:Points.Point) :Points.Point
}

export const isCoord = (p: number|unknown): p is Coord => {
  if ((p as Coord).distance === undefined) return false;
  if ((p as Coord).angleRadian === undefined) return false;
  return true;
};

export const fromCartesian = (point: Points.Point, origin: Points.Point): Coord => {
  point = Points.subtract(point, origin);
  //eslint-disable-next-line functional/no-let
  let a =  Math.atan2(point.y, point.x);
  if (a < 0) a = Math.abs(a);
  else a = Math.PI + (Math.PI - a);

  return {
    angleRadian: a,
    distance: Math.sqrt(point.x * point.x + point.y * point.y)
  };
};

export const toCartesian:ToCartesian = (a:Coord|number, b?:Points.Point|number, c?:Points.Point): Points.Point => {
  if (isCoord(a)) {
    if (b === undefined) b = Points.Empty;
    if (!Points.isPoint(b)) throw new Error(`Expecting (Coord, Point). Point param wrong type.`);
    return polarToCartesian(a.distance, a.angleRadian, b);
  } else {
    if (typeof a === `number` && typeof b === `number`) {
      if (c === undefined) c = Points.Empty;
      if (!Points.isPoint(c)) throw new Error(`Expecting (number, number, Point). Point param wrong type`);
      return polarToCartesian(a, b, c);
    } else {
      throw new Error(`Expecting (number, number)`);
    }
  }
};
  
const polarToCartesian = (distance:number, angleRadians:number, origin:Points.Point):Points.Point => {
  Points.guard(origin);
  return {
    x: origin.x + (distance * Math.cos(angleRadians)),
    y: origin.y + (distance * Math.sin(angleRadians)),
  };
};


