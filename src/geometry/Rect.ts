import * as Points from './Point.js';
import * as Lines from './Line.js';

export type Rect = {
  readonly width: number,
  readonly height: number,
}
export type RectPositioned = Points.Point & Rect;

export const fromElement = (el:HTMLElement): Rect => ({width: el.clientWidth, height: el.clientHeight});

export const isEqual = (a:Rect, b:Rect):boolean => a.width === b.width && a.height === b.height;

export const fromCenter = (origin: Points.Point, width: number, height: number): RectPositioned => {
  Points.guard(origin, `origin`);

  guardDim(width, `width`);
  guardDim(height, `height`);

  const halfW = width / 2;
  const halfH = height / 2;
  return {x: origin.x - halfW, y: origin.y - halfH, width: width, height: height};
  // let pts = [];
  // pts.push({x: origin.x - halfW, y: origin.y - halfH});
  // pts.push({x: origin.x + halfW, y: origin.y - halfH});
  // pts.push({x: origin.x + halfW, y: origin.y + halfH});
  // pts.push({x: origin.x - halfW, y: origin.y + halfH});
  //return rectFromPoints(...pts);
};

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
  guardDim(rect.width, name + `.width`);
  guardDim(rect.height, name + `.height`);
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
