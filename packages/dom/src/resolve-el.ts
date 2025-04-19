import { resultToError, type Result } from "@ixfx/core";

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

export const resolveElementTry = <V extends Element>(domQueryOrEl: string | V | null | undefined): Result<V> => {
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