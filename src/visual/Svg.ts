import {CirclePositioned} from "../geometry/Circle.js";
import {markerPrebuilt} from "./SvgMarkers.js";
import * as Lines from "../geometry/Line.js";
import * as Points from "../geometry/Point.js";
import * as Elements from "./SvgElements.js";
import * as Rects from "~/geometry/Rect.js";

export {Elements};

export type MarkerOpts = DrawingOpts & {
  readonly id: string,
  readonly markerWidth?: number,
  readonly markerHeight?: number,
  readonly orient?: string,
  readonly viewBox?: string,
  readonly refX?: number,
  readonly refY?: number
}

/**
 * Drawing options
 */
export type DrawingOpts = {
  /**
   * Style for lines. Eg `white`.
   * @see [stroke](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke)
   */
  readonly strokeStyle?:string
  /**
   * Style for fill. Eg `black`.
   * @see [fill](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill)
   */
  readonly fillStyle?:string
  /**
   * If true, debug helpers are drawn
   */
  readonly debug?:boolean
  /**
   * Width of stroke, eg `2`
   * @see [stroke-width](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width)
   */
  readonly strokeWidth?:number
  /**
   * Stroke dash pattern, eg `5`
   * @see [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
   */
  readonly strokeDash?:string
};

export type LineDrawingOpts = DrawingOpts & PathDrawingOpts;

export type PathDrawingOpts = {
  readonly markerEnd?:MarkerOpts
  readonly markerStart?:MarkerOpts
  readonly markerMid?:MarkerOpts
}
export type TextDrawingOpts = DrawingOpts & {
  readonly anchor?: `start` | `middle` | `end`
  readonly align?: `text-bottom` | `text-top` | `baseline` | `top` | `hanging` | `middle`
}

export type TextPathDrawingOpts = TextDrawingOpts & {
  readonly method?: `align` |`stretch`
  readonly side?: `left` | `right`
  readonly spacing?: `auto` | `exact`
  readonly startOffset?: number
  readonly textLength?:number
}

/**
 * Creates and appends a SVG element. 
 * If `queryOrExisting` is specified, element will be returned if it already exists.
 * @param parent Parent element
 * @param type Type of SVG element
 * @param queryOrExisting Query, eg `#id`
 * @returns 
 */
export const createOrResolve = <V extends SVGElement>(parent:SVGElement, type:string, queryOrExisting?:string|V):V => {
  //eslint-disable-next-line functional/no-let
  let existing = null;
  if (queryOrExisting !== undefined) {
    if (typeof queryOrExisting === `string`) existing = parent.querySelector(queryOrExisting);
    else existing = queryOrExisting;
  }
  if (existing === null) {
    const p = document.createElementNS(`http://www.w3.org/2000/svg`, type) as V;
    parent.appendChild(p);
    if (queryOrExisting && typeof queryOrExisting === `string`) {
      //eslint-disable-next-line functional/immutable-data
      if (queryOrExisting.startsWith(`#`)) p.id = queryOrExisting.substring(1);
    }
    return p;
  }
  return existing as V;
};

/**
 * Adds definition if it doesn't already exist
 * @param parent 
 * @param id 
 * @param creator 
 * @returns 
 */
// export const getOrCreateDefX = (parent:SVGElement, id:string, creator:()=>SVGElement|undefined):SVGElement => {
//   const created = creator();
//   if (created === undefined) throw new Error(`Could not create def ${id}`);
//   return created;
// };

/**
 * Creates an element of `type` and with `id` (if specified)
 * @param type Element type, eg `circle` 
 * @param id Optional id to assign to element
 * @returns Element
 */
export const createEl = <V extends SVGElement>(type:string, id?:string):V => {
  const m = document.createElementNS(`http://www.w3.org/2000/svg`, type) as V;
  if (id) {
    //eslint-disable-next-line functional/immutable-data
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
export const applyPathOpts = (elem:SVGElement, opts:PathDrawingOpts) => {
  if (opts.markerEnd) elem.setAttribute(`marker-end`, markerPrebuilt(elem, opts.markerEnd, opts as DrawingOpts));
  if (opts.markerStart) elem.setAttribute(`marker-end`, markerPrebuilt(elem, opts.markerStart, opts as DrawingOpts));
  if (opts.markerMid) elem.setAttribute(`marker-end`, markerPrebuilt(elem, opts.markerMid, opts as DrawingOpts));
};

/**
 * Applies drawing options to given SVG element.
 * Applies: fillStyle, strokeStyle, strokeWidth, strokeDash
 * @param elem Element
 * @param opts Drawing options
 */
export const applyOpts = (elem:SVGElement, opts:DrawingOpts) => {
  if (opts.fillStyle) elem.setAttributeNS(null, `fill`, opts.fillStyle);
  if (opts.strokeStyle) elem.setAttributeNS(null, `stroke`, opts.strokeStyle);
  if (opts.strokeWidth) elem.setAttributeNS(null, `stroke-width`, opts.strokeWidth.toString());
  if (opts.strokeDash) elem.setAttribute(`stroke-dasharray`, opts.strokeDash);
};

/**
 * Helper to make SVG elements with a common parent.
 * 
 * Create with {@link makeHelper}.
 */
export type SvgHelper = {
  /**
   * Creates a text element
   * @param text Text
   * @param pos Position
   * @param opts Drawing options
   * @param queryOrExisting DOM query to look up existing element, or the element instance 
   */
  text(text:string, pos:Points.Point, opts?:TextDrawingOpts, queryOrExisting?:string|SVGTextElement):SVGTextElement
  /**
   * Creates text on a path
   * @param pathRef Reference to path element
   * @param text Text
   * @param opts Drawing options
   * @param queryOrExisting DOM query to look up existing element, or the element instance 
   */
  textPath(pathRef:string, text:string, opts?:TextDrawingOpts, queryOrExisting?:string|SVGTextPathElement):SVGTextPathElement
  /**
   * Creates a line
   * @param line Line
   * @param opts Drawing options
   * @param queryOrExisting DOM query to look up existing element, or the element instance 
   */
  line(line:Lines.Line, opts?:LineDrawingOpts, queryOrExisting?:string|SVGLineElement):SVGLineElement
  /**
   * Creates a circle
   * @param circle Circle
   * @param opts Drawing options
   * @param queryOrExisting DOM query to look up existing element, or the element instance 
   */
  circle(circle:CirclePositioned, opts?:DrawingOpts, queryOrExisting?:string|SVGCircleElement):SVGCircleElement
  /**
   * Creates a path
   * @param svgStr Path description, or empty string
   * @param opts Drawing options
   * @param queryOrExisting DOM query to look up existing element, or the element instance 
   */
  path(svgStr:string|readonly string[], opts?:DrawingOpts, queryOrExisting?:string|SVGPathElement) :SVGPathElement
  /**
   * Creates a grid of horizontal and vertical lines inside of a group
   * @param center Grid origin
   * @param spacing Cell size
   * @param width Width of grid
   * @param height Height of grid
   * @param opts Drawing options
   */
  grid(center:Points.Point, spacing:number, width:number, height:number, opts?:DrawingOpts):SVGGElement
  /**
   * Returns an element if it exists in parent
   * @param selectors Eg `#path`
   */
  query<V extends SVGElement>(selectors:string):V|null
  /**
   * Gets the width of the parent
   */
  get width():number 
  /**
   * Sets the width of the parent
   */
  set width(width:number) 
  /**
   * Gets the parent
   */
  get parent():SVGElement
  /**
   * Gets the height of the parent
   */ 
  get height():number 
  /**
   * Sets the height of the parent
   */
  set height(height:number) 
  /**
   * Deletes all child elements
   */
  clear():void 
};

/**
 * Get the bounds of an SVG element (determined by its width/height attribs)
 * @param svg
 * @returns 
 */
export const getBounds = (svg:SVGElement):Rects.Rect => {
  const w = svg.getAttributeNS(null, `width`);
  const width = w === null ? 0 : parseFloat(w);
  const h = svg.getAttributeNS(null, `height`);
  const height = h === null ? 0 : parseFloat(h);
  return { width, height};
};

/**
 * Set the bounds of an element, using its width/height attribs.
 * @param svg
 * @param bounds 
 */
export const setBounds = (svg:SVGElement, bounds:Rects.Rect):void => {
  svg.setAttributeNS(null, `width`, bounds.width.toString());
  svg.setAttributeNS(null, `height`, bounds.height.toString());
};

/**
 * @inheritdoc SvgHelper
 * @param parent 
 * @param parentOpts 
 * @returns 
 */
export const makeHelper = (parent:SVGElement, parentOpts?:DrawingOpts):SvgHelper => {
  if (parentOpts) applyOpts(parent, parentOpts);
  const o = {
    text:(text:string, pos:Points.Point, opts?:TextDrawingOpts, queryOrExisting?:string|SVGTextElement) => Elements.text(text, parent, pos, opts, queryOrExisting),
    textPath:(pathRef:string, text:string, opts?:TextDrawingOpts, queryOrExisting?:string|SVGTextPathElement) => Elements.textPath(pathRef, text, parent, opts, queryOrExisting),
    line:(line:Lines.Line, opts?:LineDrawingOpts, queryOrExisting?:string|SVGLineElement) => Elements.line(line, parent, opts, queryOrExisting),
    circle:(circle:CirclePositioned, opts?:DrawingOpts, queryOrExisting?:string|SVGCircleElement) => Elements.circle(circle, parent, opts,  queryOrExisting),
    path:(svgStr:string|readonly string[], opts?:DrawingOpts, queryOrExisting?:string|SVGPathElement) => Elements.path(svgStr, parent, opts, queryOrExisting),
    grid:(center:Points.Point, spacing:number, width:number, height:number, opts?:DrawingOpts) => Elements.grid(parent, center, spacing, width, height, opts),
    query:<V extends SVGElement>(selectors:string):V|null => parent.querySelector(selectors),
    get width():number {
      const w = parent.getAttributeNS(null, `width`);
      if (w === null) return 0;
      return parseFloat(w);
    },
    set width(width:number) {
      parent.setAttributeNS(null, `width`, width.toString());
    },
    get parent():SVGElement {
      return parent;
    },
    get height():number {
      const w = parent.getAttributeNS(null, `height`);
      if (w === null) return 0;
      return parseFloat(w);
    },
    set height(height:number) {
      parent.setAttributeNS(null, `height`, height.toString());
    },
    clear: () => {
      //eslint-disable-next-line functional/no-loop-statement
      while (parent.firstChild) {
        parent.removeChild(parent.lastChild as HTMLElement);
      }
    }
  };
  return o;
};

