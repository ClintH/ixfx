
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
  if (typeof domQueryOrEl === `string`) {
    const d = document.querySelector(domQueryOrEl);
    if (d === null) {
      const error = domQueryOrEl.startsWith(`#`) ? new Error(
        `Query '${ domQueryOrEl }' did not match anything. Try '#id', 'div', or '.class'`
      ) : new Error(
        `Query '${ domQueryOrEl }' did not match anything. Did you mean '#${ domQueryOrEl }?`
      );
      throw error;
    }
    domQueryOrEl = d as V;
  } else if (domQueryOrEl === null) {
    throw new Error(`domQueryOrEl ${ domQueryOrEl } is null`);
  } else if (domQueryOrEl === undefined) {
    throw new Error(`domQueryOrEl ${ domQueryOrEl } is undefined`);
  }
  const el = domQueryOrEl;
  return el;
};

export type QueryOrElements = string | Array<Element> | Array<HTMLElement> | HTMLElement | Element

export const resolveEls = (selectors: QueryOrElements): Array<HTMLElement> => {
  if (selectors === undefined) return [];
  if (selectors === null) return [];
  if (Array.isArray(selectors)) return selectors as Array<HTMLElement>;
  if (typeof selectors === `string`) {
    const elements = [ ...document.querySelectorAll(selectors) ]
    return elements as Array<HTMLElement>
  }
  return [ selectors as HTMLElement ];
}