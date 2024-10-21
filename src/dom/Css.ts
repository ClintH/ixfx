
import type { RectPositioned } from "../geometry/Types.js";
import { resolveEl, resolveEls, type QueryOrElements } from "./ResolveEl.js";

// const tw = getComputedStyle(this.#el).borderTopWidth;
// const bw = getComputedStyle(this.#el).borderBottomWidth;
// const leftW = getComputedStyle(this.#el).borderLeftWidth;
// const rightW = getComputedStyle(this.#el).borderRightWidth;

type ComputedPixelsMap<T extends ReadonlyArray<keyof CSSStyleDeclaration>> = {
  [Key in T[number]]: number
}

/**
 * Returns the value of `getBoundingClientRect` plus the width of all the borders
 * @param elOrQuery 
 * @returns 
 */
export const getBoundingClientRectWithBorder = (elOrQuery:SVGElement|HTMLElement|string):RectPositioned => {
  let el = resolveEl(elOrQuery);
  const size = el.getBoundingClientRect();
  if (el instanceof SVGElement) {
    el = el.parentElement as HTMLElement;
  }
  const border = getComputedPixels(el, `borderTopWidth`, `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`);

  return {
    x: size.x,
    y: size.y,
    width: size.width +border.borderLeftWidth+border.borderRightWidth,
    height: size.height+border.borderTopWidth+border.borderBottomWidth
  }
}

/**
 * Returns the computed measurements of CSS properties via [getComputedStyle](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
 * ```js
 * const v = getComputedPixels(`#some-el`, `borderTopWidth`, `borderLeftWidth`);
 * v.borderTopWidth;  // number
 * b.borderLeftWidth; // number
 * ```
 * 
 * Throws an error if value from `getComputedStyle` is not a string or does not end in 'px'.
 * @param elOrQuery 
 * @param properties 
 * @returns 
 */
export const getComputedPixels = <T extends ReadonlyArray<keyof CSSStyleDeclaration>>(elOrQuery:HTMLElement|string, ...properties:T):ComputedPixelsMap<T> => {
  const s = getComputedStyle(resolveEl(elOrQuery));
  const returnValue = {};
  for (const property of properties) {
    const v = s[property];
    if (typeof v === `string`) {
      if (v.endsWith(`px`)) {
        (returnValue as any)[property] = Number.parseFloat(v.substring(0,v.length-2));
      } else {
        throw new Error(`Property '${String(property)}' does not end in 'px'. Value: ${v}`);
      }
    } else {
      throw new Error(`Property '${String(property)}' is not type string. Got: ${typeof v} Value: ${v}`);
    }
  }
  return returnValue as ComputedPixelsMap<T>;
}


/**
 * Adds `cssClass` to element(s) if `value` is true.
 * ```js
 * setClass(`#someId`, true, `activated`);
 * ```
 * @param selectors 
 * @param value 
 * @param cssClass 
 * @returns 
 */
export const setCssClass = (selectors: QueryOrElements, value: boolean, cssClass: string) => {
  const elements = resolveEls(selectors);
  if (elements.length === 0) return;

  for (const element of elements) {
    if (value) element.classList.add(cssClass);
    else element.classList.remove(cssClass);
  }
};

/**
 * Toggles a CSS class on all elements that match selector
 * @param selectors 
 * @param cssClass 
 * @returns 
 */
export const setCssToggle = (selectors: QueryOrElements, cssClass: string) => {
  const elements = resolveEls(selectors);
  if (elements.length === 0) return;
  for (const element of elements) {
    element.classList.toggle(cssClass);
  }
}

export const setCssDisplay = (selectors: QueryOrElements, value: string) => {
  const elements = resolveEls(selectors);
  if (elements.length === 0) return;
  for (const element of elements) {
    (element).style.display = value;
  }
};