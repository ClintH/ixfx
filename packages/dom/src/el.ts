import { setCssClass, setCssDisplay, setCssToggle } from "./css.js";
import { resolveEl, resolveEls, type QueryOrElements } from "./resolve-el.js";
import { setHtml, setText } from "./set-property.js";

/**
 * Wraps an element (or set of elements) with handy functions
 * for manipulation.
 */
export type WrappedElement = {
  /**
   * Sets inner text
   * @param value
   * @returns 
   */
  text: (value: string | number) => string
  /**
   * Sets inner HTML
   * @param value 
   * @returns 
   */
  html: (value: string | number) => string
  /**
   * Sets the CSS 'display' property to `value`
   * @param value
   * @returns 
   */
  cssDisplay: (value: string) => void
  /**
   * Adds/removes a CSS class depending on `value`
   * @param value 
   * @param cssClass 
   * @returns 
   */
  cssClass: (value: boolean, cssClass: string) => void
  /**
   * Toggles a CSS class
   * @param cssClass 
   * @returns 
   */
  cssToggle: (cssClass: string) => void
  /**
   * Gets the HTML element corresponding to original selector.
   * If the selector returns multiple items, the first is yielded
   * @returns 
   */
  el: () => HTMLElement
  /**
   * Returns a set of HTML elements that match selector
   * @returns 
   */
  els: () => HTMLElement[]
}

/**
 * Returns an object with handy functions for working on/against the provided selector.
 * 
 * ```js
 * const e = el(`#my-element`);
 * e.text(`hello`);           // Set the inner text of the elemenet
 * e.cssDisplay(`block`);    // Sets display:block
 * e.cssToggle(`activated`);  // Toggles the 'activated' CSS class
 * e.cssClass(true, `activated`); // Turns on the 'activated' CSS class
 * e.el();                    // Returns the HTML Element
 * ```
 * 
 * The selector is only queried when created. Use {@link elRequery} to continually
 * re-query the selector before each operation. 
 * 
 * @param selectors 
 * @returns 
 */
export const el = (selectors: QueryOrElements): WrappedElement => {
  const elements = resolveEls(selectors);
  const text = setText(elements);
  const html = setHtml(elements);
  return {
    text,
    html,
    cssDisplay: (value: string) => { setCssDisplay(elements, value); },
    cssClass: (value: boolean, cssClass: string) => { setCssClass(elements, value, cssClass); },
    cssToggle: (cssClass: string) => { setCssToggle(elements, cssClass); },
    el: () => elements[ 0 ],
    els: () => elements
  }
}

export const elRequery = (selectors: string): WrappedElement => ({
  text: (value: string | number) => setText(selectors, value),
  html: (value: string | number) => setHtml(selectors, value),
  cssDisplay: (value: string) => { setCssDisplay(selectors, value); },
  cssClass: (value: boolean, cssClass: string) => { setCssClass(selectors, value, cssClass); },
  cssToggle: (cssClass: string) => { setCssToggle(selectors, cssClass); },
  el: () => resolveEl(selectors) as HTMLElement,
  els: () => resolveEls(selectors)
});
