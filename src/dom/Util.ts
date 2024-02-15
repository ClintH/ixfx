//import { Observable, debounceTime, fromEvent } from 'rxjs';
import * as Points from '../geometry/point/index.js';
import JSON5 from 'json5';
import type { CardinalDirection } from '../geometry/Grid.js';
import { cardinal } from '../geometry/rect/index.js';
import type { Point } from '../geometry/point/index.js';
import { resolveEl, resolveEls, type QueryOrElements } from './ResolveEl.js';

export type PointSpaces = `viewport` | `screen` | `document`;

/**
 * Convert an absolute point to relative, in different coordinate spaces.
 *
 * When calling the returned function, the input value must be in the same
 * scale as the intended output scale.
 *
 * Viewport-relative is used by default.
 *
 * @example Get relative position of click in screen coordinates
 * ```js
 * const f = pointScaler({ to: 'screen' });
 * document.addEventListener('click', evt => {
 *  const screenRelative = f(evt.screenX, evt.screenY);
 *  // Yields {x,y} on 0..1 scale
 * });
 * ```
 *
 * @example Get relative position of click in viewport coordinates
 * ```js
 * const f = pointScaler({ to: 'viewport' });
 * document.addEventListener('click', evt => {
 *  const viewportRelative = f(evt.clientX, evt.clientY);
 *  // Yields {x,y} on 0..1 scale
 * });
 * ```
 *
 * @example Get relative position of click in document coordinates
 * ```js
 * const f = pointScaler({ to: 'document' });
 * document.addEventListener('click', evt => {
 *  const documentRelative = f(evt.pageX, evt.pageY);
 *  // Yields {x,y} on 0..1 scale
 * });
 * ```
 *
 * @param opts
 * @returns
 */
export const pointScaler = (reference: PointSpaces = `viewport`) => {
  switch (reference) {
    case `viewport`: {
      return (a: Readonly<Point | number | Array<number>>, b?: number) => {
        const pt = Points.getPointParameter(a, b);
        return Object.freeze({
          x: pt.x / window.innerWidth,
          y: pt.y / window.innerHeight,
        });
      };
    }
    case `screen`: {
      return (a: Readonly<Point | number | Array<number>>, b?: number) => {
        const pt = Points.getPointParameter(a, b);
        return Object.freeze({
          x: pt.x / screen.width,
          y: pt.y / screen.height,
        });
      };
    }
    case `document`: {
      return (a: Readonly<Point | number | Array<number>>, b?: number) => {
        const pt = Points.getPointParameter(a, b);
        return Object.freeze({
          x: pt.x / document.body.scrollWidth,
          y: pt.y / document.body.scrollHeight,
        });
      };
    }
    default: {
      throw new Error(
        `Unknown 'reference' parameter: ${ JSON.stringify(reference) }`
      );
    }
  }
};

export type ElPositionOpts = {
  readonly target?: PointSpaces;
  readonly relative?: boolean;
  readonly anchor?: CardinalDirection | `center`;
};

/**
 * Returns a function which yields element position in target coordinate space with optional scaling.
 * Live position is calculated when the function is invoked.
 * Use {@link positionRelative} to simply get relative position of element in given coordinate space.
 *
 * @example Absolute position of #blah in viewport coordinate space
 * ```js
 * const f = positionFn('#blah');
 * f(); // Yields: {x,y}
 * // Or:
 * positionFn('#blah')(); // Immediately invoke
 * ```
 *
 * @example Relative position of element in viewport-space
 * ```js
 * const f = positionFn(evt.target, { relative: true });
 * f(); // Yields: {x,y}
 * ```
 *
 * @example Relative position of #blah in screen-space
 * ```js
 * const f = positionFn('#blah', { target: 'screen', relative: true });
 * f(); // Yields: {x,y}
 * ```
 *
 * By default, top-left corner (north west) is used. Other cardinal points or 'center' can be specified:
 * ```js
 * // Relative position by center
 * positionFn('#blah', { relative: true, anchor: 'center' });
 *
 * // ...by bottom-right corner
 * positionFn('#blah', { relative: true, anchor: 'se' });
 * ```
 *
 * This function is useful if you have a stable DOM element and conversion target.
 * If the DOM element is changing continually, consider using {@link viewportToSpace} to
 * convert from viewport coordinates to target coordinates:
 *
 * ```js
 * // Eg.1 Absolute coords in screen space
 * const vpToScreen = viewportToSpace('screen');
 * vpToScreen(el.getBoundingClientRect());
 *
 * // Eg.2 Relative coords in viewport space
 * const vpRelative = pointScaler(); // Re-usable scaler. Default uses viewport
 * vpRelative(el.getBoundingClientRect()); // Yields: { x,y }
 *
 * // Eg.3 Relative coords in screen space
 * const vpToScreen = viewportToSpace('screen'); // Map viewport->screen
 * const screenRelative = pointScaler('screen'); // Scale screen units
 *
 * // Combine into a resuable function that takes an element
 * const mapAndScale = (el) => screenRelative(vpToScreen(el.getBoundingClientRect()));
 *
 * // Call
 * mapAndScale(document.getElementById('blah')); // Yields: { x,y }
 * ```
 * @param domQueryOrEl
 * @param coordinateSpace
 * @param scaled
 * @returns
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
export const positionFn = (
  domQueryOrEl: Readonly<string | HTMLElement>,
  opts: ElPositionOpts = {}
): (() => Point) => {
  const targetSpace = opts.target ?? `viewport`;
  const relative = opts.relative ?? false;
  const anchor = opts.anchor ?? `nw`;

  const el = resolveEl(domQueryOrEl);
  const vpToSpace = viewportToSpace(targetSpace);

  if (relative) {
    const s = pointScaler(targetSpace);
    return () => s(vpToSpace(cardinal(el.getBoundingClientRect(), anchor)));
  } else {
    return () => vpToSpace(cardinal(el.getBoundingClientRect(), anchor));
  }
};

/**
 * Returns a {x,y} Point on a cardinal position of element.
 * ```
 * // Top edge, middle horizontal position
 * const pos = cardinalPosition(`#blah`, `n`);
 * ```
 * @param domQueryOrEl 
 * @param anchor 
 * @returns 
 */
export const cardinalPosition = (
  domQueryOrEl: Readonly<string | HTMLElement>,
  anchor: CardinalDirection | `center` = `nw`
): Point => {
  const el = resolveEl(domQueryOrEl);
  return cardinal(el.getBoundingClientRect(), anchor);
};
/**
 * Returns relative position of element in target coordinate space, or viewport by default.
 * Relative means that { x:0.5, y: 0.5 } is the middle of the target space. Eg for viewport, that means its the middle of the browser window.
 * ```js
 * // These all yield { x, y }
 * elPositionRelative('#blah');
 * elPositionRelative(evt.target, 'screen');
 * ```
 * @param domQueryOrEl DOM query or element
 * @param target Target coordinate space, or viewport by default
 * @returns Point
 */
export const positionRelative = (
  domQueryOrEl: Readonly<string | HTMLElement>,
  target: PointSpaces = `viewport`
): Point => {
  const f = positionFn(domQueryOrEl, { relative: true, target });
  return f();
};

/**
 * Returns a function that converts input viewport coordinate space
 * to an output coordinate space.
 *
 * ```js
 * // f() will convert from viewport to document coordinate space
 * const f = viewportToSpace('document');
 *
 * // {x:100,y:100} is viewport coordinate space
 * f(100,100); // Yields: { x, y } converted to document space
 * ```
 *
 * Or immediately invoke for one-off use:
 * ```js
 * viewportToSpace('document')(100,100); // Yields: { x, y }
 * ```
 * @param targetSpace
 * @returns
 */
export const viewportToSpace = (targetSpace: PointSpaces = `viewport`) => {
  switch (targetSpace) {
    case `screen`: {
      return (a: Readonly<Point | Array<number> | number>, b?: number) => {
        const pt = Points.getPointParameter(a, b);
        return Object.freeze({
          x: pt.x + window.screenX,
          y: pt.y + window.screenY,
        });
      };
    }
    case `document`: {
      return (a: Readonly<Point | Array<number> | number>, b?: number) => {
        const pt = Points.getPointParameter(a, b);
        return Object.freeze({
          x: pt.x + window.scrollX,
          y: pt.y + window.scrollY,
        });
      };
    }
    case `viewport`: {
      return (a: Readonly<Point | Array<number> | number>, b?: number) => {
        const pt = Points.getPointParameter(a, b);
        return Object.freeze({
          x: pt.x,
          y: pt.y,
        });
      };
    }
    default: {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Unexpected target coordinate space: ${ targetSpace }. Expected: viewport, document or screen`
      );
    }
  }
};

/**
 * Position element by relative coordinate. Relative to window dimensions by default
 * @param element DOM element to position, or query
 * @param relativePos Window-relative coordinate. 0.5/0.5 is middle of window.
 */
export const positionFromMiddle = (
  domQueryOrEl: string | HTMLElement,
  relativePos: Point,
  relativeTo: `window` | `screen` = `window`
) => {
  if (!domQueryOrEl) throw new Error(`domQueryOrEl is null or undefined`);
  const el = resolveEl<HTMLElement>(domQueryOrEl);

  // Convert relative to absolute units
  const absPosition = Points.multiply(
    relativePos,
    window.innerWidth,
    window.innerHeight
  );

  const thingRect = el.getBoundingClientRect();
  const offsetPos = Points.subtract(
    absPosition,
    thingRect.width / 2,
    thingRect.height / 2
  );

  // Apply via CSS
  el.style.transform = `translate(${ offsetPos.x }px, ${ offsetPos.y }px)`;
};







/**
 * Given an array of class class names, this will cycle between them each time
 * it is called.
 *
 * Eg, assume `list` is: [ `a`, `b`, `c` ]
 *
 * If `el` already has the class `a`, the first time it is called, class `a`
 * is removed, and `b` added. The next time `b` is swapped for `c`. Once again,
 * `c` will swap with `a` and so on.
 *
 * If `el` is undefined or null, function silently returns.
 * @param el Element
 * @param list List of class names
 * @returns
 */
export const cycleCssClass = (
  el: Readonly<HTMLElement>,
  list: ReadonlyArray<string>
) => {
  if (el === null || !el) return;
  if (!Array.isArray(list)) {
    throw new TypeError(`List should be an array of strings`);
  }

  for (let index = 0; index < list.length; index++) {
    if (el.classList.contains(list[ index ])) {
      el.classList.remove(list[ index ]);
      if (index + 1 < list.length) {
        el.classList.add(list[ index + 1 ]);
      } else {
        el.classList.add(list[ 0 ]);
      }
      return;
    }
  }
  el.classList.add(list[ 0 ]);
};



/**
 * Source: https://zellwk.com/blog/translate-in-javascript
 * @param domQueryOrEl
 */
export const getTranslation = (
  domQueryOrEl: Readonly<string | HTMLElement>
): Point => {
  // Source:
  // https://raw.githubusercontent.com/zellwk/javascript/master/src/browser/dom/translate-values.js

  const el = resolveEl<HTMLElement>(domQueryOrEl);
  const style = window.getComputedStyle(el);
  const matrix = style.transform;

  // No transform property. Simply return 0 values.
  if (matrix === `none` || typeof matrix === `undefined`) {
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  // Can either be 2d or 3d transform
  const matrixType = matrix.includes(`3d`) ? `3d` : `2d`;
  // @ts-expect-error
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)[ 1 ].split(`, `);

  // 2d Matrixes have 6 values
  // Last 2 values are X and Y.
  // 2d Matrixes does not have Z value.
  if (matrixType === `2d`) {
    return {
      x: Number.parseFloat(matrixValues[ 4 ]),
      y: Number.parseFloat(matrixValues[ 5 ]),
      z: 0,
    };
  }

  // 3d Matrixes have 16 values
  // The 13th, 14th, and 15th values are X, Y, and Z
  if (matrixType === `3d`) {
    return {
      x: Number.parseFloat(matrixValues[ 12 ]),
      y: Number.parseFloat(matrixValues[ 13 ]),
      z: Number.parseFloat(matrixValues[ 14 ]),
    };
  }

  return { x: 0, y: 0, z: 0 };
};


/**
 * Creates an element after `sibling`
 * ```
 * const el = createAfter(siblingEl, `DIV`);
 * ```
 * @param sibling Element
 * @param tagName Element to create
 * @returns New element
 */
export const createAfter = (
  sibling: Readonly<HTMLElement>,
  tagName: string
): HTMLElement => {
  const el = document.createElement(tagName);
  sibling.parentElement?.insertBefore(el, sibling.nextSibling);
  return el;
};

/**
 * Creates an element inside of `parent`
 * ```
 * const newEl = createIn(parentEl, `DIV`);
 * ```
 * @param parent Parent element
 * @param tagName Tag to create
 * @returns New element
 */
export const createIn = (
  parent: Readonly<HTMLElement>,
  tagName: string
): HTMLElement => {
  const el = document.createElement(tagName);
  parent.append(el);
  return el;
};

/**
 * Remove all child nodes from `parent`
 * @param parent
 */
export const clear = (parent: Readonly<HTMLElement>) => {
  let c = parent.lastElementChild;

  while (c) {
    c.remove();
    c = parent.lastElementChild;
  }
};


/**
 * Copies string representation of object to clipboard
 * @param obj
 * @returns Promise
 */
export const copyToClipboard = (object: object) => {
  const p = new Promise((resolve, reject) => {
    //const json = JSON.stringify(obj, null, 2);
    const string_ = JSON5.stringify(object);
    navigator.clipboard.writeText(JSON.stringify(string_)).then(
      () => {
        resolve(true);
      },
      (error) => {
        console.warn(`Could not copy to clipboard`);
        console.log(string_);
        reject(new Error(error));
      }
    );
  });
  return p;
};

/**
 * Inserts `element` into `parent` sorted according to its HTML attribute `data-sort`.
 * 
 * Assumes:
 * * Every child of `parent` and `element`, has a `data-sort` attribute. This is the basis for sorting.
 * * `parent` starts off empty or pre-sorted.
 * * Order of `parent`'s children is not changed (ie it always remains sorted)
 * @param parent 
 * @param element 
 */
export const insertSorted = (parent: HTMLElement, element: HTMLElement) => {
  const elSort = element.getAttribute(`data-sort`) ?? ``;
  let elAfter;
  let elBefore;
  for (const c of parent.children) {
    const sort = c.getAttribute(`data-sort`) ?? ``;
    if (elSort >= sort) elAfter = c;
    if (elSort <= sort) elBefore = c;
    if (elAfter !== undefined && elBefore !== undefined) break;
  }
  if (elAfter !== undefined) {
    elAfter.insertAdjacentElement(`afterend`, element);
  } else if (elBefore === undefined) {
    parent.append(element);
  } else {
    elBefore.insertAdjacentElement(`beforebegin`, element);
  }
}

export type CreateUpdateElement<V> = (
  item: V,
  //eslint-disable-next-line functional/prefer-readonly-type
  el: HTMLElement | null
) => HTMLElement;

export const reconcileChildren = <V>(
  parentEl: HTMLElement,
  //eslint-disable-next-line functional/prefer-readonly-type
  list: Map<string, V>,
  createUpdate: CreateUpdateElement<V>
) => {
  if (parentEl === null) throw new Error(`parentEl is null`);
  if (parentEl === undefined) throw new Error(`parentEl is undefined`);

  const seen = new Set<string>();

  for (const [ key, value ] of list) {
    const id = `c-${ key }`;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const el = parentEl.querySelector(`#${ id }`);
    const finalEl = createUpdate(value, el as HTMLElement);
    if (el !== finalEl) {
      finalEl.id = id;
      parentEl.append(finalEl);
    }
    seen.add(id);
  }

  const prune: Array<HTMLElement> = [];
  for (const child of parentEl.children) {
    if (!seen.has(child.id)) {
      prune.push(child as HTMLElement);
    }
  }

  // for (let index = 0; index < parentEl.children.length; index++) {
  //   const c = parentEl.children[ index ] as HTMLElement;
  //   if (!seen.has(c.id)) {
  //     prune.push(c);
  //   }
  // }

  for (const p of prune) p.remove();
};

/**
 * Adds `cssClass` to element(s) if `value` is true.
 * ```js
 * setClass(`#someId`, true, `activated`);
 * ```
 * @param query 
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

/**
 * Gets a HTML element by id, throwing an error if not found
 * @param id 
 * @returns 
 */
export const byId = <V extends HTMLElement>(id: string): HTMLElement => {
  // eslint-disable-next-line unicorn/prefer-query-selector
  const element = document.getElementById(id);
  if (element === null) throw new Error(`HTML element with id '${ id }' not found`);
  return element as V;
}



export const setHtml = (selectors: QueryOrElements, value: string | number) => {
  const elements = resolveEls(selectors);
  if (elements.length === 0) return;
  if (typeof value === `number`) {
    value = value.toString();
  }
  for (const element of elements) {
    element.innerHTML = value;
  }
};

export const setText = (selectors: QueryOrElements, value: string | number) => {
  const elements = resolveEls(selectors);
  if (elements.length === 0) return;
  if (typeof value === `number`) {
    value = value.toString();
  }
  for (const element of elements) {
    element.textContent = value;
  }
};

export const elRequery = (selectors: string) => {
  ({
    text: (value: string | number) => { setText(selectors, value); },
    html: (value: string | number) => { setHtml(selectors, value); },
    cssDisplay: (value: string) => { setCssDisplay(selectors, value); },
    cssClass: (value: boolean, cssClass: string) => { setCssClass(selectors, value, cssClass); },
    cssToggle: (cssClass: string) => { setCssToggle(selectors, cssClass); },
    el: () => resolveEl(selectors),
    els: () => resolveEls(selectors)
  });
}

export const el = (selectors: QueryOrElements) => {
  const elements = resolveEls(selectors);
  return {
    text: (value: string | number) => { setText(elements, value); },
    html: (value: string | number) => { setHtml(elements, value); },
    cssDisplay: (value: string) => { setCssDisplay(elements, value); },
    cssClass: (value: boolean, cssClass: string) => { setCssClass(elements, value, cssClass); },
    cssToggle: (cssClass: string) => { setCssToggle(elements, cssClass); },
    el: () => elements[ 0 ],
    els: () => elements
  }
}