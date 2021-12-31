
import {Point} from './Point.js';
import * as Rects from './Rect.js';

export type Path = {
  length(): number
  compute(t: number): Point
  bbox(): Rects.Rect
  toString(): string
  toSvgString(): string
}

export const getStart = function (path: Path): Point {
  let p = path as any;
  if (p.a && p.b) return p.a as Point;
  throw Error('Cannot get start for path');
}

export const getEnd = function (path: Path): Point {
  let p = path as any;
  if (p.a && p.b) return p.b as Point;
  throw Error('Cannot get end for path');
}

export type WithBeziers = {
  getBeziers(): Path[]
}