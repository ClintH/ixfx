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

export const createPath = (svg: string, parent: SVGElement, opts?:DrawingOpts): SVGPathElement => {

  const p = document.createElementNS(`http://www.w3.org/2000/svg`, `path`);
  p.setAttributeNS(null, `d`, svg);
  // p.setAttributeNS(null, `fill`, `transparent`);
  // p.setAttributeNS(null, `stroke`, `pink`);
  parent.appendChild(p);
  if (opts) applyOpts(p, opts);
  return p;
};


export const createCircle = (circle:CirclePositioned, parent:SVGElement, opts?:DrawingOpts): SVGCircleElement => {
  const p = document.createElementNS(`http://www.w3.org/2000/svg`, `circle`);
  p.setAttributeNS(null, `cx`, circle.x.toString());
  p.setAttributeNS(null, `cy`, circle.y.toString());
  p.setAttributeNS(null, `r`, circle.radius.toString());
  parent.appendChild(p);
  if (opts) applyOpts(p, opts);
  return p;
};

const createOrResolve = <V extends SVGElement>(parent:SVGElement, type:string, id?:string):V => {
  //eslint-disable-next-line functional/no-let
  let existing = null;
  if (id !== undefined) existing = parent.querySelector(`#${id}`);
  if (existing === null) {
    const p = document.createElementNS(`http://www.w3.org/2000/svg`, type) as V;
    parent.appendChild(p);
    //eslint-disable-next-line functional/immutable-data
    if (id) p.id = id;
    return p;
  }
  return existing as V;
};

export const createLine = (line:Line, parent:SVGElement, opts?:DrawingOpts, id?:string): SVGLineElement => {
  const lineEl = createOrResolve<SVGLineElement>(parent, `line`, id);
  lineEl.setAttributeNS(null, `x1`, line.a.x.toString());
  lineEl.setAttributeNS(null, `y1`, line.a.y.toString());
  lineEl.setAttributeNS(null, `x2`, line.b.x.toString());
  lineEl.setAttributeNS(null, `y2`, line.b.y.toString());
  if (opts) applyOpts(lineEl, opts);
  return lineEl;
};

export const createText = (pos:Point, text:string, parent:SVGElement, opts?:TextDrawingOpts, id?:string): SVGTextElement => {
  //const p = document.createElementNS(`http://www.w3.org/2000/svg`, `text`);
  const p = createOrResolve<SVGTextElement>(parent, `text`, id);
  
  p.setAttributeNS(null, `x`, pos.x.toString());
  p.setAttributeNS(null, `y`, pos.y.toString());
  
  //eslint-disable-next-line functional/immutable-data
  p.textContent = text;
  //parent.appendChild(p);
  if (opts) {
    applyOpts(p, opts);
    if (opts.anchor) p.setAttributeNS(null, `text-anchor`, opts.anchor);
    if (opts.align) p.setAttributeNS(null, `alignment-baseline`, opts.align);
  }
  return p;
};

const applyOpts = (elem:SVGElement, opts:DrawingOpts) => {
  if (opts.fillStyle) elem.setAttributeNS(null, `fill`, opts.fillStyle);
  if (opts.strokeStyle) elem.setAttributeNS(null, `stroke`, opts.strokeStyle);
  if (opts.strokeWidth) elem.setAttributeNS(null, `stroke-width`, opts.strokeWidth.toString());
};

export const svg = (parent:SVGElement, opts?:DrawingOpts) => {
  if (opts) applyOpts(parent, opts);
  const o = {
    text:(pos:Point, text:string, opts?:TextDrawingOpts, id?:string) => createText(pos, text, parent, opts, id),
    line:(line:Line, opts?:DrawingOpts, id?:string) => createLine(line, parent, opts, id),
    circle:(circle:CirclePositioned, opts?:DrawingOpts) => createCircle(circle, parent, opts),
    path:(svgStr:string, opts?:DrawingOpts) => createPath(svgStr, parent, opts),
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