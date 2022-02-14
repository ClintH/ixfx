
import {CirclePositioned} from "../geometry/Circle.js";
import * as Lines from "../geometry/Line.js";
import * as Points from "../geometry/Point.js";
import * as Svg from "./Svg.js";
import { getCssVariable } from "./Colour.js";
//import {Palette} from ".";


const numOrPercentage = (v:number):string => {
  if (v >= 0 && v <= 1) return (v*100) + `%`;
  return v.toString();
};

/**
 * Creates and adds an SVG path element
 * @example
 * ```js
 * const paths = [
 *  `M300,200`,
 *  `a25,25 -30 0,1 50, -25 l 50,-25`
 * ]
 * const pathEl = path(paths, parentEl);
 * ```
 * @param svgOrArray Path syntax, or array of paths. Can be empty if path data will be added later
 * @param parent SVG parent element
 * @param opts Options Drawing options
 * @returns 
 */
export const path = (svgOrArray: string | readonly string[], parent: SVGElement, opts?: Svg.DrawingOpts, queryOrExisting?: string | SVGPathElement): SVGPathElement => {
  const p = Svg.createOrResolve<SVGPathElement>(parent, `path`, queryOrExisting);
  const svg = typeof svgOrArray === `string` ? svgOrArray : svgOrArray.join(`\n`);

  p.setAttributeNS(null, `d`, svg);
  parent.appendChild(p);
  if (opts) Svg.applyOpts(p, opts);
  return p;
};

export const circleUpdate = (el: SVGCircleElement, circle: CirclePositioned, opts?: Svg.DrawingOpts) => {
  el.setAttributeNS(null, `cx`, circle.x.toString());
  el.setAttributeNS(null, `cy`, circle.y.toString());
  el.setAttributeNS(null, `r`, circle.radius.toString());
  if (opts) Svg.applyOpts(el, opts);
};

export const circle = (circle: CirclePositioned, parent: SVGElement, opts?: Svg.DrawingOpts, queryOrExisting?: string | SVGCircleElement): SVGCircleElement => {
  const p = Svg.createOrResolve<SVGCircleElement>(parent, `circle`, queryOrExisting);
  circleUpdate(p, circle, opts);
  return p;
};

export const line = (line: Lines.Line, parent: SVGElement, opts?: Svg.LineDrawingOpts, queryOrExisting?: string | SVGLineElement): SVGLineElement => {
  const lineEl = Svg.createOrResolve<SVGLineElement>(parent, `line`, queryOrExisting);
  lineEl.setAttributeNS(null, `x1`, line.a.x.toString());
  lineEl.setAttributeNS(null, `y1`, line.a.y.toString());
  lineEl.setAttributeNS(null, `x2`, line.b.x.toString());
  lineEl.setAttributeNS(null, `y2`, line.b.y.toString());
  if (opts) Svg.applyOpts(lineEl, opts);
  if (opts) Svg.applyPathOpts(lineEl, opts);
  return lineEl;
};

export const textPathUpdate = (el:SVGTextPathElement, text?:string, opts?:Svg.TextPathDrawingOpts) => {
  if (opts?.method) el.setAttributeNS(null, `method`, opts.method);
  if (opts?.side) el.setAttributeNS(null, `side`, opts.side);
  if (opts?.spacing) el.setAttributeNS(null, `spacing`, opts.spacing);
  if (opts?.startOffset) {
    el.setAttributeNS(null, `startOffset`, numOrPercentage(opts.startOffset));
  }
  if (opts?.textLength) el.setAttributeNS(null, `textLength`, numOrPercentage(opts.textLength));
  
  if (text) {
    //eslint-disable-next-line functional/immutable-data
    el.textContent = text;
  }
};

export const textPath = (pathRef:string, text:string, parent:SVGElement, opts?:Svg.TextPathDrawingOpts, queryOrExisting?:string|SVGTextPathElement):SVGTextPathElement => {
  const textEl = Svg.createOrResolve<SVGTextElement>(parent, `text`, queryOrExisting+`-text`);
  // Update text properties, but don't pass in position or text
  textUpdate(textEl, undefined, undefined, opts);
  
  const p = Svg.createOrResolve<SVGTextPathElement>(textEl, `textPath`, queryOrExisting);
  p.setAttributeNS(null, `href`, pathRef);
  textPathUpdate(p, text, opts);
  if (opts) Svg.applyOpts(p, opts);
  return p;
};

export const textUpdate = (el:SVGTextElement, pos?:Points.Point, text?:string, opts?:Svg.TextDrawingOpts) => {
  if (pos) {
    el.setAttributeNS(null, `x`, pos.x.toString());
    el.setAttributeNS(null, `y`, pos.y.toString());  
  }
  if (text) {
    //eslint-disable-next-line functional/immutable-data
    el.textContent = text;
  }

  if (opts) {
    Svg.applyOpts(el, opts);
    if (opts.anchor) el.setAttributeNS(null, `text-anchor`, opts.anchor);
    if (opts.align) el.setAttributeNS(null, `alignment-baseline`, opts.align);
  }
};

/**
 * Creates a SVG Text element
 * @param pos Position of text
 * @param text Text
 * @param parent 
 * @param opts 
 * @param queryOrExisting 
 * @returns 
 */
export const text = (text:string, parent:SVGElement, pos?:Points.Point, opts?:Svg.TextDrawingOpts, queryOrExisting?:string|SVGTextElement): SVGTextElement => {
  const p = Svg.createOrResolve<SVGTextElement>(parent, `text`, queryOrExisting);
  textUpdate(p, pos, text, opts);  
  return p;
};

/**
 * Creates a square grid based at a center point, with cells having `spacing` height and width.
 * 
 * It fits in as many cells as it can within `width` and `height`.
 * 
 * Returns a SVG group, consisting of horizontal and vertical lines
 * @param parent Parent element
 * @param center Center point of grid
 * @param spacing Width/height of cells
 * @param width How wide grid should be
 * @param height How high grid should be
 * @param opts 
 */
export const grid = (parent:SVGElement, center: Points.Point, spacing: number, width: number, height: number, opts:Svg.LineDrawingOpts = {}) => {
  if (!opts.strokeStyle) opts = {...opts, strokeStyle: getCssVariable(`bg-dim`, `silver`) };
  if (!opts.strokeWidth) opts = {...opts, strokeWidth: 1};

  const g = Svg.createEl<SVGGElement>(`g`);
  Svg.applyOpts(g, opts);

  // Horizontals
  //eslint-disable-next-line functional/no-let
  let y = 0;
  //eslint-disable-next-line functional/no-loop-statement
  while (y < height) {
    const horiz = Lines.fromNumbers(0, y, width, y);
    line(horiz, g);
    y += spacing;
  }

  // Verticals
  //eslint-disable-next-line functional/no-let
  let x = 0;
  //eslint-disable-next-line functional/no-loop-statement
  while (x < width) {
    const vert = Lines.fromNumbers(x, 0, x, height);
    line(vert, g);
    x += spacing;
  }
  parent.appendChild(g);
  return g;
};
