/**
 * Creates an element of `type` and with `id` (if specified)
 * @param type Element type, eg `circle`
 * @param id Optional id to assign to element
 * @returns Element
 */
export const createEl = <V extends SVGElement>(
  type: string,
  id?: string
): V => {
  const m = document.createElementNS(`http://www.w3.org/2000/svg`, type) as V;
  if (id) {
    m.id = id;
  }
  return m;
};


/**
 * Creates and appends a SVG element.
 *
 * ```js
 * // Create a circle
 * const circleEl = createOrResolve(parentEl, `SVGCircleElement`);
 * ```
 *
 * If `queryOrExisting` is specified, it is used as a query to find an existing element. If
 * query starts with `#`, this will be set as the element id, if created.
 *
 * ```js
 * // Creates an element with id 'myCircle' if it doesn't exist
 * const circleEl = createOrResolve(parentEl, `SVGCircleElement`, `#myCircle`);
 * ```
 * @param parent Parent element
 * @param type Type of SVG element
 * @param queryOrExisting Query, eg `#id`
 * @returns
 */
export const createOrResolve = <V extends SVGElement>(
  parent: SVGElement,
  type: string,
  queryOrExisting?: string | V,
  suffix?: string
): V => {
  let existing:SVGElement|HTMLElement|null = null;
  if (queryOrExisting !== undefined) {
    existing = typeof queryOrExisting === `string` ? parent.querySelector(queryOrExisting) : queryOrExisting;
  }
  if (existing === null) {
    const p = document.createElementNS(`http://www.w3.org/2000/svg`, type) as V;
    parent.append(p);
    if (queryOrExisting && typeof queryOrExisting === `string` &&
      queryOrExisting.startsWith(`#`)) {
      p.id = suffix !== undefined && !queryOrExisting.endsWith(suffix) ? queryOrExisting.slice(1) + suffix : queryOrExisting.slice(1);
    }
    return p;
  }
  return existing as V;
};