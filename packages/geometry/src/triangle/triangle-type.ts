import type { Point } from "../point/point-type.js";

export type Triangle = {
  readonly a: Point;
  readonly b: Point;
  readonly c: Point;
};

export type BarycentricCoord = {
  readonly a: number;
  readonly b: number;
  readonly c: number;
};