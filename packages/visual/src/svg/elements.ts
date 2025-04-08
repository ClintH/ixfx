
//import type { CirclePositioned } from '../../geometry/circle/CircleType.js';
//import type { Point } from '../../geometry/point/PointType.js';
//import type { Line } from '../../geometry/line/LineType.js';
//import * as Lines from '../geometry/line/index.js';
import {Lines,Polar } from '@ixfxfun/geometry';
//import * as Svg from './index.js';

import { getCssVariable } from '../colour/index.js';
import type { CircleDrawingOpts, LineDrawingOpts, PathDrawingOpts, TextDrawingOpts, TextPathDrawingOpts } from './types.js';
import { applyOpts } from './apply.js';
import { applyStrokeOpts } from './stroke.js';
import { createEl, createOrResolve } from './create.js';
import { applyPathOpts } from './path.js';
import type { CirclePositioned } from '@ixfxfun/geometry/circle';
import type { Line } from '@ixfxfun/geometry/line';
import type { Point } from '@ixfxfun/geometry/point';
//import type { PolarRay } from 'src/geometry/polar/Types.js';
//import { toCartesian as polarRayToCartesian } from 'src/geometry/polar/Ray.js';
//import {Palette} from ".";

const numberOrPercentage = (v: number): string => {
  if (v >= 0 && v <= 1) return `${ v * 100 }%`;
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
export const path = (
  svgOrArray: string | ReadonlyArray<string>,
  parent: SVGElement,
  opts?: PathDrawingOpts,
  queryOrExisting?: string | SVGPathElement
): SVGPathElement => {
  const elem = createOrResolve<SVGPathElement>(
    parent,
    `path`,
    queryOrExisting
  );
  const svg =
    typeof svgOrArray === `string` ? svgOrArray : svgOrArray.join(`\n`);

  elem.setAttributeNS(null, `d`, svg);
  parent.append(elem);
  return pathUpdate(elem, opts);
};

export const pathUpdate = (
  elem: SVGPathElement,
  opts?: PathDrawingOpts
) => {
  if (opts) applyOpts(elem, opts);
  if (opts) applyStrokeOpts(elem, opts);
  return elem;
};

/**
 * Updates an existing `SVGCircleElement` with potentially updated circle data and drawing options
 * @param elem Element
 * @param circle Circle
 * @param opts Drawing options
 * @returns SVGCircleElement
 */
export const circleUpdate = (
  elem: SVGCircleElement,
  circle: CirclePositioned,
  opts?: CircleDrawingOpts
) => {
  elem.setAttributeNS(null, `cx`, circle.x.toString());
  elem.setAttributeNS(null, `cy`, circle.y.toString());
  elem.setAttributeNS(null, `r`, circle.radius.toString());
  if (opts) applyOpts(elem, opts);
  if (opts) applyStrokeOpts(elem, opts);

  return elem;
};

/**
 * Creates or reuses a `SVGCircleElement`.
 *
 * To update an existing element, use `circleUpdate`
 * @param circle
 * @param parent
 * @param opts
 * @param queryOrExisting
 * @returns
 */
export const circle = (
  circle: CirclePositioned,
  parent: SVGElement,
  opts?: CircleDrawingOpts,
  queryOrExisting?: string | SVGCircleElement
): SVGCircleElement => {
  const p = createOrResolve<SVGCircleElement>(
    parent,
    `circle`,
    queryOrExisting
  );
  return circleUpdate(p, circle, opts);
};

/**
 * Creates or resuses a `SVGGElement` (group)
 *
 * To update an existing elemnet, use `groupUpdate`
 * @param children
 * @param parent
 * @param queryOrExisting
 * @returns
 */
export const group = (
  children: ReadonlyArray<SVGElement>,
  parent: SVGElement,
  queryOrExisting?: string | SVGGElement
): SVGGElement => {
  const p = createOrResolve<SVGGElement>(parent, `g`, queryOrExisting);
  return groupUpdate(p, children);
};

export const groupUpdate = (
  elem: SVGGElement,
  children: ReadonlyArray<SVGElement>
) => {
  for (const c of children) {
    if (c.parentNode !== elem) {
      elem.append(c);
    }
  }

  return elem;
};

/**
 * Creates or reuses a SVGLineElement.
 *
 * @param line
 * @param parent
 * @param opts
 * @param queryOrExisting
 * @returns
 */
export const line = (
  line: Line,
  parent: SVGElement,
  opts?: LineDrawingOpts,
  queryOrExisting?: string | SVGLineElement
): SVGLineElement => {
  const lineEl = createOrResolve<SVGLineElement>(
    parent,
    `line`,
    queryOrExisting
  );
  return lineUpdate(lineEl, line, opts);
};

/**
 * Updates a SVGLineElement instance with potentially changed line and drawing data
 * @param lineEl
 * @param line
 * @param opts
 * @returns
 */
export const lineUpdate = (
  lineEl: SVGLineElement,
  line: Line,
  opts?: LineDrawingOpts
) => {
  lineEl.setAttributeNS(null, `x1`, line.a.x.toString());
  lineEl.setAttributeNS(null, `y1`, line.a.y.toString());
  lineEl.setAttributeNS(null, `x2`, line.b.x.toString());
  lineEl.setAttributeNS(null, `y2`, line.b.y.toString());
  if (opts) applyOpts(lineEl, opts);
  if (opts) applyPathOpts(lineEl, opts);
  if (opts) applyStrokeOpts(lineEl, opts);
  return lineEl;
};

export const polarRayUpdate = (lineEl: SVGLineElement, ray: Polar.PolarRay, opts?: LineDrawingOpts) => {
  const l = Polar.Ray.toCartesian(ray);
  lineEl.setAttributeNS(null, `x1`, l.a.x.toString());
  lineEl.setAttributeNS(null, `y1`, l.a.y.toString());
  lineEl.setAttributeNS(null, `x2`, l.b.x.toString());
  lineEl.setAttributeNS(null, `y2`, l.b.y.toString());
  if (opts) applyOpts(lineEl, opts);
  if (opts) applyPathOpts(lineEl, opts);
  if (opts) applyStrokeOpts(lineEl, opts);
  return lineEl;
}

/**
 * Updates an existing SVGTextPathElement instance with text and drawing options
 * @param el
 * @param text
 * @param opts
 * @returns
 */
export const textPathUpdate = (
  el: SVGTextPathElement,
  text?: string,
  opts?: TextPathDrawingOpts
) => {
  if (opts?.method) el.setAttributeNS(null, `method`, opts.method);
  if (opts?.side) el.setAttributeNS(null, `side`, opts.side);
  if (opts?.spacing) el.setAttributeNS(null, `spacing`, opts.spacing);
  if (opts?.startOffset) {
    el.setAttributeNS(null, `startOffset`, numberOrPercentage(opts.startOffset));
  }
  if (opts?.textLength) {
    el.setAttributeNS(null, `textLength`, numberOrPercentage(opts.textLength));
  }

  if (text) {
    el.textContent = text;
  }
  if (opts) applyOpts(el, opts);
  if (opts) applyStrokeOpts(el, opts);
  return el;
};

/**
 * Creates or reuses a SVGTextPathElement.
 * @param pathReference
 * @param text
 * @param parent
 * @param opts
 * @param textQueryOrExisting
 * @param pathQueryOrExisting
 * @returns
 */
export const textPath = (
  pathReference: string,
  text: string,
  parent: SVGElement,
  opts?: TextPathDrawingOpts,
  textQueryOrExisting?: string | SVGTextElement,
  pathQueryOrExisting?: string | SVGTextPathElement
): SVGTextPathElement => {
  const textEl = createOrResolve<SVGTextElement>(
    parent,
    `text`,
    textQueryOrExisting, `-text`
  );
  // Update text properties, but don't pass in position or text
  textUpdate(textEl, undefined, undefined, opts);

  const p = createOrResolve<SVGTextPathElement>(
    textEl,
    `textPath`,
    pathQueryOrExisting
  );
  p.setAttributeNS(null, `href`, pathReference);
  return textPathUpdate(p, text, opts);
};

/**
 * Updates an existing SVGTextElement instance with position, text and drawing options
 * @param el
 * @param pos
 * @param text
 * @param opts
 * @returns
 */
export const textUpdate = (
  el: SVGTextElement,
  pos?: Point,
  text?: string,
  opts?: TextDrawingOpts
) => {
  if (pos) {
    el.setAttributeNS(null, `x`, pos.x.toString());
    el.setAttributeNS(null, `y`, pos.y.toString());
  }
  if (text) {
    el.textContent = text;
  }

  if (opts) {
    applyOpts(el, opts);
    if (opts) applyStrokeOpts(el, opts);

    if (opts.anchor) el.setAttributeNS(null, `text-anchor`, opts.anchor);
    if (opts.align) el.setAttributeNS(null, `alignment-baseline`, opts.align);

    const userSelect = opts.userSelect ?? true;

    if (!userSelect) {
      el.style.userSelect = `none`;
      el.style.webkitUserSelect = `none`;
    }
  }
  return el;
};

/**
 * Creates or reuses a SVGTextElement
 * @param pos Position of text
 * @param text Text
 * @param parent
 * @param opts
 * @param queryOrExisting
 * @returns
 */
export const text = (
  text: string,
  parent: SVGElement,
  pos?: Point,
  opts?: TextDrawingOpts,
  queryOrExisting?: string | SVGTextElement
): SVGTextElement => {
  const p = createOrResolve<SVGTextElement>(
    parent,
    `text`,
    queryOrExisting
  );
  return textUpdate(p, pos, text, opts);
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
export const grid = (
  parent: SVGElement,
  center: Point,
  spacing: number,
  width: number,
  height: number,
  opts: LineDrawingOpts = {}
) => {
  if (!opts.strokeStyle) {
    opts = { ...opts, strokeStyle: getCssVariable(`bg-dim`, `silver`) };
  }
  if (!opts.strokeWidth) opts = { ...opts, strokeWidth: 1 };

  const g = createEl<SVGGElement>(`g`);
  applyOpts(g, opts);
  applyPathOpts(g, opts);
  applyStrokeOpts(g, opts);

  // Horizontals
  let y = 0;
  while (y < height) {
    const horiz = Lines.fromNumbers(0, y, width, y);
    line(horiz, g);
    y += spacing;
  }

  // Verticals
  let x = 0;
  while (x < width) {
    const vert = Lines.fromNumbers(x, 0, x, height);
    line(vert, g);
    x += spacing;
  }
  parent.append(g);
  return g;
};
