import * as Text from "../Text.js"
import { resolveEl } from "./ResolveEl.js"
import { isHtmlElement } from "../dom/TsUtil.js";

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
export type CssVariableByObjectOption = CssVariable & {
  object: object | object[]
}

/**
 * CSS variable option
 */
export type CssVariableOption = CssVariable & (CssVariableByObjectOption | CssVariableByIdOption | CssVariableByQueryOption);

/**
 * Parses input in the form of: `['elementid-attribute', 'default-value']`.
 * Eg, `['indicator-fill', 'gray']` will yield:
 * ```
 * { variable: `indicator-fill`, attribute: `fill`, id: `indicator`, defaultValue: `gray` }
 * ```
 * 
 * Once parsed, use {@link setFromVariables} to apply data.
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
 * 
 *  // Set #blah's 'size' attribute to the value of css variable '--size'
 *  { id: 'blah', variable: 'size', attribute: 'size' }
 * 
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
    } else if (`object` in opt && opt.object !== undefined) {
      els = Array.isArray(opt.object) ? opt.object : [ opt.object ];
    }
    if (query === undefined) {
      // No query
      if (els === undefined) {
        // If there's no query or objects, there's nothing to do
        throw new Error(`Missing 'query', 'id' or 'object' fields`);
      }
    } else {
      // Run query
      els = [ ...contextEl.querySelectorAll(query) ] as Array<Element>;// as SVGElement | HTMLElement | null | undefined;
    }
    if (els === null) continue;
    if (els === undefined) continue;

    if (opt.attribute) {
      for (const el of els) {
        if (isHtmlElement(el)) {
          el.setAttribute(opt.attribute, v);
        } else {
          throw new Error(`Trying to set an attribute on something not a HTML element`, el);
        }
      }
    } else if (opt.field) {
      for (const el of els) {
        if (typeof el === `object`) {
          (el as any)[ opt.field ] = v;
        } else {
          throw new Error(`Trying to set field on something that is not an object (${ typeof el })`, el);
        }
      }
    } else {
      throw new Error(`Neither 'attribute' or 'field' to set is defined in option (${ JSON.stringify(opt) })`);
    }
  }
}


/**
 * Computes the styles for `elt` (or defaults to document.body) using `fallback`
 * as a set of default values.
 * 
 * ```js
 * // Fetch styles
 * const styles = getWithFallback({
 *  my_var: `red`
 * }, element);
 * 
 * // Access --my-var, or if it doesn't exist returns 'red'
 * styles.my_var;
 * ```
 * 
 * Hyphen case (eg 'my-var') is a common way of delimiting words in CSS variables, but 
 * can't be (elegantly) used in object properties. Instead, use '_' in the
 * object key, which is replaced with '-'.
 * 
 * The leading '--' is not needed either.
 * @param fallback 
 * @param elt 
 * @returns 
 */
export function getWithFallback<T extends Record<string, string | number>>(fallback: T, elt?: Element): T {
  const styles = getComputedStyle(elt ?? document.body);
  const entries = Object.entries(fallback);
  const filledEntries = entries.map(e => {
    return [ e[ 0 ], getFromStyles(styles, e[ 0 ], e[ 1 ]) ]
  })
  return Object.fromEntries(filledEntries) as T;
}

/**
 * Sets CSS variables.
 * ```js
 * const vars = {
 *  my_var: `red`,
 *  my_size: 10
 * }
 * 
 * // Set to document.body
 * setVariables(vars);
 * 
 * // Set to an element
 * setVariables(vars, elem);
 * 
 * // Or to a CSSStyleDeclaration
 * setVariables(vars, styles);
 * ```
 * @param vars 
 * @param stylesOrEl 
 */
export function setVariables<T extends Record<string, string | number>>(vars: T, stylesOrEl?: CSSStyleDeclaration | HTMLElement) {
  const styles = stylesOrEl === undefined ? document.body.style :
    isHtmlElement(stylesOrEl) ? stylesOrEl.style : stylesOrEl;

  for (const [ key, value ] of Object.entries(vars)) {
    let varName = key.replaceAll('_', '-');
    if (!varName.startsWith(`--`)) varName = `--` + varName;
    styles.setProperty(varName, value.toString());
  }
}

/**
 * Returns a CSS variable from a CSS style declaration, or returning `fallback`.
 * ```js
 * // These will all access --my-var
 * getFromStyles(getComputedStyle(element), `--my-var`, `red`);
 * getFromStyles(getComputedStyle(element), `my-var`, `red`);
 * getFromStyles(getComputedStyle(element), `my_var`, `red`);
 * ```
 * @param styles 
 * @param name 
 * @param fallback 
 * @returns 
 */
export function getFromStyles<T extends string | number>(styles: CSSStyleDeclaration, name: string, fallback: T): T {
  if (!name.startsWith(`--`)) name = `--` + name;
  name = name.replaceAll(`_`, `-`);

  const v = styles.getPropertyValue(name);
  if (v.length === 0) {
    return fallback;
  }
  if (typeof fallback === `number`) return parseFloat(v) as T;
  if (typeof fallback === `boolean`) {
    if (v === `true`) return (true as unknown as T);
    else if (v === `false`) return (false as unknown as T);
  }
  return v as T;
}
