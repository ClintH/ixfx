import type { Point } from "./points/Types.js";
import type { PolyLine, Line } from "./Line.js";
import type { RectPositioned } from "./Rect.js";

export type PointCalculableShape =
  | PolyLine
  | Line
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | RectPositioned
  | Point
  ;