import {Point} from './Point.js';

export enum RectCorner {
  TopLeft = 0,
  TopRight = 1,
  BottomRight = 2,
  BottomLeft = 3
}

export type Rect = {
  readonly width: number,
  readonly height: number,
  readonly corners: Point[]
}

// Assumes coordinates top-left, clockwise
export const rectFromPoints = function (...pts: Point[]): Rect {
  if (pts.length != 4) throw Error('Expected four points');

  const width = Math.abs(pts[RectCorner.BottomRight].x - pts[RectCorner.BottomLeft].x);
  const height = Math.abs(pts[RectCorner.BottomLeft].y - pts[RectCorner.TopLeft].y);

  pts = pts.map(p => Object.freeze(p));

  return Object.freeze({
    width: width,
    height: height,
    corners: pts
  });
}

export const fromCenter = function (origin: Point, width: number, height: number): Rect {
  guardDim(width, 'width');
  guardDim(height, 'height');

  let halfW = width / 2;
  let halfH = height / 2;
  let pts = [];
  pts.push({x: origin.x - halfW, y: origin.y - halfH});
  pts.push({x: origin.x + halfW, y: origin.y - halfH});
  pts.push({x: origin.x + halfW, y: origin.y + halfH});
  pts.push({x: origin.x - halfW, y: origin.y + halfH});
  return rectFromPoints(...pts);
}

const guardDim = function (d: number, name: string = 'Dimension') {
  if (isNaN(d)) throw Error(`${name} is NaN`);
  if (d < 0) throw Error(`${name} cannot be negative`);
}

export const fromTopLeft = function (origin: Point, width: number, height: number): Rect {
  guardDim(width, 'width');
  guardDim(height, 'height');

  let pts = [origin];
  pts.push({x: origin.x + width, y: origin.y});
  pts.push({x: origin.x + width, y: origin.y + height});
  pts.push({x: origin.x, y: origin.y + height});
  return rectFromPoints(...pts);
}