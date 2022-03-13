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

/**
 * Produces an Archimedean spiral
 * 
 * 
 * This is a generator:
 * ```
 * const s = spiral(0.1, 1);
 * for (const coord of s) {
 *  // Use Polar coord...
 *  if (coord.step === 1000) break; // Stop after 1000 iterations
 * }
 * ```
 * 
 * @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
 * @param zoom At smoothness 0.1, zoom starting at 1 is OK
 */
//eslint-disable-next-line func-style
export function* spiral(smoothness:number, zoom:number): IterableIterator<Coord & {readonly step:number}> {
  //eslint-disable-next-line functional/no-let
  let step = 0;
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    //eslint-disable-next-line functional/no-let
    const a = smoothness * step++;
    yield {
      distance: zoom * a,
      angleRadian: a,
      step: step
    };
  }
}

/**
 * Produces an Archimedian spiral with manual stepping.
 * @param step Step number. Typically 0, 1, 2 ...
 * @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
 * @param zoom At smoothness 0.1, zoom starting at 1 is OK
 * @returns 
 */
export const spiralRaw = (step:number, smoothness:number, zoom:number):Coord => {
  const a = smoothness * step;
  return {
    distance: zoom * a,
    angleRadian: a
  };
};

const polarToCartesian = (distance:number, angleRadians:number, origin:Points.Point):Points.Point => {
  Points.guard(origin);
  return {
    x: origin.x + (distance * Math.cos(angleRadians)),
    y: origin.y + (distance * Math.sin(angleRadians)),
  };
};


