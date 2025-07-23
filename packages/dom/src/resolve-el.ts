import { resultToError, type Result } from "@ixfx/guards";

/**
 * Resolves either a string or HTML element to an element.
 * Useful when an argument is either an HTML element or query.
 *
 * ```js
 * resolveEl(`#someId`);
 * resolveEl(someElement);
 * ```
 * @param domQueryOrEl
 * @returns
 */
export const resolveEl = <V extends Element>(domQueryOrEl: string | V | null | undefined): V => {
  const r = resolveElementTry(domQueryOrEl);
  if (r.success) return r.value;
  throw resultToError(r);
}

/**
 * Tries to resolve a query, returning a `Result`.
 * 
 * ```js
 * const { success, value, error } = resolveElementTry(`#some-element`);
 * if (success) {
 *  // Do something with value
 * } else {
 *  console.error(error);
 * }
 * ```
 * @param domQueryOrEl 
 * @returns 
 */
export const resolveElementTry = <V extends Element>(domQueryOrEl: string | V | null | undefined): Result<V, string> => {
  if (typeof domQueryOrEl === `string`) {
    const d = document.querySelector(domQueryOrEl);
    if (d === null) {
      const error = domQueryOrEl.startsWith(`#`) ? `Query '${ domQueryOrEl }' did not match anything. Try '#id', 'div', or '.class'`
        : `Query '${ domQueryOrEl }' did not match anything. Did you mean '#${ domQueryOrEl }?`;
      return { success: false, error };

    }
    domQueryOrEl = d as V;
  } else if (domQueryOrEl === null) {
    return { success: false, error: `Param 'domQueryOrEl' is null` };
  } else if (domQueryOrEl === undefined) {
    return { success: false, error: `Param 'domQueryOrEl' is undefined` };
  }
  const el = domQueryOrEl;
  return { success: true, value: el };
};

export type QueryOrElements = string | Element[] | HTMLElement[] | HTMLElement | Element

/**
 * Returns a set of elements.
 * 
 * Returns an empty list if `selectors` is undefined or null.
 * 
 * @param selectors 
 * @returns 
 */
export const resolveEls = (selectors: QueryOrElements): HTMLElement[] => {
  if (selectors === undefined) return [];
  if (selectors === null) return [];
  if (Array.isArray(selectors)) return selectors as HTMLElement[];
  if (typeof selectors === `string`) {
    const elements = [ ...document.querySelectorAll(selectors) ]
    return elements as HTMLElement[]
  }
  return [ selectors as HTMLElement ];
}