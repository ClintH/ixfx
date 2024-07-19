import { resolveEls, type QueryOrElements } from "./ResolveEl.js";

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