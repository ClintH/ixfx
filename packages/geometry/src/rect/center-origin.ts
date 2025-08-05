import type { Point } from "../point/point-type.js";
import { center } from "./center.js";
import type { RectPositioned } from "./rect-types.js";

/**
 * Perform basic point translation using a rectangle where its center is the origin.
 * 
 * Thus the relative coordinate { x: 0, y: 0} corresponds to the absolute middle of the
 * rectangle.
 * 
 * The relative coordinate { x: -1, y: -1 } corresponds to the rectangle's {x,y} properties, and so on.
 * @param rectAbsolute 
 * @returns 
 */
export const centerOrigin = (rectAbsolute: RectPositioned) => {
  const c = center(rectAbsolute);
  const w = rectAbsolute.width / 2;
  const h = rectAbsolute.height / 2;

  const relativeToAbsolute = (point: Point) => {
    return {
      ...point,
      x: point.x * w + c.x,
      y: point.y * h + c.y
    }
  }

  const absoluteToRelative = (point: Point) => {
    return {
      ...point,
      x: ((point.x - rectAbsolute.x) / w) - 1,
      y: ((point.y - rectAbsolute.y) / h) - 1
    }
  }

  return { relativeToAbsolute, absoluteToRelative }
}