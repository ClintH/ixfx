import type { Rect } from "./rect-types.js";

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