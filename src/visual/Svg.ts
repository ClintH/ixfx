
import {CirclePositioned} from "~/geometry/Circle.js";
import {Line} from "~/geometry/Line.js";
import {Point} from "~/geometry/Point.js";

export type DrawingOpts = {
  readonly strokeStyle?:string
  readonly fillStyle?:string
  readonly debug?:boolean
  readonly strokeWidth?:number
};

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
export const pathEl = (svgOrArray: string|readonly string[], parent: SVGElement, opts?:DrawingOpts): SVGPathElement => {
  const p = document.createElementNS(`http://www.w3.org/2000/svg`, `path`);

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

export const circleEl = (circle:CirclePositioned, parent:SVGElement, opts?:DrawingOpts, idOrExisting?:string|SVGCircleElement): SVGCircleElement => {
  const p = createOrResolve<SVGCircleElement>(parent, `circle`, idOrExisting);
  circleUpdate(p, circle, opts);
  return p;
};

const createOrResolve = <V extends SVGElement>(parent:SVGElement, type:string, idOrExisting?:string|V):V => {
  //eslint-disable-next-line functional/no-let
  let existing = null;
  if (idOrExisting !== undefined) {
    if (typeof idOrExisting === `string`) existing = parent.querySelector(`#${idOrExisting}`);
    else existing = idOrExisting;
  }
  if (existing === null) {
    const p = document.createElementNS(`http://www.w3.org/2000/svg`, type) as V;
    parent.appendChild(p);
    //eslint-disable-next-line functional/immutable-data
    if (idOrExisting && typeof idOrExisting === `string`) p.id = idOrExisting;
    return p;
  }
  return existing as V;
};

export const lineEl = (line:Line, parent:SVGElement, opts?:DrawingOpts, idOrExisting?:string|SVGLineElement): SVGLineElement => {
  const lineEl = createOrResolve<SVGLineElement>(parent, `line`, idOrExisting);
  lineEl.setAttributeNS(null, `x1`, line.a.x.toString());
  lineEl.setAttributeNS(null, `y1`, line.a.y.toString());
  lineEl.setAttributeNS(null, `x2`, line.b.x.toString());
  lineEl.setAttributeNS(null, `y2`, line.b.y.toString());
  if (opts) applyOpts(lineEl, opts);
  return lineEl;
};

const numOrPerctange = (v:number):string => {
  if (v >= 0 && v <= 1) return (v*100) + `%`;
  return v.toString();
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

export const textPathEl = (pathRef:string, text:string, parent:SVGElement, opts?:TextPathDrawingOpts, idOrExisting?:string):SVGTextPathElement => {
  const textEl = createOrResolve<SVGTextElement>(parent, `text`, idOrExisting+`-text`);
  // Update text properties, but don't pass in position or text
  textElUpdate(textEl, undefined, undefined, opts);
  
  const p = createOrResolve<SVGTextPathElement>(textEl, `textPath`, idOrExisting);
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

export const textEl = (pos:Point, text:string, parent:SVGElement, opts?:TextDrawingOpts, idOrExisting?:string|SVGTextElement): SVGTextElement => {
  const p = createOrResolve<SVGTextElement>(parent, `text`, idOrExisting);
  
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
};

export const svg = (parent:SVGElement, opts?:DrawingOpts) => {
  if (opts) applyOpts(parent, opts);
  const o = {
    text:(pos:Point, text:string, opts?:TextDrawingOpts, idOrExisting?:string|SVGTextElement) => textEl(pos, text, parent, opts, idOrExisting),
    line:(line:Line, opts?:DrawingOpts, idOrExisting?:string|SVGLineElement) => lineEl(line, parent, opts, idOrExisting),
    circle:(circle:CirclePositioned, opts?:DrawingOpts, idOrExisting?:string|SVGCircleElement) => circleEl(circle, parent, opts, idOrExisting),
    path:(svgStr:string, opts?:DrawingOpts) => pathEl(svgStr, parent, opts),
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