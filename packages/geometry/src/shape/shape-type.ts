import type { CirclePositioned } from "../circle/circle-type.js";
import type { Line, PolyLine } from "../line/line-type.js";
import type { Point, Point3d } from "../point/point-type.js";
import type { RectPositioned } from "../rect/rect-types.js";

export type ShapePositioned = CirclePositioned | RectPositioned;
export type ContainsResult = `none` | `contained`;

export type Sphere = Point3d & {
  readonly radius: number;
};

export type PointCalculableShape =
  | PolyLine
  | Line

  | RectPositioned
  | Point
  | CirclePositioned
  ;