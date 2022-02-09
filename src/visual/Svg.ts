
import {CirclePositioned} from "~/geometry/Circle.js";
import {Line} from "~/geometry/Line.js";
import {Path} from "~/geometry/Path";
import {Point} from "~/geometry/Point.js";

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
 * Creates and adds an SVG path element
 * @example
 * ```js
 * const paths = [
 *  `M300,200`,
 *  `a25,25 -30 0,1 50, -25 l 50,-25`
 * ]
 * createPath(paths, parentEl);
 * ```
 * @param svgOrArray Path syntax, or array of paths
 * @param parent SVG parent 
 * @param opts Options
 * @returns 
 */
export const pathEl = (svgOrArray: string|readonly string[], parent: SVGElement, opts?:DrawingOpts, queryOrExisting?:string|SVGPathElement): SVGPathElement => {
  //const p = document.createElementNS(`http://www.w3.org/2000/svg`, `path`);
  const p = createOrResolve<SVGPathElement>(parent, `path`, queryOrExisting);

  const svg = typeof svgOrArray === `string` ? svgOrArray : svgOrArray.join(`\n`);

  p.setAttributeNS(null, `d`, svg);
  parent.appendChild(p);
  if (opts) applyOpts(p, opts);
  return p;
};

export const circleUpdate = (el:SVGCircleElement, circle:CirclePositioned, opts?:DrawingOpts) => {
  el.setAttributeNS(null, `cx`, circle.x.toString());
  el.setAttributeNS(null, `cy`, circle.y.toString());
  el.setAttributeNS(null, `r`, circle.radius.toString());
  if (opts) applyOpts(el, opts);
};

export const circleEl = (circle:CirclePositioned, parent:SVGElement, opts?:DrawingOpts, queryOrExisting?:string|SVGCircleElement): SVGCircleElement => {
  const p = createOrResolve<SVGCircleElement>(parent, `circle`, queryOrExisting);
  circleUpdate(p, circle, opts);
  return p;
};

const createOrResolve = <V extends SVGElement>(parent:SVGElement, type:string, queryOrExisting?:string|V):V => {
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

export const lineEl = (line:Line, parent:SVGElement, opts?:LineDrawingOpts, queryOrExisting?:string|SVGLineElement): SVGLineElement => {
  const lineEl = createOrResolve<SVGLineElement>(parent, `line`, queryOrExisting);
  lineEl.setAttributeNS(null, `x1`, line.a.x.toString());
  lineEl.setAttributeNS(null, `y1`, line.a.y.toString());
  lineEl.setAttributeNS(null, `x2`, line.b.x.toString());
  lineEl.setAttributeNS(null, `y2`, line.b.y.toString());
  if (opts) applyOpts(lineEl, opts);
  if (opts) applyPathOpts(lineEl, opts);
  return lineEl;
};

const numOrPerctange = (v:number):string => {
  if (v >= 0 && v <= 1) return (v*100) + `%`;
  return v.toString();
};

/**
 * Adds definition if it doesn't already exist
 * @param parent 
 * @param id 
 * @param creator 
 * @returns 
 */
export const getOrCreateDef = (parent:SVGElement, id:string, creator:()=>SVGElement|undefined):SVGElement => {

  const created = creator();
  if (created === undefined) throw new Error(`Could not create def ${id}`);
  return created;
};

const markerPrebuilt = (elem:SVGElement|null, opts:MarkerOpts, context:DrawingOpts):string => {
  if (elem === null) return `(elem null)`;

  const parent = elem.ownerSVGElement;
  if (parent === null) throw new Error(`parent for elem is null`);
  const defsEl = createOrResolve<SVGDefsElement>(parent, `defs`, `defs`);
  
  //eslint-disable-next-line functional/no-let
  let defEl = defsEl.querySelector(`#${opts.id}`) as SVGElement|null;

  if (defEl !== null) {
    return `url(${opts.id})`;
  }

  if (opts.id === `triangle`) {
    opts = {...opts, strokeStyle: `transparent`};
    if (!opts.markerHeight) opts =  {...opts, markerHeight: 6};
    if (!opts.markerWidth) opts =  {...opts, markerWidth: 6};
    if (!opts.refX) opts = {...opts, refX: opts.markerWidth};
    if (!opts.refY) opts = {...opts, refY: opts.markerHeight};
    if (!opts.fillStyle || opts.fillStyle === `none`) opts = {...opts, fillStyle: `black`};
    if (!opts.viewBox) opts = {...opts, viewBox: `0 0 10 10`};

    defEl = createMarker(opts.id, opts, () => {
      const tri = createEl<SVGPathElement>(`path`);
      tri.setAttribute(`d`, `M 0 0 L 10 5 L 0 10 z`);
      if (opts) applyOpts(tri, opts);
      return tri;
    });
  } else throw new Error(`Do not know how to make ${opts.id}`);

  //eslint-disable-next-line functional/immutable-data
  defEl.id = opts.id;
  defsEl.appendChild(defEl);
  
  return `url(#${opts.id})`;
};

type MarkerOpts = DrawingOpts & {
  readonly id:string,
  readonly markerWidth?:number,
  readonly markerHeight?:number,
  readonly orient?:string,
  readonly viewBox?:string,
  readonly refX?:number,
  readonly refY?:number
}

const createEl = <V extends SVGElement>(type:string, id?:string):V => {
  const m = document.createElementNS(`http://www.w3.org/2000/svg`, type) as V;
  if (id) {
    //eslint-disable-next-line functional/immutable-data
    m.id = id;
  }
  return m;
};

const createMarker = (id:string, opts:MarkerOpts, childCreator?:()=>SVGElement):SVGMarkerElement => {
  const m = createEl<SVGMarkerElement>(`marker`, id);
  
  if (opts.markerWidth) m.setAttribute(`markerWidth`, opts.markerWidth?.toString());
  if (opts.markerHeight) m.setAttribute(`markerHeight`, opts.markerHeight?.toString());
  if (opts.orient) m.setAttribute(`orient`, opts.orient.toString());
  else m.setAttribute(`orient`, `auto-start-reverse`);

  if (opts.viewBox) m.setAttribute(`viewBox`, opts.viewBox.toString());
  if (opts.refX) m.setAttribute(`refX`, opts.refX.toString());
  if (opts.refY) m.setAttribute(`refY`, opts.refY.toString());

  if (childCreator) {
    const c = childCreator();
    m.appendChild(c);
  }
  return m;
};

const applyPathOpts = (elem:SVGElement, opts:PathDrawingOpts) => {
  if (opts.markerEnd) {
    elem.setAttribute(`marker-end`, markerPrebuilt(elem, opts.markerEnd, opts as DrawingOpts));
  }
  if (opts.markerStart) elem.setAttribute(`marker-end`, markerPrebuilt(elem, opts.markerStart, opts as DrawingOpts));
  if (opts.markerMid) elem.setAttribute(`marker-end`, markerPrebuilt(elem, opts.markerMid, opts as DrawingOpts));
};

export const textPathUpdate = (el:SVGTextPathElement, text?:string, opts?:TextPathDrawingOpts) => {
  if (opts?.method) el.setAttributeNS(null, `method`, opts.method);
  if (opts?.side) el.setAttributeNS(null, `side`, opts.side);
  if (opts?.spacing) el.setAttributeNS(null, `spacing`, opts.spacing);
  if (opts?.startOffset) {
    el.setAttributeNS(null, `startOffset`, numOrPerctange(opts.startOffset));
  }
  if (opts?.textLength) el.setAttributeNS(null, `textLength`, numOrPerctange(opts.textLength));
  
  if (text) {
    //eslint-disable-next-line functional/immutable-data
    el.textContent = text;
  }
};

export const textPathEl = (pathRef:string, text:string, parent:SVGElement, opts?:TextPathDrawingOpts, queryOrExisting?:string):SVGTextPathElement => {
  const textEl = createOrResolve<SVGTextElement>(parent, `text`, queryOrExisting+`-text`);
  // Update text properties, but don't pass in position or text
  textElUpdate(textEl, undefined, undefined, opts);
  
  const p = createOrResolve<SVGTextPathElement>(textEl, `textPath`, queryOrExisting);
  p.setAttributeNS(null, `href`, pathRef);
  textPathUpdate(p, text, opts);
  if (opts) applyOpts(p, opts);
  return p;
};

export const textElUpdate = (el:SVGTextElement, pos?:Point, text?:string, opts?:TextDrawingOpts) => {
  if (pos) {
    el.setAttributeNS(null, `x`, pos.x.toString());
    el.setAttributeNS(null, `y`, pos.y.toString());  
  }
  if (text) {
    //eslint-disable-next-line functional/immutable-data
    el.textContent = text;
  }
};

export const textEl = (pos:Point, text:string, parent:SVGElement, opts?:TextDrawingOpts, queryOrExisting?:string|SVGTextElement): SVGTextElement => {
  const p = createOrResolve<SVGTextElement>(parent, `text`, queryOrExisting);
  
  textElUpdate(p, pos, text, opts);

  if (opts) {
    applyOpts(p, opts);
    if (opts.anchor) p.setAttributeNS(null, `text-anchor`, opts.anchor);
    if (opts.align) p.setAttributeNS(null, `alignment-baseline`, opts.align);
  }
  return p;
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

export const svg = (parent:SVGElement, opts?:DrawingOpts) => {
  if (opts) applyOpts(parent, opts);
  const o = {
    text:(pos:Point, text:string, opts?:TextDrawingOpts, queryOrExisting?:string|SVGTextElement) => textEl(pos, text, parent, opts, queryOrExisting),
    line:(line:Line, opts?:LineDrawingOpts, queryOrExisting?:string|SVGLineElement) => lineEl(line, parent, opts, queryOrExisting),
    circle:(circle:CirclePositioned, opts?:DrawingOpts, queryOrExisting?:string|SVGCircleElement) => circleEl(circle, parent, opts,  queryOrExisting),
    path:(svgStr:string|readonly string[], opts?:DrawingOpts, queryOrExisting?:string|SVGPathElement) => pathEl(svgStr, parent, opts, queryOrExisting),
    query:<V extends SVGElement>(selectors:string):V|null => parent.querySelector(selectors),
    get width():number {
      const w = parent.getAttributeNS(null, `width`);
      if (w === null) return 0;
      return parseFloat(w);
    },
    set width(width:number) {
      parent.setAttributeNS(null, `width`, width.toString());
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