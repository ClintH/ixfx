import { Points, Lines } from './index.js';
import { type RandomSource, defaultRandom } from '../Random.js';
import { type CirclePositioned, isCirclePositioned } from './Circle.js';
import * as Intersects from './Intersects.js';
import type { CardinalDirection } from './Grid.js';
import type { PointCalculableShape } from './Point.js';

export type Rect = {
  readonly width: number;
  readonly height: number;
};
export type RectPositioned = Points.Point & Rect;

export const empty = Object.freeze({ width: 0, height: 0 });
export const emptyPositioned = Object.freeze({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

export const placeholder = Object.freeze({
  width: Number.NaN,
  height: Number.NaN,
});
export const placeholderPositioned = Object.freeze({
  x: Number.NaN,
  y: Number.NaN,
  width: Number.NaN,
  height: Number.NaN,
});

export const isEmpty = (rect: Rect): boolean =>
  rect.width === 0 && rect.height === 0;
export const isPlaceholder = (rect: Rect): boolean =>
  Number.isNaN(rect.width) && Number.isNaN(rect.height);

/**
 * Returns _true_ if `p` has a position (x,y)
 * @param p Point, Rect or RectPositiond
 * @returns
 */
export const isPositioned = (
  p: Points.Point | Rect | RectPositioned
): p is Points.Point =>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;

/**
 * Returns _true_ if `p` has width and height.
 * @param p
 * @returns
 */
export const isRect = (p: unknown): p is Rect => {
  if (p === undefined) return false;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if ((p as Rect).width === undefined) return false;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if ((p as Rect).height === undefined) return false;
  return true;
};

/**
 * Returns _true_ if `p` is a positioned rectangle
 * Having width, height, x and y properties.
 * @param p
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRectPositioned = (
  p: Rect | RectPositioned | PointCalculableShape
): p is RectPositioned => isRect(p) && isPositioned(p);

/**
 * Initialise a rectangle based on the width and height of a HTML element.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js"
 * Rects.fromElement(document.querySelector(`body`));
 * ```
 * @param el
 * @returns
 */
export const fromElement = (el: HTMLElement): Rect => ({
  width: el.clientWidth,
  height: el.clientHeight,
});

/**
 * Returns _true_ if the width & height of the two rectangles is the same.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 10, height: 10, x: 10, y: 10 };
 * const rectB = { width: 10, height: 10, x: 20, y: 20 };
 *
 * // True, even though x,y are different
 * Rects.isEqualSize(rectA, rectB);
 *
 * // False, because coordinates are different
 * Rects.isEqual(rectA, rectB)
 * ```
 * @param a
 * @param b
 * @returns
 */
export const isEqualSize = (a: Rect, b: Rect): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (a === undefined) throw new Error(`a undefined`);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (b === undefined) throw new Error(`b undefined`);
  return a.width === b.width && a.height === b.height;
};

/**
 * Returns a rectangle from width, height
 * ```js
 * const r = Rects.fromNumbers(100, 200);
 * // {width: 100, height: 200}
 * ```
 *
 * Use {@link toArray} for the opposite conversion.
 *
 * @param width
 * @param height
 */
export function fromNumbers(width: number, height: number): Rect;

/**
 * Returns a rectangle from x,y,width,height
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const r = Rects.fromNumbers(10, 20, 100, 200);
 * // {x: 10, y: 20, width: 100, height: 200}
 * ```
 *
 * Use the spread operator (...) if the source is an array:
 * ```js
 * const r3 = Rects.fromNumbers(...[10, 20, 100, 200]);
 * ```
 *
 * Use {@link toArray} for the opposite conversion.
 *
 * @param x
 * @param y
 * @param width
 * @param height
 */
export function fromNumbers(
  x: number,
  y: number,
  width: number,
  height: number
): RectPositioned;

/**
 * Returns a rectangle from a series of numbers: x, y, width, height OR width, height
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const r1 = Rects.fromNumbers(100, 200);
 * // {width: 100, height: 200}
 *
 * const r2 = Rects.fromNumbers(10, 20, 100, 200);
 * // {x: 10, y: 20, width: 100, height: 200}
 * ```
 * Use the spread operator (...) if the source is an array:
 *
 * ```js
 * const r3 = Rects.fromNumbers(...[10, 20, 100, 200]);
 * ```
 *
 * Use {@link toArray} for the opposite conversion.
 *
 * @see toArray
 * @param xOrWidth
 * @param yOrHeight
 * @param width
 * @param height
 * @returns
 */
//eslint-disable-next-line func-style
export function fromNumbers(
  xOrWidth: number,
  yOrHeight: number,
  width?: number,
  height?: number
): Rect | RectPositioned {
  if (width === undefined || height === undefined) {
    if (typeof xOrWidth !== `number`) throw new Error(`width is not an number`);
    if (typeof yOrHeight !== `number`) {
      throw new TypeError(`height is not an number`);
    }
    return Object.freeze({ width: xOrWidth, height: yOrHeight });
  }
  if (typeof xOrWidth !== `number`) throw new Error(`x is not an number`);
  if (typeof yOrHeight !== `number`) throw new Error(`y is not an number`);
  if (typeof width !== `number`) throw new Error(`width is not an number`);
  if (typeof height !== `number`) throw new Error(`height is not an number`);

  return Object.freeze({ x: xOrWidth, y: yOrHeight, width, height });
}

/**
 * Rectangle as array: `[width, height]`
 */
export type RectArray = readonly [ width: number, height: number ];

/**
 * Positioned rectangle as array: `[x, y, width, height]`
 */
export type RectPositionedArray = readonly [
  x: number,
  y: number,
  width: number,
  height: number
];

/**
 * Converts a rectangle to an array of numbers. See {@link fromNumbers} for the opposite conversion.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const r1 = Rects.toArray({ x: 10, y:20, width: 100, height: 200 });
 * // [10, 20, 100, 200]
 * const r2 = Rects.toArray({ width: 100, height: 200 });
 * // [100, 200]
 * ```
 * @param rect
 * @see fromNumbers
 */
export function toArray(rect: Rect): RectArray;

/**
 * Converts a rectangle to an array of numbers. See {@link fromNumbers} for the opposite conversion.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const r1 = Rects.toArray({ x: 10, y:20, width: 100, height: 200 });
 * // [10, 20, 100, 200]
 * const r2 = Rects.toArray({ width: 100, height: 200 });
 * // [100, 200]
 * ```
 * @param rect
 * @see fromNumbers
 */
export function toArray(rect: RectPositioned): RectPositionedArray;

/**
 * Converts a rectangle to an array of numbers. See {@link fromNumbers} for the opposite conversion.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const r1 = Rects.toArray({ x: 10, y:20, width: 100, height: 200 });
 * // [10, 20, 100, 200]
 * const r2 = Rects.toArray({ width: 100, height: 200 });
 * // [100, 200]
 * ```
 * @param rect
 * @see fromNumbers
 */
// eslint-disable-next-line func-style
export function toArray(
  rect: Rect | RectPositioned
): RectArray | RectPositionedArray {
  if (isPositioned(rect)) {
    return [ rect.x, rect.y, rect.width, rect.height ];
  } else if (isRect(rect)) {
    return [ rect.width, rect.height ];
  } else {
    throw new Error(
      `rect param is not a rectangle. Got: ${ JSON.stringify(rect) }`
    );
  }
}

/**
 * Returns _true_ if two rectangles have identical values.
 * Both rectangles must be positioned or not.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 10, height: 10, x: 10, y: 10 };
 * const rectB = { width: 10, height: 10, x: 20, y: 20 };
 *
 * // False, because coordinates are different
 * Rects.isEqual(rectA, rectB)
 *
 * // True, even though x,y are different
 * Rects.isEqualSize(rectA, rectB);
 * ```
 * @param a
 * @param b
 * @returns
 */
export const isEqual = (
  a: Rect | RectPositioned,
  b: Rect | RectPositioned
): boolean => {
  if (isPositioned(a) && isPositioned(b)) {
    if (!Points.isEqual(a, b)) return false;
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
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 100, height: 100 };
 * const rectB = { width: 200, height: 200 };
 *
 * // Yields: { width: -100, height: -100 }
 * Rects.subtract(rectA, rectB);
 * ```
 * @param a
 * @param b
 */
export function subtract(a: Rect, b: Rect): Rect;
/**
 * Subtracts a width/height from `a`, returning result.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100 };
 *
 * // Yields: { width: -100, height: -100 }
 * Rects.subtract(rect, 200, 200);
 * ```
 * @param a
 * @param width
 * @param height
 */
export function subtract(a: Rect, width: number, height?: number): Rect;

/**
 * Subtracts width/height from `a`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 100, height: 100 };
 * const rectB = { width: 200, height: 200 };
 *
 * // Yields: { width: -100, height: -100 }
 * Rects.subtract(rectA, rectB);
 * Rects.subtract(rectA, 200, 200);
 * ```
 * @param a
 * @param b
 * @param c
 * @returns
 */
//eslint-disable-next-line func-style
export function subtract(a: Rect | undefined, b: Rect | number, c?: number): Rect {
  if (a === undefined) throw new Error(`First parameter undefined`);
  if (typeof b === `number`) {
    const height = c ?? 0;
    return Object.freeze({
      ...a,
      width: a.width - b,
      height: a.height - height,
    });
  } else {
    return Object.freeze({
      ...a,
      width: a.width - b.width,
      height: a.height - b.height,
    });
  }
}

/**
 * Sums width/height of `b` with `a` (ie: a + b), returning result.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 100, height: 100 };
 * const rectB = { width: 200, height: 200 };
 *
 * // Yields: { width: 300, height: 300 }
 * Rects.sum(rectA, rectB);
 * ```
 * @param a
 * @param b
 */
export function sum(a: Rect, b: Rect): Rect;
/**
 * Sums width/height of `b` with `a` (ie: a + b), returning result.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100 };
 *
 * // Yields: { width: 300, height: 300 }
 * Rects.subtract(rect, 200, 200);
 * ```
 * @param a
 * @param width
 * @param height
 */
export function sum(a: Rect, width: number, height?: number): Rect;

/**
 * Sums width/height of `b` with `a` (ie: a + b), returning result.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 100, height: 100 };
 * const rectB = { width: 200, height: 200 };
 *
 * // Yields: { width: 300, height: 300 }
 * Rects.sum(rectA, rectB);
 * Rects.sum(rectA, 200, 200);
 * ```
 * @param a
 * @param b
 * @param c
 * @returns
 */
//eslint-disable-next-line func-style
export function sum(a: Rect, b: Rect | number, c?: number): Rect {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (a === undefined) throw new Error(`First parameter undefined`);
  if (typeof b === `number`) {
    const height = c ?? 0;
    return Object.freeze({
      ...a,
      width: a.width + b,
      height: a.height + height,
    });
  } else {
    return Object.freeze({
      ...a,
      width: a.width + b.width,
      height: a.height + b.height,
    });
  }
}

/**
 * Returns _true_ if `point` is within, or on boundary of `rect`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * Rects.intersectsPoint(rect, { x: 100, y: 100});
 * ```
 * @param rect
 * @param point
 */
export function intersectsPoint(
  rect: Rect | RectPositioned,
  point: Points.Point
): boolean;

/**
 * Returns true if x,y coordinate is within, or on boundary of `rect`.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * Rects.intersectsPoint(rect, 100, 100);
 * ```
 * @param rect
 * @param x
 * @param y
 */
export function intersectsPoint(
  rect: Rect | RectPositioned,
  x: number,
  y: number
): boolean;

/**
 * Returns true if point is within or on boundary of `rect`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * Rects.intersectsPoint(rect, { x: 100, y: 100});
 * Rects.intersectsPoint(rect, 100, 100);
 * ```
 * @param rect
 * @param a
 * @param b
 * @returns
 */
//eslint-disable-next-line func-style
export function intersectsPoint(
  rect: Rect | RectPositioned,
  a: Points.Point | number,
  b?: number
): boolean {
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

/**
 * Initialises a rectangle based on its center, a width and height
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Rectangle with center at 50,50, width 100 height 200
 * Rects.fromCenter({x: 50, y:50}, 100, 200);
 * ```
 * @param origin
 * @param width
 * @param height
 * @returns
 */
export const fromCenter = (
  origin: Points.Point,
  width: number,
  height: number
): RectPositioned => {
  Points.guard(origin, `origin`);

  guardDim(width, `width`);
  guardDim(height, `height`);

  const halfW = width / 2;
  const halfH = height / 2;
  return {
    x: origin.x - halfW,
    y: origin.y - halfH,
    width: width,
    height: height,
  };
};

/**
 * Returns the distance from the perimeter of `rect` to `pt`.
 * If the point is within the rectangle, 0 is returned.
 *
 * If `rect` does not have an x,y it's assumed to be 0,0
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 0, y: 0 };
 * Rects.distanceFromExterior(rect, { x: 20, y: 20 });
 * ```
 * @param rect Rectangle
 * @param pt Point
 * @returns Distance
 */
export const distanceFromExterior = (
  rect: RectPositioned,
  pt: Points.Point
): number => {
  guardPositioned(rect, `rect`);
  Points.guard(pt, `pt`);
  if (intersectsPoint(rect, pt)) return 0;
  const dx = Math.max(rect.x - pt.x, 0, pt.x - rect.x + rect.width);
  const dy = Math.max(rect.y - pt.y, 0, pt.y - rect.y + rect.height);
  return Math.hypot(dx, dy);
};

/**
 * Return the distance of `pt` to the center of `rect`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 0, y: 0 };
 * Rects.distanceFromCenter(rect, { x: 20, y: 20 });
 * ```
 * @param rect
 * @param pt
 * @returns
 */
export const distanceFromCenter = (
  rect: RectPositioned,
  pt: Points.Point
): number => Points.distance(center(rect), pt);

/**
 * Returns a rectangle based on provided four corners.
 *
 * To create a rectangle that contains an arbitary set of points, use {@link Geometry.Points.bbox | Geometry.Points.bbox}.
 *
 * Does some sanity checking such as:
 *  - x will be smallest of topLeft/bottomLeft
 *  - y will be smallest of topRight/topLeft
 *  - width will be largest between top/bottom left and right
 *  - height will be largest between left and right top/bottom
 *
 */
export const maxFromCorners = (
  topLeft: Points.Point,
  topRight: Points.Point,
  bottomRight: Points.Point,
  bottomLeft: Points.Point
): RectPositioned => {
  if (topLeft.y > bottomRight.y) {
    throw new Error(`topLeft.y greater than bottomRight.y`);
  }
  if (topLeft.y > bottomLeft.y) {
    throw new Error(`topLeft.y greater than bottomLeft.y`);
  }

  const w1 = topRight.x - topLeft.x;
  const w2 = bottomRight.x - bottomLeft.x;
  const h1 = Math.abs(bottomLeft.y - topLeft.y);
  const h2 = Math.abs(bottomRight.y - topRight.y);
  return {
    x: Math.min(topLeft.x, bottomLeft.x),
    y: Math.min(topRight.y, topLeft.y),
    width: Math.max(w1, w2),
    height: Math.max(h1, h2),
  };
};

const guardDim = (d: number, name = `Dimension`) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (d === undefined) throw new Error(`${ name } is undefined`);
  if (Number.isNaN(d)) throw new Error(`${ name } is NaN`);
  if (d < 0) throw new Error(`${ name } cannot be negative`);
};

/**
 * Throws an error if rectangle is missing fields or they
 * are not valid.
 * @param rect
 * @param name
 */
export const guard = (rect: Rect, name = `rect`) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (rect === undefined) throw new Error(`{$name} undefined`);
  if (isPositioned(rect)) Points.guard(rect, name);
  guardDim(rect.width, name + `.width`);
  guardDim(rect.height, name + `.height`);
};

/**
 * Clamps `value` so it does not exceed `maximum`
 * on either dimension. x,y are ignored.
 * 
 * ```js
 * clamp({ width:100, height:5 }, { width:10, height:10 }); // { width:10, height:5 }
 * 
 * clamp({ width:10, height:10 }, { width:10, height:10 }); // { width:10, height:10 }
 * ```
 * 
 * Any existing data on `value` is copied to output.
 * @param value Input rectangle
 * @param maximum Maximum allowed size
 */
export const clamp = (value: Rect, maximum: Rect): Rect => {
  return Object.freeze({
    ...value,
    width: Math.min(value.width, maximum.width),
    height: Math.min(value.height, maximum.height)
  });
}

const guardPositioned = (rect: RectPositioned, name = `rect`) => {
  if (!isPositioned(rect)) throw new Error(`Expected ${ name } to have x,y`);
  guard(rect, name);
};

/**
 * Creates a rectangle from its top-left coordinate, a width and height.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Rectangle at 50,50 with width of 100, height of 200.
 * const rect = Rects.fromTopLeft({ x: 50, y:50 }, 100, 200);
 * ```
 * @param origin
 * @param width
 * @param height
 * @returns
 */
export const fromTopLeft = (
  origin: Points.Point,
  width: number,
  height: number
): RectPositioned => {
  guardDim(width, `width`);
  guardDim(height, `height`);
  Points.guard(origin, `origin`);

  return { x: origin.x, y: origin.y, width: width, height: height };
};

/**
 * Returns the four corners of a rectangle as an array of Points.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 0, y: 0};
 * const pts = Rects.corners(rect);
 * ```
 *
 * If the rectangle is not positioned, is origin can be provided.
 * @param rect
 * @param origin
 * @returns
 */
export const corners = (
  rect: RectPositioned | Rect,
  origin?: Points.Point
): ReadonlyArray<Points.Point> => {
  guard(rect);
  if (origin === undefined && Points.isPoint(rect)) origin = rect;
  else if (origin === undefined) {
    throw new Error(`Unpositioned rect needs origin param`);
  }

  return [
    { x: origin.x, y: origin.y },
    { x: origin.x + rect.width, y: origin.y },
    { x: origin.x + rect.width, y: origin.y + rect.height },
    { x: origin.x, y: origin.y + rect.height },
  ];
};

/**
 * Returns a point on cardinal direction, or 'center' for the middle.
 *
 * ```js
 * cardinal({x: 10, y:10, width:100, height: 20}, 'center');
 * ```
 * @param rect Rectangle
 * @param card Cardinal direction or 'center'
 * @returns Point
 */
export const cardinal = (
  rect: RectPositioned,
  card: CardinalDirection | `center`
): Points.Point => {
  const { x, y, width, height } = rect;
  switch (card) {
    case `nw`: {
      return Object.freeze({ x, y });
    }
    case `n`: {
      return Object.freeze({
        x: x + width / 2,
        y,
      });
    }
    case `ne`: {
      return Object.freeze({
        x: x + width,
        y,
      });
    }
    case `sw`: {
      return Object.freeze({ x, y: y + height });
    }
    case `s`: {
      return Object.freeze({
        x: x + width / 2,
        y: y + height,
      });
    }
    case `se`: {
      return Object.freeze({
        x: x + width,
        y: y + height,
      });
    }
    case `w`: {
      return Object.freeze({ x, y: y + height / 2 });
    }
    case `e`: {
      return Object.freeze({ x: x + width, y: y + height / 2 });
    }
    case `center`: {
      return Object.freeze({
        x: x + width / 2,
        y: y + height / 2,
      });
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown direction: ${ card }`);
    }
  }
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
      return Points.isPoint(rect) ? rect.x : 0;
    }
    case `bottom`: {
      return Points.isPoint(rect) ? rect.x : 0;
    }
    case `left`: {
      return Points.isPoint(rect) ? rect.y : 0;
    }
    case `right`: {
      return Points.isPoint(rect) ? rect.x + rect.width : rect.width;
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
      return Points.isPoint(rect) ? rect.y : 0;
    }
    case `bottom`: {
      return Points.isPoint(rect) ? rect.y + rect.height : rect.height;
    }
    case `left`: {
      return Points.isPoint(rect) ? rect.y : 0;
    }
    case `right`: {
      return Points.isPoint(rect) ? rect.y : 0;
    }
  }
};

/**
 * Returns `rect` divided by the width,height of `normaliseBy`.
 * This can be useful for normalising based on camera frame.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const frameSize = {width: 640, height: 320};
 * const object = { x: 320, y: 160, width: 64, height: 32};
 *
 * const n = Rects.normaliseByRect(object, frameSize);
 * // Yields: {x: 0.5, y: 0.5, width: 0.1, height: 0.1}
 * ```
 *
 * Height and width can be supplied instead of a rectangle too:
 * ```js
 * const n = Rects.normaliseByRect(object, 640, 320);
 * ```
 * @param rect
 * @param normaliseBy
 * @returns
 */
export const normaliseByRect = (
  rect: Rect | RectPositioned,
  normaliseByOrWidth: Rect | number,
  height?: number
): Rect | RectPositioned => {
  //eslint-disable-next-line functional/no-let
  let width;
  if (height === undefined) {
    if (isRect(normaliseByOrWidth)) {
      height = normaliseByOrWidth.height;
      width = normaliseByOrWidth.width;
    } else {
      throw new Error(
        `Expects rectangle or width and height parameters for normaliseBy`
      );
    }
  } else {
    if (typeof normaliseByOrWidth === `number`) {
      width = normaliseByOrWidth;
    } else {
      throw new TypeError(
        `Expects rectangle or width and height parameters for normaliseBy`
      );
    }
  }

  return isPositioned(rect) ? Object.freeze({
    x: rect.x / width,
    y: rect.y / height,
    width: rect.width / width,
    height: rect.height / height,
  }) : Object.freeze({
    width: rect.width / width,
    height: rect.height / height,
  });
};

/**
 * Multiplies `a` by rectangle or width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalised rectangle of width 50%, height 50%
 * const r = {width: 0.5, height: 0.5};
 *
 * // Map to window:
 * const rr = Rects.multiply(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * Rects.multiply(someRect, someOtherRect);
 *
 * // Returns {width: someRect.width * 100, height: someRect.height * 200}
 * Rects.multiply(someRect, 100, 200);
 * ```
 *
 * Multiplication applies to the first parameter's x/y fields, if present.
 */
export function multiply(
  a: RectPositioned,
  b: Rect | number,
  c?: number
): RectPositioned;

/**
 * Multiplies `a` by rectangle or width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalised rectangle of width 50%, height 50%
 * const r = {width: 0.5, height: 0.5};
 *
 * // Map to window:
 * const rr = Rects.multiply(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * Rects.multiply(someRect, someOtherRect);
 *
 * // Returns {width: someRect.width * 100, height: someRect.height * 200}
 * Rects.multiply(someRect, 100, 200);
 * ```
 *
 * Multiplication applies to the first parameter's x/y fields, if present.
 */
export function multiply(a: Rect, b: Rect | number, c?: number): Rect;
export function multiply(a: RectPositioned, b: Rect): RectPositioned;

/**
 * Multiplies `a` by rectangle or width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalised rectangle of width 50%, height 50%
 * const r = {width: 0.5, height: 0.5};
 *
 * // Map to window:
 * const rr = Rects.multiply(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * Rects.multiply(someRect, someOtherRect);
 *
 * // Returns {width: someRect.width * 100, height: someRect.height * 200}
 * Rects.multiply(someRect, 100, 200);
 * ```
 *
 * Multiplication applies to the first parameter's x/y fields, if present.
 */
//eslint-disable-next-line func-style
export function multiply(
  a: RectPositioned | Rect,
  b: Rect | number,
  c?: number
): RectPositioned | Rect {
  guard(a, `a`);
  if (isRect(b)) {
    return isRectPositioned(a) ? Object.freeze({
      ...a,
      x: a.x * b.width,
      y: a.y * b.height,
      width: a.width * b.width,
      height: a.height * b.height,
    }) : Object.freeze({
      ...a,
      width: a.width * b.width,
      height: a.height * b.height,
    });
  } else {
    if (typeof b !== `number`) {
      throw new TypeError(
        `Expected second parameter of type Rect or number. Got ${ JSON.stringify(
          b
        ) }`
      );
    }
    if (c === undefined) c = b;

    return isRectPositioned(a) ? Object.freeze({
      ...a,
      x: a.x * b,
      y: a.y * c,
      width: a.width * b,
      height: a.height * c,
    }) : Object.freeze({
      ...a,
      width: a.width * b,
      height: a.height * c,
    });
  }
}

/**
 * Multiplies all components of `rect` by `amount`
 * @param rect
 * @param amount
 */
export function multiplyScalar(rect: Rect, amount: number): Rect;
/**
 * Multiplies all components of `rect` by `amount`
 * @param rect
 * @param amount
 */
export function multiplyScalar(
  rect: RectPositioned,
  amount: number
): RectPositioned;
/**
 * Multiplies all components of `rect` by `amount`
 * @param rect
 * @param amount
 */
export function multiplyScalar(
  rect: Rect | RectPositioned,
  amount: number
): Rect | RectPositioned {
  return isPositioned(rect) ? Object.freeze({
    ...rect,
    x: rect.x * amount,
    y: rect.y * amount,
    width: rect.width * amount,
    height: rect.height * amount,
  }) : Object.freeze({
    ...rect,
    width: rect.width * amount,
    height: rect.height * amount,
  });
}

/**
 * Returns the center of a rectangle as a {@link Geometry.Points.Point}.
 *  If the rectangle lacks a position and `origin` parameter is not provided, 0,0 is used instead.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * const p = Rects.center({x:10, y:20, width:100, height:50});
 * const p2 = Rects.center({width: 100, height: 50}); // Assumes 0,0 for rect x,y
 * ```
 * @param rect Rectangle
 * @param origin Optional origin. Overrides `rect` position if available. If no position is available 0,0 is used by default.
 * @returns
 */
export const center = (
  rect: RectPositioned | Rect,
  origin?: Points.Point
): Points.Point => {
  guard(rect);
  if (origin === undefined && Points.isPoint(rect)) origin = rect;
  else if (origin === undefined) origin = { x: 0, y: 0 }; // throw new Error(`Unpositioned rect needs origin param`);

  return Object.freeze({
    x: origin.x + rect.width / 2,
    y: origin.y + rect.height / 2,
  });
};

/**
 * Returns the length of each side of the rectangle (top, right, bottom, left)
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * // Yields: array of length four
 * const lengths = Rects.lengths(rect);
 * ```
 * @param rect
 * @returns
 */
export const lengths = (rect: RectPositioned): ReadonlyArray<number> => {
  guardPositioned(rect, `rect`);
  return edges(rect).map((l) => Lines.length(l));
};

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
  origin?: Points.Point
): ReadonlyArray<Lines.Line> => {
  const c = corners(rect, origin);

  // Connect all the corners, back to first corner again
  return Lines.joinPointsToLines(...c, c[ 0 ]);
};

/**
 * Returns the perimeter of `rect` (ie. sum of all edges)
 *  * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * Rects.perimeter(rect);
 * ```
 * @param rect
 * @returns
 */
export const perimeter = (rect: Rect): number => {
  guard(rect);
  return rect.height + rect.height + rect.width + rect.width;
};

/**
 * Returns the area of `rect`
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * Rects.area(rect);
 * ```
 * @param rect
 * @returns
 */
export const area = (rect: Rect): number => {
  guard(rect);
  return rect.height * rect.width;
};

/**
 * Returns true if `a` or `b` overlap, are equal, or `a` contains `b`.
 * A rectangle can be checked for intersections with another RectPositioned, CirclePositioned or Point.
 *
 */
export const isIntersecting = (
  a: RectPositioned,
  b: CirclePositioned | Points.Point
): boolean => {
  if (!isRectPositioned(a)) {
    throw new Error(`a parameter should be RectPositioned`);
  }

  if (isCirclePositioned(b)) {
    return Intersects.circleRect(b, a);
  } else if (Points.isPoint(b)) {
    return intersectsPoint(a, b);
  }
  throw new Error(`Unknown shape for b: ${ JSON.stringify(b) }`);
};

/**
 * Returns a random positioned Rect on a 0..1 scale.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const r = Rects.random(); // eg {x: 0.2549012, y:0.859301, width: 0.5212, height: 0.1423 }
 * ```
 *
 * A custom source of randomness can be provided:
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * import { weightedSource } from "https://unpkg.com/ixfx/dist/random.js"
 * const r = Rects.random(weightedSource(`quadIn`));
 * ```
 * @param rando
 * @returns
 */
export const random = (rando?: RandomSource): RectPositioned => {
  if (rando === undefined) rando = defaultRandom;

  return Object.freeze({
    x: rando(),
    y: rando(),
    width: rando(),
    height: rando(),
  });
};

export type RandomPointOpts = {
  readonly strategy?: `naive`;
  readonly randomSource?: RandomSource;
  readonly margin?: { readonly x: number; readonly y: number };
};

/**
 * Returns a random point within a circle.
 *
 * By default creates a uniform distribution.
 *
 * ```js
 * const pt = randomPoint({width: 5, height: 10});
 * ```'
 * @param within Circle to generate a point within
 * @param opts Options
 * @returns
 */
export const randomPoint = (
  within: Rect | RectPositioned,
  opts: RandomPointOpts = {}
): Points.Point => {
  // TODO: Does not implement uniform distribution
  // See: https://math.stackexchange.com/questions/366474/find-coordinates-of-n-points-uniformly-distributed-in-a-rectangle
  const rand = opts.randomSource ?? defaultRandom;
  const margin = opts.margin ?? { x: 0, y: 0 };

  const x = rand() * (within.width - margin.x - margin.x);
  const y = rand() * (within.height - margin.y - margin.y);

  const pos = { x: x + margin.x, y: y + margin.y };
  return isPositioned(within) ? Points.sum(pos, within) : Object.freeze(pos);
};
