import { isPoint } from "../point/guard.js";
import { guard } from "./Guard.js";
import type { Rect, RectPositioned } from "./rect-types.js";
import { joinPointsToLines as LinesJoinPointsToLines } from '../line/join-points-to-lines.js';

import type { Point } from '../point/point-type.js';
import { corners } from "./Corners.js";
import type { Line } from "../line/line-type.js";

/**
 * Returns four lines based on each corner.
 * Lines are given in order: top, right, bottom, left
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * // Yields: array of length four
 * const lines = Rects.lines(rect);
 * ```
 *
 * @param {(RectPositioned|Rect)} rect
 * @param {Points.Point} [origin]
 * @returns {Lines.Line[]}
 */
export const edges = (
  rect: RectPositioned | Rect,
  origin?: Point
): ReadonlyArray<Line> => {
  const c = corners(rect, origin);

  // Connect all the corners, back to first corner again
  return LinesJoinPointsToLines(...c, c[ 0 ]);
};

/**
 * Returns a point on the edge of rectangle
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const r1 = {x: 10, y: 10, width: 100, height: 50};
 * Rects.getEdgeX(r1, `right`);  // Yields: 110
 * Rects.getEdgeX(r1, `bottom`); // Yields: 10
 *
 * const r2 = {width: 100, height: 50};
 * Rects.getEdgeX(r2, `right`);  // Yields: 100
 * Rects.getEdgeX(r2, `bottom`); // Yields: 0
 * ```
 * @param rect
 * @param edge Which edge: right, left, bottom, top
 * @returns
 */
export const getEdgeX = (
  rect: RectPositioned | Rect,
  edge: `right` | `bottom` | `left` | `top`
): number => {
  guard(rect);
  switch (edge) {
    case `top`: {
      return isPoint(rect) ? rect.x : 0;
    }
    case `bottom`: {
      return isPoint(rect) ? rect.x : 0;
    }
    case `left`: {
      return isPoint(rect) ? rect.y : 0;
    }
    case `right`: {
      return isPoint(rect) ? rect.x + rect.width : rect.width;
    }
  }
};

/**
 * Returns a point on the edge of rectangle
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const r1 = {x: 10, y: 10, width: 100, height: 50};
 * Rects.getEdgeY(r1, `right`);  // Yields: 10
 * Rects.getEdgeY(r1, `bottom`); // Yields: 60
 *
 * const r2 = {width: 100, height: 50};
 * Rects.getEdgeY(r2, `right`);  // Yields: 0
 * Rects.getEdgeY(r2, `bottom`); // Yields: 50
 * ```
 * @param rect
 * @param edge Which edge: right, left, bottom, top
 * @returns
 */
export const getEdgeY = (
  rect: RectPositioned | Rect,
  edge: `right` | `bottom` | `left` | `top`
): number => {
  guard(rect);
  switch (edge) {
    case `top`: {
      return (isPoint(rect) ? rect.y : 0);
    }
    case `bottom`: {
      return isPoint(rect) ? rect.y + rect.height : rect.height;
    }
    case `left`: {
      return isPoint(rect) ? rect.y : 0;
    }
    case `right`: {
      return isPoint(rect) ? rect.y : 0;
    }
  }
};