import { Observable, debounceTime, fromEvent } from 'rxjs';
import * as Points from '../geometry/Point.js';
import JSON5 from 'json5';
import { Rects, Scaler } from '../geometry/index.js';
import type { CardinalDirection } from '../geometry/Grid.js';
import { cardinal } from '../geometry/Rect.js';

export type ElementResizeArgs<V extends HTMLElement | SVGSVGElement> = {
  readonly el: V;
  readonly bounds: {
    readonly width: number;
    readonly height: number;
    readonly center: Points.Point;
    readonly min: number;
    readonly max: number;
  };
};

export type CanvasResizeArgs = ElementResizeArgs<HTMLCanvasElement> & {
  readonly ctx: CanvasRenderingContext2D;
};

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
  if (reference === `viewport`) {
    return (a: Readonly<Points.Point | number | number[]>, b?: number) => {
      const pt = Points.getPointParam(a, b);
      return Object.freeze({
        x: pt.x / window.innerWidth,
        y: pt.y / window.innerHeight,
      });
    };
  } else if (reference === `screen`) {
    return (a: Readonly<Points.Point | number | number[]>, b?: number) => {
      const pt = Points.getPointParam(a, b);
      return Object.freeze({
        x: pt.x / screen.width,
        y: pt.y / screen.height,
      });
    };
  } else if (reference === `document`) {
    return (a: Readonly<Points.Point | number | number[]>, b?: number) => {
      const pt = Points.getPointParam(a, b);
      return Object.freeze({
        x: pt.x / document.body.scrollWidth,
        y: pt.y / document.body.scrollHeight,
      });
    };
  } else {
    throw new Error(
      `Unknown 'reference' parameter: ${JSON.stringify(reference)}`
    );
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
export const positionFn = (
  domQueryOrEl: Readonly<string | HTMLElement>,
  opts: ElPositionOpts = {}
): (() => Points.Point) => {
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

export const cardinalPosition = (
  domQueryOrEl: Readonly<string | HTMLElement>,
  anchor: CardinalDirection | `center` = `nw`
): Points.Point => {
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
): Points.Point => {
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
    case `screen`:
      return (a: Readonly<Points.Point | number[] | number>, b?: number) => {
        const pt = Points.getPointParam(a, b);
        return Object.freeze({
          x: pt.x + window.screenX,
          y: pt.y + window.screenY,
        });
      };
    case `document`:
      return (a: Readonly<Points.Point | number[] | number>, b?: number) => {
        const pt = Points.getPointParam(a, b);
        return Object.freeze({
          x: pt.x + window.scrollX,
          y: pt.y + window.scrollY,
        });
      };
    case `viewport`:
      return (a: Readonly<Points.Point | number[] | number>, b?: number) => {
        const pt = Points.getPointParam(a, b);
        return Object.freeze({
          x: pt.x,
          y: pt.y,
        });
      };
    default:
      throw new Error(
        `Unexpected target coordinate space: ${targetSpace}. Expected: viewport, document or screen`
      );
  }
};

/**
 * Position element by relative coordinate. Relative to window dimensions by default
 * @param element DOM element to position, or query
 * @param relativePos Window-relative coordinate. 0.5/0.5 is middle of window.
 */
export const positionFromMiddle = (
  domQueryOrEl: string | HTMLElement,
  relativePos: Points.Point,
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
  el.style.transform = `translate(${offsetPos.x}px, ${offsetPos.y}px)`;
};

export const fullSizeElement = <V extends HTMLElement>(
  domQueryOrEl: string | V,
  onResized?: (args: ElementResizeArgs<V>) => void
) => {
  const el = resolveEl<V>(domQueryOrEl);

  const r = windowResize();
  const update = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    el.setAttribute(`width`, width.toString());
    el.setAttribute(`height`, height.toString());

    if (onResized !== undefined) {
      const bounds = {
        min: Math.min(width, height),
        max: Math.max(width, height),
        width,
        height,
        center: {
          x: width / 2,
          y: height / 2,
        },
      };
      onResized({ el, bounds });
    }
  };
  r.subscribe(update);

  update();
  return r;
};

export type CanvasOpts = {
  readonly skipCss?: boolean;
  readonly fullSize?: boolean;
  readonly scaleBy?: `both` | `width` | `height` | `min` | `max`;
};

export const canvasHelper = (
  domQueryOrEl: Readonly<string | HTMLCanvasElement | undefined | null>,
  opts: CanvasOpts
) => {
  if (!domQueryOrEl) throw new Error(`domQueryOrEl is null or undefined`);
  const el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
  if (el.nodeName !== `CANVAS`) {
    throw new Error(`Expected CANVAS HTML element. Got: ${el.nodeName}`);
  }
  const fullSize = opts.fullSize ?? true;
  const ratio = Math.round(window.devicePixelRatio) || 1;
  const scaleBy = opts.scaleBy ?? `both`;

  //eslint-disable-next-line functional/no-let
  let scaler: Scaler.Scaler = Scaler.scaler(`both`);

  const updateDimensions = (rect: Rects.Rect) => {
    // Create a new scaler
    scaler = Scaler.scaler(scaleBy, rect);

    const pixelScaled = Rects.multiply(rect, ratio, ratio);

    //eslint-disable-next-line functional/immutable-data
    el.width = pixelScaled.width;
    //eslint-disable-next-line functional/immutable-data
    el.height = pixelScaled.height;

    //eslint-disable-next-line functional/immutable-data
    el.style.width = rect.width + `px`;
    //eslint-disable-next-line functional/immutable-data
    el.style.height = rect.height + `px`;
  };

  // Window has resized
  const onWindowResize = () => {
    const innerWindow = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    updateDimensions(innerWindow);
  };

  const getContext = () => {
    const ctx = el.getContext(`2d`);
    if (ctx === null) throw new Error(`Could not create drawing context`);

    ctx.scale(ratio, ratio);
  };

  if (fullSize) {
    const r = windowResize();
    r.subscribe(onWindowResize);
  }

  return {
    abs: scaler.abs,
    rel: scaler.rel,
    getContext,
  };
};

/**
 * Resizes given canvas element to match window size.
 * To resize canvas to match its parent, use {@link parentSizeCanvas}.
 *
 * To make the canvas appear propery, it sets the following CSS:
 * ```css
 * {
 *  top: 0;
 *  left: 0;
 *  zIndex: -1;
 *  position: fixed;
 * }
 * ```
 * Pass _true_ for `skipCss` to avoid this.
 *
 * Provide a callback for when resize happens.
 * @param domQueryOrEl Query string or reference to canvas element
 * @param onResized Callback for when resize happens, eg for redrawing canvas
 * @param skipCss if true, style are not added
 * @returns Observable
 */
export const fullSizeCanvas = (
  domQueryOrEl: Readonly<string | HTMLCanvasElement | undefined | null>,
  onResized?: (args: CanvasResizeArgs) => void,
  skipCss = false
) => {
  if (domQueryOrEl === null || domQueryOrEl === undefined) {
    throw new Error(`domQueryOrEl is null or undefined`);
  }
  const el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
  if (el.nodeName !== `CANVAS`) {
    throw new Error(
      `Expected HTML element with node name CANVAS, not ${el.nodeName}`
    );
  }
  const ctx = el.getContext(`2d`);
  if (ctx === null) throw new Error(`Could not create drawing context`);

  const update = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    //eslint-disable-next-line functional/immutable-data
    el.width = width;
    //eslint-disable-next-line functional/immutable-data
    el.height = height;

    if (onResized !== undefined) {
      const bounds = {
        min: Math.min(width, height),
        max: Math.max(width, height),
        width,
        height,
        center: { x: width / 2, y: height / 2 },
      };
      onResized({ ctx, el, bounds });
    }
  };

  // Setup
  if (!skipCss) {
    //eslint-disable-next-line functional/immutable-data
    el.style.top = `0`;
    //eslint-disable-next-line functional/immutable-data
    el.style.left = `0`;
    //eslint-disable-next-line functional/immutable-data
    el.style.zIndex = `-100`;
    //eslint-disable-next-line functional/immutable-data
    el.style.position = `fixed`;
  }

  const r = windowResize();
  r.subscribe(update);

  update();
  return r;
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
  list: readonly string[]
) => {
  if (el === null || !el) return;
  if (!Array.isArray(list)) {
    throw new Error(`List should be an array of strings`);
  }
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < list.length; i++) {
    if (el.classList.contains(list[i])) {
      el.classList.remove(list[i]);
      if (i + 1 < list.length) {
        el.classList.add(list[i + 1]);
      } else {
        el.classList.add(list[0]);
      }
      return;
    }
  }
  el.classList.add(list[0]);
};

/**
 * Sets width/height atributes on the given element according to the size of its parent.
 * @param domQueryOrEl Elememnt to resize
 * @param onResized Callback when resize happens
 * @param timeoutMs Timeout for debouncing events
 * @returns
 */
export const parentSize = <V extends HTMLElement | SVGSVGElement>(
  domQueryOrEl: string | V,
  onResized?: (args: ElementResizeArgs<V>) => void,
  timeoutMs: number = 100
) => {
  const el = resolveEl<V>(domQueryOrEl);
  const parent = el.parentElement;
  if (parent === null) throw new Error(`Element has no parent`);

  const ro = resizeObservable(parent, timeoutMs).subscribe(
    (entries: readonly ResizeObserverEntry[]) => {
      const e = entries.find((v) => v.target === parent);
      if (e === undefined) return;

      const width = e.contentRect.width;
      const height = e.contentRect.height;

      el.setAttribute(`width`, width + `px`);
      el.setAttribute(`height`, height + `px`);
      if (onResized !== undefined) {
        const bounds = {
          min: Math.min(width, height),
          max: Math.max(width, height),
          width,
          height,
          center: { x: width / 2, y: height / 2 },
        };
        onResized({ el, bounds });
      }
    }
  );

  return ro;
};

/**
 * Source: https://zellwk.com/blog/translate-in-javascript
 * @param domQueryOrEl
 */
export const getTranslation = (
  domQueryOrEl: Readonly<string | HTMLElement>
): Points.Point => {
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
  // @ts-ignore
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(`, `);

  // 2d Matrixes have 6 values
  // Last 2 values are X and Y.
  // 2d Matrixes does not have Z value.
  if (matrixType === `2d`) {
    return {
      x: parseFloat(matrixValues[4]),
      y: parseFloat(matrixValues[5]),
      z: 0,
    };
  }

  // 3d Matrixes have 16 values
  // The 13th, 14th, and 15th values are X, Y, and Z
  if (matrixType === `3d`) {
    return {
      x: parseFloat(matrixValues[12]),
      y: parseFloat(matrixValues[13]),
      z: parseFloat(matrixValues[14]),
    };
  }

  return { x: 0, y: 0, z: 0 };
};

/**
 * Resizes given canvas to its parent element.
 * To resize canvas to match the viewport, use {@link fullSizeCanvas}.
 *
 * Provide a callback for when resize happens.
 * @param domQueryOrEl Query string or reference to canvas element
 * @param onResized Callback for when resize happens, eg for redrawing canvas
 * @returns Observable
 */
export const parentSizeCanvas = (
  domQueryOrEl: Readonly<string | HTMLCanvasElement>,
  onResized?: (args: CanvasResizeArgs) => void,
  timeoutMs: number = 100
) => {
  const el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
  if (el.nodeName !== `CANVAS`) {
    throw new Error(
      `Expected HTML element with node name CANVAS, not ${el.nodeName}`
    );
  }
  const parent = el.parentElement;
  if (parent === null) throw new Error(`Element has no parent`);

  const ctx = (el as HTMLCanvasElement).getContext(`2d`);
  if (ctx === null) throw new Error(`Could not create drawing context`);

  //const safetyMargin = 4;

  //eslint-disable-next-line functional/immutable-data
  el.style.width = `100%`;
  //eslint-disable-next-line functional/immutable-data
  el.style.height = `100%`;

  //console.log('parent height: ' + parent.getBoundingClientRect().height);
  //console.log(`parent offset Height: ${parent.offsetHeight}`);

  const ro = resizeObservable(parent, timeoutMs).subscribe(
    (entries: readonly ResizeObserverEntry[]) => {
      const e = entries.find((v) => v.target === parent);
      if (e === undefined) return;

      const width = e.contentRect.width;
      const height = e.contentRect.height;
      //console.log(`contentH: ${e.contentRect.height} current: ${el.getBoundingClientRect().height}`);

      // el.setAttribute(`width`, width-safetyMargin + `px`);
      // el.setAttribute(`height`, height-safetyMargin + `px`);
      el.setAttribute(`width`, el.offsetWidth + `px`);
      el.setAttribute(`height`, el.offsetHeight + `px`);

      if (onResized !== undefined) {
        const bounds = {
          min: Math.min(width, height),
          max: Math.max(width, height),
          width,
          height,
          center: { x: width / 2, y: height / 2 },
        };
        onResized({ ctx, el, bounds });
      }
    }
  );

  return ro;
};

/**
 * Returns an Observable for window resize. Default 100ms debounce.
 * @param timeoutMs
 * @returns
 */
export const windowResize = (timeoutMs: number = 100) =>
  fromEvent(window, `resize`).pipe(debounceTime(timeoutMs));

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
export const resolveEl = <V extends Element>(domQueryOrEl: string | V): V => {
  if (typeof domQueryOrEl === `string`) {
    const d = document.querySelector(domQueryOrEl);
    if (d === null) {
      if (!domQueryOrEl.startsWith(`#`)) {
        throw new Error(
          `Query '${domQueryOrEl}' did not match anything. Did you mean '#${domQueryOrEl}?`
        );
      } else {
        throw new Error(
          `Query '${domQueryOrEl}' did not match anything. Try '#id', 'div', or '.class'`
        );
      }
    }
    domQueryOrEl = d as V;
  } else if (domQueryOrEl === null) {
    throw new Error(`domQueryOrEl ${domQueryOrEl} is null`);
  } else if (domQueryOrEl === undefined) {
    throw new Error(`domQueryOrEl ${domQueryOrEl} is undefined`);
  }
  const el = domQueryOrEl as V;
  return el;
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
  parent.appendChild(el);
  return el;
};

/**
 * Remove all child nodes from `parent`
 * @param parent
 */
export const clear = (parent: Readonly<HTMLElement>) => {
  //eslint-disable-next-line functional/no-let
  let c = parent.lastElementChild;

  while (c) {
    parent.removeChild(c);
    c = parent.lastElementChild;
  }
};

/**
 * Observer when document's class changes
 *
 * ```js
 * const c = themeChangeObservable();
 * c.subscribe(() => {
 *  // Class has changed...
 * });
 * ```
 * @returns
 */
export const themeChangeObservable = (): Observable<
  readonly MutationRecord[]
> => {
  const o = new Observable<MutationRecord[]>((subscriber) => {
    const ro = new MutationObserver((entries) => {
      subscriber.next(entries);
    });

    const opts: MutationObserverInit = {
      attributeFilter: [`class`],
      attributes: true,
    };

    ro.observe(document.documentElement, opts);
    return function unsubscribe() {
      ro.disconnect();
    };
  });
  return o;
};

/**
 * Observer when element resizes. Specify `timeoutMs` to debounce.
 *
 * ```
 * const o = resizeObservable(myEl, 500);
 * o.subscribe(() => {
 *  // called 500ms after last resize
 * });
 * ```
 * @param elem
 * @param timeoutMs Tiemout before event gets triggered
 * @returns
 */
export const resizeObservable = (
  elem: Readonly<Element>,
  timeoutMs: number = 1000
): Observable<readonly ResizeObserverEntry[]> => {
  if (elem === null) {
    throw new Error(`elem parameter is null. Expected element to observe`);
  }
  if (elem === undefined) {
    throw new Error(`elem parameter is undefined. Expected element to observe`);
  }
  const o = new Observable<ResizeObserverEntry[]>((subscriber) => {
    const ro = new ResizeObserver((entries) => {
      subscriber.next(entries);
    });

    ro.observe(elem);
    return function unsubscribe() {
      ro.unobserve(elem);
    };
  });
  return o.pipe(debounceTime(timeoutMs));
};

/**
 * Copies string representation of object to clipboard
 * @param obj
 * @returns Promise
 */
export const copyToClipboard = (obj: object) => {
  const p = new Promise((resolve, reject) => {
    //const json = JSON.stringify(obj, null, 2);
    const str = JSON5.stringify(obj);
    navigator.clipboard.writeText(JSON.stringify(str)).then(
      () => {
        resolve(true);
      },
      (_err) => {
        console.warn(`Could not copy to clipboard`);
        console.log(str);
        reject(_err);
      }
    );
  });
  return p;
};

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

  for (const [key, value] of list) {
    const id = `c-${key}`;
    const el = parentEl.querySelector(`#${id}`) as HTMLElement;
    const finalEl = createUpdate(value, el);
    //eslint-disable-next-line functional/immutable-data
    if (el !== finalEl) {
      //eslint-disable-next-line functional/immutable-data
      finalEl.id = id;
      parentEl.append(finalEl);
    }
    seen.add(id);
  }

  const prune: HTMLElement[] = [];
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < parentEl.children.length; i++) {
    const c = parentEl.children[i] as HTMLElement;
    if (!seen.has(c.id)) {
      //eslint-disable-next-line functional/immutable-data
      prune.push(c);
    }
  }

  prune.forEach((p) => p.remove());
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
export const setCssClass = (selectors:string, value:boolean, cssClass:string) => {
  const elements = Array.from(document.querySelectorAll(selectors));

  if (!elements) return;

  for (const element of elements) {
    if (value) element.classList.add(cssClass);
    else element.classList.remove(cssClass);
  }
};

export const setCssDisplay = (selectors:string, value:string) => {
  const elements = Array.from(document.querySelectorAll(selectors));
  if (!elements) return;
  for (const element of elements) {
    //eslint-disable-next-line functional/immutable-data
    (element as HTMLElement).style.display = value;
  }
};

export const byId = <V extends HTMLElement>(id:string):HTMLElement => {
  const element = document.getElementById(id);
  return element as V;
}

export const setHtml = (selectors:string, value:string|number) => {
  const elements = Array.from(document.querySelectorAll(selectors));
  if (!elements) return;
  if (typeof value === 'number') {
    value = value.toString();
  } 
  for (const element of elements) {
    //eslint-disable-next-line functional/immutable-data
    element.innerHTML = value;
  }
};

export const setText = (selectors:string, value:string|number) => {
  const elements = Array.from(document.querySelectorAll(selectors));
  if (!elements) return;
  if (typeof value === 'number') {
    value = value.toString();
  } 
  for (const element of elements) {
    //eslint-disable-next-line functional/immutable-data
    element.textContent = value;
  }
};

export const el = (selectors:string) => ({
  text:(value:string|number) => setText(selectors, value),
  html:(value:string|number) => setHtml(selectors, value),
  cssDisplay:(value:string) => setCssDisplay(selectors, value),
  cssClass:(value:boolean, cssClass:string) => setCssClass(selectors, value, cssClass)
});