import {CirclePositioned} from "../geometry/Circle.js";
import {markerPrebuilt} from "./SvgMarkers.js";
import * as Lines from "../geometry/Line.js";
import * as Points from "../geometry/Point.js";
//import * as Grids from "../geometry/Grid.js";
import * as Elements from "./SvgElements.js";

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

export type DrawingOpts = {
  readonly strokeStyle?:string
  readonly fillStyle?:string
  readonly debug?:boolean
  readonly strokeWidth?:number
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
export const getOrCreateDefX = (parent:SVGElement, id:string, creator:()=>SVGElement|undefined):SVGElement => {
  const created = creator();
  if (created === undefined) throw new Error(`Could not create def ${id}`);
  return created;
};

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

export const applyPathOpts = (elem:SVGElement, opts:PathDrawingOpts) => {
  if (opts.markerEnd) elem.setAttribute(`marker-end`, markerPrebuilt(elem, opts.markerEnd, opts as DrawingOpts));
  if (opts.markerStart) elem.setAttribute(`marker-end`, markerPrebuilt(elem, opts.markerStart, opts as DrawingOpts));
  if (opts.markerMid) elem.setAttribute(`marker-end`, markerPrebuilt(elem, opts.markerMid, opts as DrawingOpts));
};

/**
 * Applies drawing options to given SVG element.
 * 
 * Use to easily assign fillStyle, strokeStyle, strokeWidth.
 * @param elem Element
 * @param opts Drawing options
 */
export const applyOpts = (elem:SVGElement, opts:DrawingOpts) => {
  if (opts.fillStyle) elem.setAttributeNS(null, `fill`, opts.fillStyle);
  if (opts.strokeStyle) elem.setAttributeNS(null, `stroke`, opts.strokeStyle);
  if (opts.strokeWidth) elem.setAttributeNS(null, `stroke-width`, opts.strokeWidth.toString());
  if (opts.strokeDash) elem.setAttribute(`stroke-dasharray`, opts.strokeDash);
};

export const svg = (parent:SVGElement, parentOpts?:DrawingOpts) => {
  if (parentOpts) applyOpts(parent, parentOpts);
  const o = {
    text:(text:string, pos:Points.Point, opts?:TextDrawingOpts, queryOrExisting?:string|SVGTextElement) => Elements.textEl(text, parent, pos, opts, queryOrExisting),
    textPath:(pathRef:string, text:string, opts?:TextDrawingOpts, queryOrExisting?:string|SVGTextPathElement) => Elements.textPathEl(pathRef, text, parent, opts, queryOrExisting),
    line:(line:Lines.Line, opts?:LineDrawingOpts, queryOrExisting?:string|SVGLineElement) => Elements.lineEl(line, parent, opts, queryOrExisting),
    circle:(circle:CirclePositioned, opts?:DrawingOpts, queryOrExisting?:string|SVGCircleElement) => Elements.circleEl(circle, parent, opts,  queryOrExisting),
    path:(svgStr:string|readonly string[], opts?:DrawingOpts, queryOrExisting?:string|SVGPathElement) => Elements.pathEl(svgStr, parent, opts, queryOrExisting),
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

