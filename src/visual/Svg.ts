/* eslint-disable unicorn/no-null */

import { markerPrebuilt } from './SvgMarkers.js';
import * as Elements from './SvgElements.js';
import type { Point } from '../geometry/point/PointType.js';
import type { Line } from '../geometry/line/LineType.js';
import type { CirclePositioned } from '../geometry/circle/CircleType.js';
import type { Rect } from '../geometry/rect/index.js';

export type MarkerOpts = StrokeOpts &
  DrawingOpts & {
    readonly id: string;
    readonly markerWidth?: number;
    readonly markerHeight?: number;
    readonly orient?: string;
    readonly viewBox?: string;
    readonly refX?: number;
    readonly refY?: number;
  };

/**
 * Drawing options
 */
export type DrawingOpts = {
  /**
   * Style for fill. Eg `black`.
   * @see [fill](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill)
   */
  readonly fillStyle?: string;

  /**
   * Opacity (0..1)
   */
  readonly opacity?: number;
  /**
   * If true, debug helpers are drawn
   */
  readonly debug?: boolean;
};

export type StrokeOpts = {
  /**
   * Line cap
   * @see [stroke-linecap](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap)
   */
  readonly strokeLineCap?: `butt` | `round` | `square`;
  /**
   * Width of stroke, eg `2`
   * @see [stroke-width](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width)
   */
  readonly strokeWidth?: number;
  /**
   * Stroke dash pattern, eg `5`
   * @see [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
   */
  readonly strokeDash?: string;
  /**
   * Style for lines. Eg `white`.
   * @see [stroke](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke)
   */
  readonly strokeStyle?: string;
};

/**
 * Line drawing options
 */
export type LineDrawingOpts = DrawingOpts & MarkerDrawingOpts & StrokeOpts;

export type CircleDrawingOpts = DrawingOpts & StrokeOpts & MarkerDrawingOpts;

export type PathDrawingOpts = DrawingOpts & StrokeOpts & MarkerDrawingOpts;

export type MarkerDrawingOpts = {
  readonly markerEnd?: MarkerOpts;
  readonly markerStart?: MarkerOpts;
  readonly markerMid?: MarkerOpts;
};

/**
 * Text drawing options
 */
export type TextDrawingOpts = StrokeOpts &
  DrawingOpts & {
    readonly anchor?: `start` | `middle` | `end`;
    readonly align?:
    | `text-bottom`
    | `text-top`
    | `baseline`
    | `top`
    | `hanging`
    | `middle`;
    readonly userSelect?: boolean;
  };

/**
 * Text path drawing options
 */
export type TextPathDrawingOpts = TextDrawingOpts & {
  readonly method?: `align` | `stretch`;
  readonly side?: `left` | `right`;
  readonly spacing?: `auto` | `exact`;
  readonly startOffset?: number;
  readonly textLength?: number;
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
  let existing = null;
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

export const clear = (parent: SVGElement) => {
  let c = parent.lastElementChild;
  while (c) {
    c.remove();
    c = parent.lastElementChild;
  }
};

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
 * Applies path drawing options to given element
 * Applies: markerEnd, markerStart, markerMid
 * @param elem Element (presumed path)
 * @param opts Options
 */
export const applyPathOpts = (elem: SVGElement, opts: PathDrawingOpts) => {
  if (opts.markerEnd) {
    elem.setAttribute(
      `marker-end`,
      markerPrebuilt(elem, opts.markerEnd, opts as DrawingOpts)
    );
  }
  if (opts.markerStart) {
    elem.setAttribute(
      `marker-start`,
      markerPrebuilt(elem, opts.markerStart, opts as DrawingOpts)
    );
  }
  if (opts.markerMid) {
    elem.setAttribute(
      `marker-mid`,
      markerPrebuilt(elem, opts.markerMid, opts as DrawingOpts)
    );
  }
};

/**
 * Applies drawing options to given SVG element.
 * Applies: fillStyle
 * @param elem Element
 * @param opts Drawing options
 */
export const applyOpts = (elem: SVGElement, opts: DrawingOpts) => {
  if (opts.fillStyle) elem.setAttributeNS(null, `fill`, opts.fillStyle);
  if (opts.opacity) {
    elem.setAttributeNS(null, `opacity`, opts.opacity.toString());
  }
};

/**
 * Applies drawing options to given SVG element.
 * Applies: strokeStyle, strokeWidth, strokeDash, strokeLineCap
 * @param elem Element
 * @param opts
 */
export const applyStrokeOpts = (elem: SVGElement, opts: StrokeOpts) => {
  if (opts.strokeStyle) elem.setAttributeNS(null, `stroke`, opts.strokeStyle);
  if (opts.strokeWidth) {
    elem.setAttributeNS(null, `stroke-width`, opts.strokeWidth.toString());
  }
  if (opts.strokeDash) elem.setAttribute(`stroke-dasharray`, opts.strokeDash);
  if (opts.strokeLineCap) {
    elem.setAttribute(`stroke-linecap`, opts.strokeLineCap);
  }
};

/**
 * Helper to make SVG elements with a common parent.
 *
 * Create with {@link makeHelper}.
 */
export type SvgHelper = {
  remove(queryOrExisting: string | SVGElement): void;
  /**
   * Creates a text element
   * @param text Text
   * @param pos Position
   * @param opts Drawing options
   * @param queryOrExisting DOM query to look up existing element, or the element instance
   */
  text(
    text: string,
    pos: Point,
    opts?: TextDrawingOpts,
    queryOrExisting?: string | SVGTextElement
  ): SVGTextElement;
  /**
   * Creates text on a path
   * @param pathReference Reference to path element
   * @param text Text
   * @param opts Drawing options
   * @param textQueryOrExisting DOM query to look up existing element, or the element instance
   * @param pathQueryOrExisting DOM query to look up existing element, or the element instance
   */
  textPath(
    pathReference: string,
    text: string,
    opts?: TextDrawingOpts,
    textQueryOrExisting?: string | SVGTextElement,
    pathQueryOrExisting?: string | SVGTextPathElement
  ): SVGTextPathElement;
  /**
   * Creates a line
   * @param line Line
   * @param opts Drawing options
   * @param queryOrExisting DOM query to look up existing element, or the element instance
   */
  line(
    line: Line,
    opts?: LineDrawingOpts,
    queryOrExisting?: string | SVGLineElement
  ): SVGLineElement;
  /**
   * Creates a circle
   * @param circle Circle
   * @param opts Drawing options
   * @param queryOrExisting DOM query to look up existing element, or the element instance
   */
  circle(
    circle: CirclePositioned,
    opts?: CircleDrawingOpts,
    queryOrExisting?: string | SVGCircleElement
  ): SVGCircleElement;
  /**
   * Creates a path
   * @param svgString Path description, or empty string
   * @param opts Drawing options
   * @param queryOrExisting DOM query to look up existing element, or the element instance
   */
  path(
    svgString: string | ReadonlyArray<string>,
    opts?: PathDrawingOpts,
    queryOrExisting?: string | SVGPathElement
  ): SVGPathElement;
  /**
   * Creates a grid of horizontal and vertical lines inside of a group
   * @param center Grid origin
   * @param spacing Cell size
   * @param width Width of grid
   * @param height Height of grid
   * @param opts Drawing options
   */
  grid(
    center: Point,
    spacing: number,
    width: number,
    height: number,
    opts?: LineDrawingOpts
  ): SVGGElement;
  /**
   * Returns an element if it exists in parent
   * @param selectors Eg `#path`
   */
  query<V extends SVGElement>(selectors: string): V | null;
  /**
   * Gets/sets the width of the parent
   */
  get width(): number;
  set width(width: number);
  /**
   * Gets the parent
   */
  get parent(): SVGElement;
  /**
   * Gets/sets the height of the parent
   */
  get height(): number;
  set height(height: number);
  /**
   * Deletes all child elements
   */
  clear(): void;
};

/**
 * Get the bounds of an SVG element (determined by its width/height attribs)
 * @param svg
 * @returns
 */
export const getBounds = (svg: SVGElement): Rect => {
  const w = svg.getAttributeNS(null, `width`);
  const width = w === null ? 0 : Number.parseFloat(w);
  const h = svg.getAttributeNS(null, `height`);
  const height = h === null ? 0 : Number.parseFloat(h);
  return { width, height };
};

/**
 * Set the bounds of an element, using its width/height attribs.
 * @param svg
 * @param bounds
 */
export const setBounds = (svg: SVGElement, bounds: Rect): void => {
  svg.setAttributeNS(null, `width`, bounds.width.toString());
  svg.setAttributeNS(null, `height`, bounds.height.toString());
};

/**
 * Creates a {@link SvgHelper} for the creating and management of SVG elements.
 * @param parent
 * @param parentOpts
 * @returns
 */
export const makeHelper = (
  parent: SVGElement,
  parentOpts?: DrawingOpts & StrokeOpts
): SvgHelper => {
  if (parentOpts) {
    applyOpts(parent, parentOpts);
    applyStrokeOpts(parent, parentOpts);
  }

  const o: SvgHelper = {
    remove: (queryOrExisting: string | SVGElement) => { remove(parent, queryOrExisting); },
    text: (
      text: string,
      pos: Point,
      opts?: TextDrawingOpts,
      queryOrExisting?: string | SVGTextElement
    ) => Elements.text(text, parent, pos, opts, queryOrExisting),
    textPath: (
      pathReference: string,
      text: string,
      opts?: TextDrawingOpts,
      textQueryOrExisting?: string | SVGTextElement,
      pathQueryOrExisting?: string | SVGTextPathElement
    ) => Elements.textPath(pathReference, text, parent, opts, textQueryOrExisting, pathQueryOrExisting),
    line: (
      line: Line,
      opts?: LineDrawingOpts,
      queryOrExisting?: string | SVGLineElement
    ) => Elements.line(line, parent, opts, queryOrExisting),
    circle: (
      circle: CirclePositioned,
      opts?: CircleDrawingOpts,
      queryOrExisting?: string | SVGCircleElement
    ) => Elements.circle(circle, parent, opts, queryOrExisting),
    path: (
      svgString: string | ReadonlyArray<string>,
      opts?: PathDrawingOpts,
      queryOrExisting?: string | SVGPathElement
    ) => Elements.path(svgString, parent, opts, queryOrExisting),
    grid: (
      center: Point,
      spacing: number,
      width: number,
      height: number,
      opts?: LineDrawingOpts
    ) => Elements.grid(parent, center, spacing, width, height, opts),
    query: <V extends SVGElement>(selectors: string): V | null =>
      parent.querySelector(selectors),
    get width(): number {
      const w = parent.getAttributeNS(null, `width`);
      if (w === null) return 0;
      return Number.parseFloat(w);
    },
    set width(width: number) {
      parent.setAttributeNS(null, `width`, width.toString());
    },
    get parent(): SVGElement {
      return parent;
    },
    get height(): number {
      const w = parent.getAttributeNS(null, `height`);
      if (w === null) return 0;
      return Number.parseFloat(w);
    },
    set height(height: number) {
      parent.setAttributeNS(null, `height`, height.toString());
    },
    clear: () => {
      while (parent.firstChild) {
        (parent.lastChild as HTMLElement).remove();
      }
    },
  };
  return o;
};

export * as Elements from './SvgElements.js';