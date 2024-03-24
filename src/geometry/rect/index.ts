
import { guard as PointsGuard } from '../point/Guard.js';
import { isEqual as PointsIsEqual, isPoint, type Point } from '../point/index.js';

import { length as LinesLength } from '../line/index.js';

import { edges } from './Edges.js';

import { getRectPositioned, guard, guardDim, guardPositioned, isPositioned, isRect, isRectPositioned } from './Guard.js';
export * from './Cardinal.js';
export * from './Corners.js';
export * from './Distance.js';
export * from './Edges.js';
export * from './FromNumbers.js';
export * from './Intersects.js';
export * from './Multiply.js';
export * from './Random.js';
export * from './Subtract.js';
export * from './Sum.js';
export * from './Guard.js';


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
export type Rect = {
  readonly width: number;
  readonly height: number;
};
export type RectPositioned = Point & Rect;

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
  if (a === undefined) throw new Error(`a undefined`);
  if (b === undefined) throw new Error(`b undefined`);
  return a.width === b.width && a.height === b.height;
};


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
    if (!PointsIsEqual(a, b)) return false;
    return a.width === b.width && a.height === b.height;
  } else if (!isPositioned(a) && !isPositioned(b)) {
    return a.width === b.width && a.height === b.height;
  } else {
    // One param is positioned, the other is not
    return false;
  }
};


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
  origin: Point,
  width: number,
  height: number
): RectPositioned => {
  PointsGuard(origin, `origin`);

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
  topLeft: Point,
  topRight: Point,
  bottomRight: Point,
  bottomLeft: Point
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

/**
 * Accepts:
 * * x,y,w,h
 * * x,y,rect
 * * point,rect
 * * RectPositioned
 * * Rect, x,y
 * * Rect, Point
 * @param a 
 * @param b 
 * @param c 
 * @param d 
 * @returns 
 */
export function getRectPositionedParameter(a: number | Point | Rect | RectPositioned, b?: Rect | number | Point, c?: number | Rect, d?: number): RectPositioned {
  if (typeof a === `number`) {
    if (typeof b === `number`) {
      if (typeof c === `number` && typeof d === `number`) {
        return { x: a, y: b, width: c, height: d }
      } else if (isRect(c)) {
        return { x: a, y: b, width: c.width, height: c.height }
      } else {
        throw new TypeError(`If params 'a' & 'b' are numbers, expect following parameters to be x,y or Rect`);
      }
    } else {
      throw new TypeError(`If parameter 'a' is a number, expect following parameters to be: y,w,h`);
    }
  } else if (isRectPositioned(a)) {
    return a;
  } else if (isRect(a)) {
    if (typeof b === `number` && typeof c === `number`) {
      return { width: a.width, height: a.height, x: b, y: c };
    } else if (isPoint(b)) {
      return { width: a.width, height: a.height, x: b.x, y: b.y };
    } else {
      throw new TypeError(`If param 'a' is a Rect, expects following parameters to be x,y`);
    }
  } else if (isPoint(a)) {
    if (typeof b === `number` && typeof c === `number`) {
      return { x: a.x, y: a.y, width: b, height: c };
    } else if (isRect(b)) {
      return { x: a.x, y: a.y, width: b.width, height: b.height };
    } else {
      throw new TypeError(`If parameter 'a' is a Point, expect following params to be: Rect or width,height`);
    }
  }
  throw new TypeError(`Expect a first parameter to be x,RectPositioned,Rect or Point`);
}


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
  origin: Point,
  width: number,
  height: number
): RectPositioned => {
  guardDim(width, `width`);
  guardDim(height, `height`);
  PointsGuard(origin, `origin`);

  return { x: origin.x, y: origin.y, width: width, height: height };
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
 * Returns the center of a rectangle as a {@link Geometry.Point}.
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
  origin?: Point
): Point => {
  guard(rect);
  if (origin === undefined && isPoint(rect)) origin = rect;
  else if (origin === undefined) origin = { x: 0, y: 0 }; // throw new Error(`Unpositioned rect needs origin param`);

  const r = getRectPositioned(rect, origin);
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
  return edges(rect).map((l) => LinesLength(l));
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

