/**
 * Removes an SVG element from a parent
 * @param parent Parent
 * @param queryOrExisting Query or existing element 
 * @returns 
 */
export const remove = <V extends SVGElement>(
  parent: SVGElement,
  queryOrExisting: string | V
) => {
  if (typeof queryOrExisting === `string`) {
    const elem = parent.querySelector(queryOrExisting);
    if (elem === null) return;
    elem.remove();
  } else {
    queryOrExisting.remove();
  }
};

/**
 * Removes all children of `parent`, but not `parent` itself.
 * @param parent 
 */
export const clear = (parent: SVGElement) => {
  let c = parent.lastElementChild;
  while (c) {
    c.remove();
    c = parent.lastElementChild;
  }
};