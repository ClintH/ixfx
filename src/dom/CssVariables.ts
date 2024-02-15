import * as Text from "../Text.js"
import { resolveEl } from "./ResolveEl.js"

/**
 * CSS Variable
 */
export type CssVariable = {
  /**
   * CSS variable to read for the value. `--` prefix is not needed
   */
  variable: string
  /**
   * Attribute name, eg 'width' for a Canvas element.
   */
  attribute?: string
  field?: string
  /**
   * Optional default value
   */
  defaultValue: string | undefined
}

/**
 * CSS Variable by id
 */
export type CssVariableByIdOption = CssVariable & {
  id: string
}

/**
 * CSS variable by query
 */
export type CssVariableByQueryOption = CssVariable & {
  query: string
}

/**
 * CSS variable by element reference
 */
export type CssVariableByElementOption = CssVariable & {
  element: (HTMLElement | SVGElement) | Array<Element>
}

/**
 * CSS variable option
 */
export type CssVariableOption = CssVariable & (CssVariableByElementOption | CssVariableByIdOption | CssVariableByQueryOption);

/**
 * Parse data as attributes.
 * 
 * This is a first step of going from a relatively human-friendly simple array format
 * into setting HTML attributes based on a CSS variable. The second step is to call `setFromVariables`
 * 
 * ```js
 * // Array of arrays is treated as a set of key-value pairs
 * const options = [ [`indicator-fill`, `gray`], [`backdrop-fill`, `whitesmoke`] ]
 * const attrs = parseAsAttributes(options);
 * Yields:
 * [
 *  { variable: `indicator-fill`, attribute: `fill`, id: `indicator`, defaultValue: `gray` }
 *  { variable: `backdrop-fill`, attribute: `fill`, id: `backdrop`, defaultValue: `whitesmoke` }
 * ]
 * 
 * // Assign
 * setFromCssVariables(document.body, attrs);
 * ```
 * @param options 
 * @returns 
 */
export const parseAsAttributes = (options: Array<string | Array<string>>): Array<CssVariable & CssVariableByIdOption> => {
  return options.map(opt => {
    let defaultValue;
    // Nested array, treat second element as default value, name as first
    if (Array.isArray(opt)) {
      defaultValue = opt[ 1 ];
      opt = opt[ 0 ];
    }
    const dash = opt.indexOf(`-`);
    if (dash < 0) throw new Error(`Simple expression expects form of: 'elementid-attribute'`);
    return {
      variable: opt,
      attribute: opt.slice(dash + 1),
      id: opt.slice(0, dash),
      defaultValue
    }
  })
}

/**
 * Reads the value of a CSS variable and assign it to HTML attributes or object field.
 * 
 * ```js
 * const options = [
 *  // Set the 'width' attribute to the value of --some-css-variable to all elements with class 'blah'
 *  { query: `.blah`, variable: `some-css-variable`, attribute: `width` }
 *  // Set #blah's 'size' attribute to the value of css variable '--size'
 *  { id: 'blah', variable: 'size', attribute: 'size' }
 *  // Sets someEL.blah = css variable '--hue'
 *  { element: someEl, variable: `hue`, field: `blah` }
 * ]
 * 
 * setFromVariables(document.body, ...options);
 * ```
 * 
 * The first parameter is the context for which CSS variable values are fetched
 * as well as for resolving query selectors. This can usually be `document.body`.
 * @param context Context element which is needed for relative querying. Otherwise use document.body
 * @param options Details of what to do
 */
export const setFromVariables = (context: HTMLElement | string, ...options: Array<CssVariableOption>) => {
  const contextEl = resolveEl(context);
  const style = window.getComputedStyle(contextEl);

  for (const opt of options) {
    const variable = Text.afterMatch(opt.variable, `--`);
    let v = style.getPropertyValue(`--${ variable }`);
    if (v === null || v.length === 0) {
      if (opt.defaultValue === undefined) { continue; }
      else { v = opt.defaultValue; }
    }

    let query: string | undefined;
    let els;//: SVGElement | HTMLElement | null | undefined;
    if (`query` in opt && opt.query !== undefined) {
      query = opt.query;
    } else if (`id` in opt && opt.id !== undefined) {
      query = `#${ opt.id }`;
    } else if (`element` in opt && opt.element !== undefined) {
      els = Array.isArray(opt.element) ? opt.element : [ opt.element ];
    }
    if (query === undefined) {
      if (els === undefined) {
        throw new Error(`Missing query, id or element`);
      }
    } else {
      els = [ ...contextEl.querySelectorAll(query) ] as Array<Element>;// as SVGElement | HTMLElement | null | undefined;
    }
    if (els === null) continue;
    if (els === undefined) continue;
    if (opt.attribute) {
      for (const el of els) {
        (el as HTMLElement).setAttribute(opt.attribute, v);
      }
    } else if (opt.field) {
      for (const el of els) {
        (el as any)[ opt.field ] = v;
      }
    } else {
      throw new Error(`Neither 'attribute' or 'field' to set is defined in option (${ JSON.stringify(opt) })`);
    }
  }
}