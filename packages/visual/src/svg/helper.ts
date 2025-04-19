// import { Point } from '@ixfx/geometry';
// import type { Line } from '../../geometry/line/LineType.js';
// import type { CirclePositioned } from '../../geometry/circle/CircleType.js';
import type { CircleDrawingOpts, DrawingOpts, LineDrawingOpts, PathDrawingOpts, StrokeOpts, TextDrawingOpts } from './types.js';
import { applyOpts } from './apply.js';
import { applyStrokeOpts } from './stroke.js';
import { remove } from './remove.js';
import * as Elements from './elements.js';
import type { Point } from '@ixfx/geometry/point';
import type { CirclePositioned } from '@ixfx/geometry/circle';
import type { Line } from '@ixfx/geometry/line';

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
    svgString: string | readonly string[],
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
      svgString: string | readonly string[],
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
