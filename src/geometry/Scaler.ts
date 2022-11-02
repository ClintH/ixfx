
import { Point, isPoint } from './Point.js';
import { Rect, isRect, placeholder as PlaceholderRect } from './Rect.js';

/**
 * A scale function that takes an input value to scale. 
 * Input can be in the form of `{ x, y }` or two number parameters.
 *  
 * ```js
 * scale(10, 20);
 * scale({ x:10, y:20 });
 * ```
 * 
 * Output range can be specified as a `{ width, height }` or two number parameters. 
 * If omitted, the default range
 * is used.
 * 
 * ```js
 * // Scale 10,20 with range w:800 h:600
 * scale(10, 20, 800, 600);
 * scale({x:10, y:20}, 800, 600);
 * scale({x:10, y:20}, {width: 800, height: 600});
 * ```
 */
export type ScaleFn = (a:number|Point, b?:number|Rect, c?:number|Rect, d?:number)=>Point

/**
 * A scaler than can convert to a from an output range
 */
export type Scaler = {
  /**
   * Relative to absolute coordinates
   */
  readonly abs:ScaleFn
  /**
   * Absolute to relative coordintes
   */
  readonly rel:ScaleFn
}

/**
 * Returns a set of scaler functions, to convert to and from ranges.
 * 
 * ```js
 * const scaler = Scaler.scaler(`both`, window.innerWidth, window.innerHeight);
 * // Assuming screen of 800x400...
 * scaler.abs(400,200);          // Yields { x:0.5, y:0.5 }
 * scaler.abs({ x:400, y:200 }); // Yields { x:0.5, y:0.5 }
 * 
 * scaler.rel(0.5, 0.5);         // Yields: { x:400, y:200 }
 * scaler.rel({ x:0.5, y:0.5 }); // Yields: { x:400, y:200 }
 * ```
 * 
 * If no default range is provided, it must be given each time the scale function is used.
 * 
 * ```js
 * const scaler = Scaler.scaler(`both`);
 * 
 * scaler.abs(400, 200, 800, 400); 
 * scaler.abs(400, 200, { width: 800, height: 400 });
 * scaler.abs({ x:400, y: 200}, { width: 800, height: 400 });
 * scaler.abs({ x:400, y: 200}, 800, 400);
 * // All are the same, yielding { x:0.5, y:0.5 }
 * 
 * scaler.abs(400, 200); // Throws an exception because there is no scale
 * ```
 * @param scaleBy Dimension to scale by
 * @param defaultRect Default range
 * @returns 
 */
export const scaler = (scaleBy:`both`|`min`|`max`|`width`|`height` = `both`, defaultRect?:Rect):Scaler => {
  const defaultBounds = defaultRect ?? PlaceholderRect;

  //eslint-disable-next-line functional/no-let
  let sw = 1;
  //eslint-disable-next-line functional/no-let
  let sh = 1;
  //eslint-disable-next-line functional/no-let
  let s = { x:1, y:1 };

  const computeScale = () => {
    switch (scaleBy) {
    case `height`:
      return { x:sh, y: sh };
    case `width`:
      return { x:sw, y:sw };
    case `min`:
      return { x:Math.min(sw, sh), y:Math.min(sw, sh) };
    case `max`:
      return { x:Math.max(sw, sh), y:Math.max(sw, sh) };
    default:
      return { x:sw, y:sh };
    }
  };
  
  const normalise = (a:number|Point, b?:number|Rect, c?:number|Rect, d?:number):[x:number, y:number, w:number, h:number] => {
    //eslint-disable-next-line functional/no-let
    let inX = Number.NaN;
    //eslint-disable-next-line functional/no-let
    let inY = Number.NaN;
    //eslint-disable-next-line functional/no-let
    let outW = defaultBounds.width;
    //eslint-disable-next-line functional/no-let
    let outH = defaultBounds.height;

    if (typeof a === `number`) {
      inX = a;
      if (typeof b === `number`) {
        inY = b;
        if (c === undefined) return [inX, inY, outW, outH];
        if (isRect(c)) {
          outW =c.width;
          outH = c.height;
        } else if (typeof c === `number`) {
          outW = c;
          if (typeof d === `number`) {
            outH = d;
          } else {
            throw new Error(`Missing final height value`);
          }
        } else throw new Error(`Missing valid output range`);
      } else if (isRect(b)) {
        outW = b.width;
        outH = b.height;
      } else throw new Error(`Expected input y or output Rect to follow first number parameter`);
    } else if (isPoint(a)) {
      inX = a.x;
      inY = a.y;
      if (b === undefined) return [inX, inY, outW, outH];
      if (isRect(b)) {
        outW = b.width;
        outH = b.height;
      } else if (typeof b === `number`) {
        outW = b;
        if (typeof c === `number`) {
          outH = c;
        } else {
          throw new Error(`Expected height as third parameter after Point and output width`);
        }
      } else {
        throw new Error(`Expected Rect or width as second parameter when first parameter is a Point`);
      }
    } else {
      throw new Error(`Expected input Point or x value as first parameter`);
    }
    return [inX, inY, outW, outH];
  };

  const scaleAbs = (a:number|Point, b?:number|Rect, c?:number|Rect, d?:number):Point => {
    const n = normalise(a, b, c, d);
    return scaleNormalised(true, ...n);
  };

  const scaleRel = (a:number|Point, b?:number|Rect, c?:number|Rect, d?:number):Point => {
    const n = normalise(a, b, c, d);
    return scaleNormalised(false, ...n);
  };
  
  const scaleNormalised = (abs:boolean, x:number, y:number, w:number, h:number):Point => {
    if (Number.isNaN(w)) throw new Error(`Output width range missing`);
    if (Number.isNaN(h)) throw new Error(`Output height range missing`);

    // If output dimensions has changed since last, create a new scale
    if (w !== sw || h !== sh) {
      sw = w;
      sh = h;
      s = computeScale();
    }

    if (abs) {
      return {
        x: x * s.x,
        y: y * s.y
      };
    } else {
      return {
        x: x / s.x,
        y: y / s.y
      };
    }
  
  };

  return {
    rel: scaleRel,
    abs: scaleAbs
  };
};