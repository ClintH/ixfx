import type { Rect } from "./rect-types.js";

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