import { isPositioned, isRect } from "./Guard.js";
import type { Rect, RectPositioned } from "./RectTypes.js";

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