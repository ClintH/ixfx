import * as Point from './Point.js';

// export enum RectCorner {
//   TopLeft = 0,
//   TopRight = 1,
//   BottomRight = 2,
//   BottomLeft = 3
// }

export type Rect = {
  readonly width: number,
  readonly height: number,
  readonly x: number,
  readonly y: number
}

export const fromCenter = function (origin: Point.Point, width: number, height: number): Rect {
  Point.guard(origin, 'origin');

  guardDim(width, 'width');
  guardDim(height, 'height');

  let halfW = width / 2;
  let halfH = height / 2;
  return {x: origin.x - halfW, y: origin.y - halfH, width: width, height: height};
  // let pts = [];
  // pts.push({x: origin.x - halfW, y: origin.y - halfH});
  // pts.push({x: origin.x + halfW, y: origin.y - halfH});
  // pts.push({x: origin.x + halfW, y: origin.y + halfH});
  // pts.push({x: origin.x - halfW, y: origin.y + halfH});
  //return rectFromPoints(...pts);
}

const guardDim = function (d: number, name: string = 'Dimension') {
  if (d === undefined) throw Error(`${name} is undefined`);
  if (isNaN(d)) throw Error(`${name} is NaN`);
  if (d < 0) throw Error(`${name} cannot be negative`);
}

export const guard = function (rect: Rect, name: string = 'Rect') {
  if (rect === undefined) throw Error(`{$name} undefined`);
  guardDim(rect.x, name + '.x');
  guardDim(rect.y, name + '.y');
  guardDim(rect.width, name + '.width');
  guardDim(rect.height, name + '.height');
}

export const fromTopLeft = function (origin: Point.Point, width: number, height: number): Rect {
  guardDim(width, 'width');
  guardDim(height, 'height');
  Point.guard(origin, 'origin');

  return {x: origin.x, y: origin.y, width: width, height: height};
  // let pts = [origin];
  // pts.push({x: origin.x + width, y: origin.y});
  // pts.push({x: origin.x + width, y: origin.y + height});
  // pts.push({x: origin.x, y: origin.y + height});
  // return rectFromPoints(...pts);
}

export const getCorners = function (rect: Rect): Point.Point[] {
  guard(rect);

  let pts = [{x: rect.x, y: rect.y}];
  pts.push({x: rect.x + rect.width, y: rect.y});
  pts.push({x: rect.x + rect.width, y: rect.y + rect.height});
  pts.push({x: rect.x, y: rect.y + rect.height});
  return pts;
}

export const getCenter = function (rect: Rect): Point.Point {
  guard(rect);


  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  }
}