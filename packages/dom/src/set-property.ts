import { resolveEls, type QueryOrElements } from "./resolve-el.js";

export function setText(selectors: QueryOrElements): (value: any) => string;
export function setText(selectors: QueryOrElements, value?: any): string;
export function setText(selectors: QueryOrElements, value?: any): string | ((value: any) => string) {
  return setProperty(`textContent`, selectors, value)
};

export function setHtml(selectors: QueryOrElements): (value: any) => string;
export function setHtml(selectors: QueryOrElements, value?: any): string;

/**
 * Sets the innerHTML of an element.
 * 
 * ```js
 * setHtml(`#some-el`, `<b>hello</b>`);
 * ```
 * @param selectors 
 * @param value 
 * @returns 
 */
export function setHtml(selectors: QueryOrElements, value?: any): string | ((value: any) => string) {
  return setProperty(`innerHTML`, selectors, value)
};

export function setProperty(property: string, selectors: QueryOrElements): (value: any) => string;
export function setProperty(property: string, selectors: QueryOrElements, value: any): string;

/**
 * Sets some property on an element
 * 
 * ```js
 * setProperty(`width`, `canvas`, 100); // Set the width property to 100
 * ```
 * 
 * If `value` is an object, converts to JSON first.
 * @param property 
 * @param selectors 
 * @param value 
 * @returns 
 */
export function setProperty(property: string, selectors: QueryOrElements, value?: any): string | ((value: any) => string) {
  let elements: HTMLElement[] = [];
  const set = (v: any) => {
    const typ = typeof v;
    const vv = (typ === `string` || typ === `number` || typ === `boolean`) ? v as string :
      JSON.stringify(v);

    if (elements.length === 0) {
      elements = resolveEls(selectors);
    }
    for (const element of elements) {
      (element as any)[ property ] = vv;
    }
    return vv;
  }
  return value === undefined ? set : set(value);
};