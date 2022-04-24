import {Points, Lines} from './index.js';

export type Rect = {
  readonly width: number,
  readonly height: number,
}
export type RectPositioned = Points.Point & Rect;

export const empty = Object.freeze({width:0, height: 0});
export const emptyPositioned = Object.freeze({x:0, y:0, width:0, height: 0});

export const placeholder = Object.freeze({width: Number.NaN, height: Number.NaN});
export const placeholderPositioned = Object.freeze({x: Number.NaN, y:Number.NaN, width: Number.NaN, height: Number.NaN});

export const isEmpty = (rect:Rect):boolean => rect.width === 0 && rect.height === 0;
export const isPlaceholder = (rect:Rect):boolean => Number.isNaN(rect.width) && Number.isNaN(rect.height);
/**
 * Returns true if parameter has a positioned (x,y) 
 * @param p Point, Rect or RectPositiond
 * @returns 
 */
export const isPositioned = (p: Points.Point | Rect | RectPositioned): p is Points.Point => (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;

export const isRect = (p: number|unknown): p is Rect => {
  if (p === undefined) return false;
  if ((p as Rect).width === undefined) return false;
  if ((p as Rect).height === undefined) return false;
  return true;
};

/**
 * Returns true if `p` is a positioned rectangle
 * @param p 
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRectPositioned = (p:Rect|RectPositioned|any): p is RectPositioned => isRect(p) && isPositioned(p);

export const fromElement = (el:HTMLElement): Rect => ({width: el.clientWidth, height: el.clientHeight});

export const isEqualSize = (a:Rect, b:Rect):boolean => {
  if (a === undefined) throw new Error(`a undefined`);
  if (b === undefined) throw new Error(`b undefined`);
  return a.width === b.width && a.height === b.height;
};

export const isEqual = (a:Rect|RectPositioned, b:Rect|RectPositioned):boolean => {
  if (isPositioned(a) && isPositioned(b)) {
    if (!Points.equals(a, b)) return false;
    return a.width === b.width && a.height === b.height;

  } else if (!isPositioned(a) && !isPositioned(b)) {
    return a.width === b.width && a.height === b.height;
  } else {
    // One param is positioned, the other is not
    return false;
  }
};

/**
 * Subtracts width/height of `b` from `a` (ie: a - b), returning result.
 * 
 * x,y coords from `a` will be unchanged
 * @param a 
 * @param b 
 */
export function subtract (a:Rect, b:Rect):Rect;
/**
 * Subtracts a width/height from `a`, returning result.
 * 
 * x,y coords from a will be unchanged
 * @param a 
 * @param width 
 * @param height 
 */
export function subtract (a:Rect, width:number, height?:number):Rect;

/**
 * Subtracts width/height from `a`.
 * 
 * x,y coords from a will be unchanged.
 * @param a 
 * @param b 
 * @param c 
 * @returns 
 */
//eslint-disable-next-line func-style
export function subtract(a:Rect, b:Rect|number, c?:number):Rect {
  if (a === undefined) throw new Error(`First parameter undefined`);
  if (typeof b === `number`) {
    const height = c === undefined ? 0 : c;
    return Object.freeze({
      ...a,
      width: a.width - b,
      height: a.height - height
    });
  } else {
    return Object.freeze({
      ...a,
      width: a.width - b.width,
      height: a.height - b.height
    });
  }
}

/**
 * Returns true if `point` is within, or on boundary of `rect`.
 * @param rect 
 * @param point 
 */
export function intersectsPoint (rect:Rect|RectPositioned, point:Points.Point):boolean;
/**
 * Returns true if x,y coordinate is within, or on boundary of `rect`.
 * @param rect
 * @param x 
 * @param y 
 */
export function intersectsPoint (rect:Rect|RectPositioned, x:number, y:number):boolean;

/**
 * Returns true if point is within or on boundary of `rect`.
 * @param rect 
 * @param a 
 * @param b 
 * @returns 
 */
//eslint-disable-next-line func-style
export function intersectsPoint(rect:Rect|RectPositioned, a:Points.Point|number, b?:number):boolean {
  guard(rect, `rect`);
  //eslint-disable-next-line functional/no-let
  let x = 0;
  //eslint-disable-next-line functional/no-let
  let y = 0;
  if (typeof a === `number`) {
    if (b === undefined) throw new Error(`x and y coordinate needed`);
    x = a;
    y = b;
  } else {
    x = a.x;
    y = a.y;
  }
  if (isPositioned(rect)) {
    if (x - rect.x > rect.width || x < rect.x) return false;
    if (y - rect.y > rect.height || y < rect.y) return false;
  } else {
    // Assume 0,0
    if (x > rect.width || x < 0) return false;
    if (y > rect.height || y < 0) return false;
  }
  return true;
}

export const fromCenter = (origin: Points.Point, width: number, height: number): RectPositioned => {
  Points.guard(origin, `origin`);

  guardDim(width, `width`);
  guardDim(height, `height`);

  const halfW = width / 2;
  const halfH = height / 2;
  return {x: origin.x - halfW, y: origin.y - halfH, width: width, height: height};
};

/**
 * Returns the distance from the perimeter of `rect` to `pt`.
 * If the point is within the rectangle, 0 is returned.
 * 
 * If `rect` does not have an x,y it's assumed to be 0,0
 * @param rect Rectangle
 * @param pt Point
 * @returns Distance
 */
export const distanceFromExterior = (rect:RectPositioned, pt:Points.Point):number => {
  guardPositioned(rect, `rect`);
  Points.guard(pt, `pt`);
  if (intersectsPoint(rect, pt)) return 0;
  const dx = Math.max(rect.x - pt.x, 0, pt.x - rect.x + rect.width);
  const dy = Math.max(rect.y - pt.y, 0, pt.y - rect.y + rect.height);
  return Math.sqrt(dx*dx + dy*dy);
};

export const distanceFromCenter = (rect:RectPositioned, pt:Points.Point): number => Points.distance(getCenter(rect), pt);


/**
 * Returns a rectangle based on provided four corners.
 * 
 * To create a rectangle that contains an arbitary set of points, use {@links Points.bbox}.
 * 
 * Does some sanity checking such as:
 *  - x will be smallest of topLeft/bottomLeft
 *  - y will be smallest of topRight/topLeft
 *  - width will be largest between top/bottom left and right
 *  - height will be largest between left and right top/bottom
 */
export const maxFromCorners = (topLeft:Points.Point, topRight:Points.Point, bottomRight:Points.Point, bottomLeft: Points.Point):RectPositioned => {
  if (topLeft.y > bottomRight.y) throw new Error(`topLeft.y greater than bottomRight.y`);
  if (topLeft.y > bottomLeft.y) throw new Error(`topLeft.y greater than bottomLeft.y`);

  const w1  = topRight.x - topLeft.x;
  const w2 = bottomRight.x - bottomLeft.x;
  const h1 = Math.abs(bottomLeft.y - topLeft.y);
  const h2 = Math.abs(bottomRight.y - topRight.y);
  return {
    x: Math.min(topLeft.x, bottomLeft.x),
    y: Math.min(topRight.y, topLeft.y),
    width: Math.max(w1, w2),
    height: Math.max(h1, h2) 
  };
};

const guardDim = (d: number, name: string = `Dimension`) => {
  if (d === undefined) throw Error(`${name} is undefined`);
  if (isNaN(d)) throw Error(`${name} is NaN`);
  if (d < 0) throw Error(`${name} cannot be negative`);
};

export const guard = (rect: Rect, name: string = `rect`) => {
  if (rect === undefined) throw Error(`{$name} undefined`);
  if (isPositioned(rect)) Points.guard(rect, name);
  guardDim(rect.width, name + `.width`);
  guardDim(rect.height, name + `.height`);
};

const guardPositioned = (rect:RectPositioned, name:string = `rect`) => {
  if (!isPositioned(rect)) throw new Error(`Expected ${name} to have x,y`);
  guard(rect, name);
};

export const fromTopLeft = (origin: Points.Point, width: number, height: number): RectPositioned => {
  guardDim(width, `width`);
  guardDim(height, `height`);
  Points.guard(origin, `origin`);

  return {x: origin.x, y: origin.y, width: width, height: height};
  // let pts = [origin];
  // pts.push({x: origin.x + width, y: origin.y});
  // pts.push({x: origin.x + width, y: origin.y + height});
  // pts.push({x: origin.x, y: origin.y + height});
  // return rectFromPoints(...pts);
};

export const getCorners = (rect: RectPositioned|Rect, origin?:Points.Point): readonly Points.Point[] => {
  guard(rect);
  if (origin === undefined && Points.isPoint(rect)) origin = rect;
  else if (origin === undefined) throw new Error(`Unpositioned rect needs origin param`);

  return [
    {x: origin.x, y: origin.y},
    {x: origin.x + rect.width, y: origin.y},
    {x: origin.x + rect.width, y: origin.y + rect.height},
    {x: origin.x, y: origin.y + rect.height}
  ];
};

export const getCenter = (rect: RectPositioned|Rect, origin?:Points.Point): Points.Point => {
  guard(rect);
  if (origin === undefined && Points.isPoint(rect)) origin = rect;
  else if (origin === undefined) throw new Error(`Unpositioned rect needs origin param`);

  return {
    x: origin.x + rect.width / 2,
    y: origin.y + rect.height / 2
  };
};

/**
 * Returns four lines based on each corner.
 * Lines are given in order: top, right, bottom, left
 *
 * @param {(RectPositioned|Rect)} rect
 * @param {Points.Point} [origin]
 * @returns {Lines.Line[]}
 */
export const getLines = (rect: RectPositioned|Rect, origin?:Points.Point): readonly Lines.Line[] => Lines.joinPointsToLines(...getCorners(rect, origin));
