import {Points, Lines} from './index.js';

export type Rect = {
  readonly width: number,
  readonly height: number,
}
export type RectPositioned = Points.Point & Rect;

export const empty = Object.freeze({width:0, height: 0});
export const emptyPositioned = Object.freeze({x:0, y:0, width:0, height: 0});

export const placeholder = Object.freeze({width: Number.NaN, height: Number.NaN});
export const placeholderPositioned = Object.freeze({x: Number.NaN, y:Number.NaN, width: Number.NaN, height: Number.NaN});

export const isEmpty = (rect:Rect):boolean => rect.width === 0 && rect.height === 0;
export const isPlaceholder = (rect:Rect):boolean => Number.isNaN(rect.width) && Number.isNaN(rect.height);
/**
 * Returns true if parameter has a positioned (x,y) 
 * @param p Point, Rect or RectPositiond
 * @returns 
 */
export const isPositioned = (p: Points.Point | Rect | RectPositioned): p is Points.Point => (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;

export const isRect = (p: number|unknown): p is Rect => {
  if (p === undefined) return false;
  if ((p as Rect).width === undefined) return false;
  if ((p as Rect).height === undefined) return false;
  return true;
};

/**
 * Returns true if `p` is a positioned rectangle
 * @param p 
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRectPositioned = (p:Rect|RectPositioned|any): p is RectPositioned => isRect(p) && isPositioned(p);

export const fromElement = (el:HTMLElement): Rect => ({width: el.clientWidth, height: el.clientHeight});

export const isEqualSize = (a:Rect, b:Rect):boolean => {
  if (a === undefined) throw new Error(`a undefined`);
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
export function fromNumbers(width:number, height:number):Rect;

/**
 * Returns a rectangle from x,y,width,height
 * ```js
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
export function fromNumbers(x:number, y:number, width:number, height:number):RectPositioned;

/**
 * Returns a rectangle from a series of numbers: x, y, width, height OR width, height
 * ```js
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
export function fromNumbers(xOrWidth:number, yOrHeight:number, width?: number, height?:number):Rect|RectPositioned {

  if (width === undefined || height === undefined) {
    if (typeof xOrWidth !== `number`) throw new Error(`width is not an number`);
    if (typeof yOrHeight !== `number`) throw new Error(`height is not an number`);
    return Object.freeze({width:xOrWidth, height:yOrHeight});
  }
  if (typeof xOrWidth !== `number`) throw new Error(`x is not an number`);
  if (typeof yOrHeight !== `number`) throw new Error(`y is not an number`);
  if (typeof width !== `number`) throw new Error(`width is not an number`);
  if (typeof height !== `number`) throw new Error(`height is not an number`);

  return Object.freeze({x:xOrWidth, y:yOrHeight, width, height});
}

type RectArray = readonly [width:number, height:number];
type RectPositionedArray = readonly [x:number, y:number, width:number, height:number];


/**
 * Converts a rectangle to an array of numbers. See {@link fromNumbers} for the opposite conversion.
 * 
 * ```js
 * const r1 = Rects.toArray({ x: 10, y:20, width: 100, height: 200 });
 * // [10, 20, 100, 200]
 * const r2 = Rects.toArray({ width: 100, height: 200 });
 * // [100, 200]
 * ```
 * @param rect 
 * @see fromNumbers
 */
export function toArray (rect:Rect): RectArray;

/**
 * Converts a rectangle to an array of numbers. See {@link fromNumbers} for the opposite conversion.
 * 
 * ```js
 * const r1 = Rects.toArray({ x: 10, y:20, width: 100, height: 200 });
 * // [10, 20, 100, 200]
 * const r2 = Rects.toArray({ width: 100, height: 200 });
 * // [100, 200]
 * ```
 * @param rect 
 * @see fromNumbers
 */
export function toArray(rect:RectPositioned): RectPositionedArray;

/**
 * Converts a rectangle to an array of numbers. See {@link fromNumbers} for the opposite conversion.
 * 
 * ```js
 * const r1 = Rects.toArray({ x: 10, y:20, width: 100, height: 200 });
 * // [10, 20, 100, 200]
 * const r2 = Rects.toArray({ width: 100, height: 200 });
 * // [100, 200]
 * ```
 * @param rect 
 * @see fromNumbers
 */
// eslint-disable-next-line func-style
export function toArray(rect:Rect|RectPositioned):RectArray|RectPositionedArray {
  if (isPositioned(rect)) {
    return [rect.x, rect.y, rect.width, rect.height];
  } else if (isRect(rect)) {
    return [rect.width, rect.height];
  } else throw new Error(`rect param is not a rectangle. Got: ${JSON.stringify(rect)}`);
}

export const isEqual = (a:Rect|RectPositioned, b:Rect|RectPositioned):boolean => {
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
 * 
 * x,y coords from `a` will be unchanged
 * @param a 
 * @param b 
 */
export function subtract (a:Rect, b:Rect):Rect;
/**
 * Subtracts a width/height from `a`, returning result.
 * 
 * x,y coords from a will be unchanged
 * @param a 
 * @param width 
 * @param height 
 */
export function subtract (a:Rect, width:number, height?:number):Rect;

/**
 * Subtracts width/height from `a`.
 * 
 * x,y coords from a will be unchanged.
 * @param a 
 * @param b 
 * @param c 
 * @returns 
 */
//eslint-disable-next-line func-style
export function subtract(a:Rect, b:Rect|number, c?:number):Rect {
  if (a === undefined) throw new Error(`First parameter undefined`);
  if (typeof b === `number`) {
    const height = c === undefined ? 0 : c;
    return Object.freeze({
      ...a,
      width: a.width - b,
      height: a.height - height
    });
  } else {
    return Object.freeze({
      ...a,
      width: a.width - b.width,
      height: a.height - b.height
    });
  }
}

/**
 * Returns true if `point` is within, or on boundary of `rect`.
 * @param rect 
 * @param point 
 */
export function intersectsPoint (rect:Rect|RectPositioned, point:Points.Point):boolean;
/**
 * Returns true if x,y coordinate is within, or on boundary of `rect`.
 * @param rect
 * @param x 
 * @param y 
 */
export function intersectsPoint (rect:Rect|RectPositioned, x:number, y:number):boolean;

/**
 * Returns true if point is within or on boundary of `rect`.
 * @param rect 
 * @param a 
 * @param b 
 * @returns 
 */
//eslint-disable-next-line func-style
export function intersectsPoint(rect:Rect|RectPositioned, a:Points.Point|number, b?:number):boolean {
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

export const fromCenter = (origin: Points.Point, width: number, height: number): RectPositioned => {
  Points.guard(origin, `origin`);

  guardDim(width, `width`);
  guardDim(height, `height`);

  const halfW = width / 2;
  const halfH = height / 2;
  return {x: origin.x - halfW, y: origin.y - halfH, width: width, height: height};
};

/**
 * Returns the distance from the perimeter of `rect` to `pt`.
 * If the point is within the rectangle, 0 is returned.
 * 
 * If `rect` does not have an x,y it's assumed to be 0,0
 * @param rect Rectangle
 * @param pt Point
 * @returns Distance
 */
export const distanceFromExterior = (rect:RectPositioned, pt:Points.Point):number => {
  guardPositioned(rect, `rect`);
  Points.guard(pt, `pt`);
  if (intersectsPoint(rect, pt)) return 0;
  const dx = Math.max(rect.x - pt.x, 0, pt.x - rect.x + rect.width);
  const dy = Math.max(rect.y - pt.y, 0, pt.y - rect.y + rect.height);
  return Math.sqrt(dx*dx + dy*dy);
};

export const distanceFromCenter = (rect:RectPositioned, pt:Points.Point): number => Points.distance(center(rect), pt);


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
 */
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
  if (isPositioned(rect)) Points.guard(rect, name);
  guardDim(rect.width, name + `.width`);
  guardDim(rect.height, name + `.height`);
};

const guardPositioned = (rect:RectPositioned, name:string = `rect`) => {
  if (!isPositioned(rect)) throw new Error(`Expected ${name} to have x,y`);
  guard(rect, name);
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

export const corners = (rect: RectPositioned|Rect, origin?:Points.Point): readonly Points.Point[] => {
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

/**
 * Returns a point on the edge of rectangle
 * ```js
 * const r1 = {x: 10, y: 10, width: 100, height: 50};
 * getEdgeX(r1, `right`);  // Yields: 110
 * getEdgeX(r1, `bottom`); // Yields: 60
 * 
 * const r2 = {width: 100, height: 50};
 * getEdgeX(r2, `right`);  // Yields: 100
 * getEdgeX(r2, `bottom`); // Yields: 50
 * ```
 * @param rect 
 * @param edge Which edge: right, left, bottom, top
 * @returns 
 */
export const getEdgeX = (rect:RectPositioned|Rect, edge:`right`|`bottom`|`left`|`top`): number => {
  guard(rect);
  switch (edge) {
  case `top`:
    return (Points.isPoint(rect)) ? rect.x  : 0;
  case `bottom`:
    return (Points.isPoint(rect)) ? rect.x  : 0;
  case `left`:
    return (Points.isPoint(rect)) ? rect.y  : 0;
  case `right`:
    return (Points.isPoint(rect)) ? rect.x + rect.width  : rect.width;
  }
};

export const getEdgeY = (rect:RectPositioned|Rect, edge:`right`|`bottom`|`left`|`top`): number => {
  guard(rect);
  switch (edge) {
  case `top`:
    return (Points.isPoint(rect)) ? rect.y  : 0;
  case `bottom`:
    return (Points.isPoint(rect)) ? rect.y + rect.height : rect.height;
  case `left`:
    return (Points.isPoint(rect)) ? rect.y  : 0;
  case `right`:
    return (Points.isPoint(rect)) ? rect.y  : 0;
  }
};

/**
 * Returns `rect` divided by the width,height of `normaliseBy`. This can be useful for
 * normalising based on camera frame.
 * ```js
 * const frameSize = {width: 640, height: 320};
 * const object = { x: 320, y: 160, width: 64, height: 32};
 * 
 * const n = normaliseByRect(object, frameSize);
 * // Yields: {x: 0.5, y: 0.5, width: 0.1, height: 0.1}
 * ```
 * 
 * Height and width can be supplied instead of a rectangle too:
 * ```js
 * const n = normaliseByRect(object, 640, 320);
 * ```
 * @param rect 
 * @param normaliseBy 
 * @returns 
 */
export const normaliseByRect = (rect:Rect|RectPositioned, normaliseByOrWidth:Rect|number, height?:number):Rect|RectPositioned => {
  //eslint-disable-next-line functional/no-let
  let width;
  if (height === undefined) {
    if (isRect(normaliseByOrWidth)) {
      height = normaliseByOrWidth.height;
      width = normaliseByOrWidth.width;
    } else {
      throw new Error(`Expects rectangle or width and height parameters for normaliseBy`);
    }
  } else {
    if (typeof normaliseByOrWidth === `number`) {
      width = normaliseByOrWidth;
    } else {
      throw new Error(`Expects rectangle or width and height parameters for normaliseBy`);
    }
  }

  if (isPositioned(rect)) {
    return Object.freeze({
      x: rect.x / width,
      y: rect.y / height,
      width: rect.width / width,
      height: rect.height / height
    });
  } else {
    return Object.freeze({
      width: rect.width / width,
      height: rect.height / height
    });
  }
};

/**
 * Multiplies `a` by rectangle or width/height. Useful for denormalising a value.
 * 
 * ```js
 * // Normalised rectangle of width 50%, height 50%
 * const r = {width: 0.5, height: 0.5};
 * 
 * // Map to window:
 * const rr = multiply(r, window.innerWidth, window.innerHeight);
 * ```
 * 
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * multiply(someRect, someOtherRect);
 * 
 * // Returns {width: someRect.width * 100, height: someRect.height * 200}
 * multiply(someRect, 100, 200);
 * ```
 * 
 * Multiplication applies to the first parameter's x/y fields, if present.
 */
export const multiply = (a:RectPositioned|Rect, b:Rect|number, c?:number):RectPositioned|Rect => {
  guard(a, `a`);
  if (isRect(b)) {
    if (isRectPositioned(a)) {
      return {
        ...a,
        x: a.x * b.width,
        y: a.y * b.height,
        width: a.width * b.width,
        height: a.width * b.height
      };
    } else {
      return {
        ...a,
        width: a.width * b.width,
        height: a.width * b.height
      };
    }
  } else {
    if (typeof b !== `number`) throw new Error(`Expected second parameter of type Rect or number. Got ${JSON.stringify(b)}`);
    if (c === undefined) c = b;

    if (isRectPositioned(a)) {
      return {
        ...a,
        x: a.x * b,
        y: a.y * c,
        width: a.width * b,
        height: a.width * c
      };
    } else {
      return {
        ...a,
        width: a.width * b,
        height: a.width * c
      };
    }
  }
};

/**
 * Returns the center of a rectangle as a {@link Geometry.Points.Point}.
 *  If the rectangle lacks a position and `origin` parameter is not provided, 0,0 is used instead.
 * 
 * ```js
 * const p = center({x:10, y:20, width:100, height:50});
 * const p2 = center({width: 100, height: 50}); // Assumes 0,0 for rect x,y
 * ```
 * @param rect Rectangle
 * @param origin Optional origin. Overrides `rect` position if available. If no position is available 0,0 is used by default.
 * @returns 
 */
export const center = (rect: RectPositioned|Rect, origin?:Points.Point): Points.Point => {
  guard(rect);
  if (origin === undefined && Points.isPoint(rect)) origin = rect;
  else if (origin === undefined) origin = {x:0, y:0}; // throw new Error(`Unpositioned rect needs origin param`);

  return Object.freeze({
    x: origin.x + rect.width / 2,
    y: origin.y + rect.height / 2
  });
};

/**
 * Returns the length of each side of the rectangle (top, right, bottom, left)
 * @param rect 
 * @returns 
 */
export const lengths = (rect:RectPositioned):readonly number[] => {
  guardPositioned(rect, `rect`);
  return edges(rect).map(l => Lines.length(l));
};

/**
 * Returns four lines based on each corner.
 * Lines are given in order: top, right, bottom, left
 *
 * @param {(RectPositioned|Rect)} rect
 * @param {Points.Point} [origin]
 * @returns {Lines.Line[]}
 */
export const edges = (rect: RectPositioned|Rect, origin?:Points.Point): readonly Lines.Line[] => Lines.joinPointsToLines(...corners(rect, origin));

/**
 * Returns the perimeter of `rect` (ie. sum of all edges)
 * @param rect 
 * @returns 
 */
export const perimeter = (rect:Rect):number => {
  guard(rect);
  return rect.height + rect.height + rect.width + rect.width;
};

/**
 * Returns the area of `rect`
 * @param rect 
 * @returns 
 */
export const area = (rect:Rect):number => {
  guard(rect);
  return rect.height*rect.width;
};