/* eslint-disable unicorn/no-null */
import type { CirclePositioned } from '../geometry/circle/CircleType.js';
import type { Point } from '../geometry/point/PointType.js';
import type { Line } from '../geometry/line/LineType.js';
//import * as Lines from '../geometry/line/index.js';
import { fromNumbers as LinesFromNumbers } from 'src/geometry/line/FromNumbers.js';
import * as Svg from './Svg.js';
import { getCssVariable } from './Colour.js';
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
  opts?: Svg.PathDrawingOpts,
  queryOrExisting?: string | SVGPathElement
): SVGPathElement => {
  const elem = Svg.createOrResolve<SVGPathElement>(
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
  opts?: Svg.PathDrawingOpts
) => {
  if (opts) Svg.applyOpts(elem, opts);
  if (opts) Svg.applyStrokeOpts(elem, opts);
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
  opts?: Svg.CircleDrawingOpts
) => {
  elem.setAttributeNS(null, `cx`, circle.x.toString());
  elem.setAttributeNS(null, `cy`, circle.y.toString());
  elem.setAttributeNS(null, `r`, circle.radius.toString());
  if (opts) Svg.applyOpts(elem, opts);
  if (opts) Svg.applyStrokeOpts(elem, opts);

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
  opts?: Svg.CircleDrawingOpts,
  queryOrExisting?: string | SVGCircleElement
): SVGCircleElement => {
  const p = Svg.createOrResolve<SVGCircleElement>(
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
  const p = Svg.createOrResolve<SVGGElement>(parent, `g`, queryOrExisting);
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
  opts?: Svg.LineDrawingOpts,
  queryOrExisting?: string | SVGLineElement
): SVGLineElement => {
  const lineEl = Svg.createOrResolve<SVGLineElement>(
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
  opts?: Svg.LineDrawingOpts
) => {
  lineEl.setAttributeNS(null, `x1`, line.a.x.toString());
  lineEl.setAttributeNS(null, `y1`, line.a.y.toString());
  lineEl.setAttributeNS(null, `x2`, line.b.x.toString());
  lineEl.setAttributeNS(null, `y2`, line.b.y.toString());
  if (opts) Svg.applyOpts(lineEl, opts);
  if (opts) Svg.applyPathOpts(lineEl, opts);
  if (opts) Svg.applyStrokeOpts(lineEl, opts);
  return lineEl;
};

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
  opts?: Svg.TextPathDrawingOpts
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
    //eslint-disable-next-line functional/immutable-data
    el.textContent = text;
  }
  if (opts) Svg.applyOpts(el, opts);
  if (opts) Svg.applyStrokeOpts(el, opts);
  return el;
};

/**
 * Creates or reuses a SVGTextPathElement.
 * @param pathRef
 * @param text
 * @param parent
 * @param opts
 * @param queryOrExisting
 * @returns
 */
export const textPath = (
  pathReference: string,
  text: string,
  parent: SVGElement,
  opts?: Svg.TextPathDrawingOpts,
  textQueryOrExisting?: string | SVGTextElement,
  pathQueryOrExisting?: string | SVGTextPathElement
): SVGTextPathElement => {
  const textEl = Svg.createOrResolve<SVGTextElement>(
    parent,
    `text`,
    textQueryOrExisting, `-text`
  );
  // Update text properties, but don't pass in position or text
  textUpdate(textEl, undefined, undefined, opts);

  const p = Svg.createOrResolve<SVGTextPathElement>(
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
  opts?: Svg.TextDrawingOpts
) => {
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
    if (opts) Svg.applyStrokeOpts(el, opts);

    if (opts.anchor) el.setAttributeNS(null, `text-anchor`, opts.anchor);
    if (opts.align) el.setAttributeNS(null, `alignment-baseline`, opts.align);

    const userSelect = opts.userSelect ?? true;

    if (!userSelect) {
      //eslint-disable-next-line functional/immutable-data
      el.style.userSelect = `none`;
      //eslint-disable-next-line functional/immutable-data
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
  opts?: Svg.TextDrawingOpts,
  queryOrExisting?: string | SVGTextElement
): SVGTextElement => {
  const p = Svg.createOrResolve<SVGTextElement>(
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
  opts: Svg.LineDrawingOpts = {}
) => {
  if (!opts.strokeStyle) {
    opts = { ...opts, strokeStyle: getCssVariable(`bg-dim`, `silver`) };
  }
  if (!opts.strokeWidth) opts = { ...opts, strokeWidth: 1 };

  const g = Svg.createEl<SVGGElement>(`g`);
  Svg.applyOpts(g, opts);
  Svg.applyPathOpts(g, opts);
  Svg.applyStrokeOpts(g, opts);

  // Horizontals
  //eslint-disable-next-line functional/no-let
  let y = 0;
  while (y < height) {
    const horiz = LinesFromNumbers(0, y, width, y);
    line(horiz, g);
    y += spacing;
  }

  // Verticals
  //eslint-disable-next-line functional/no-let
  let x = 0;
  while (x < width) {
    const vert = LinesFromNumbers(x, 0, x, height);
    line(vert, g);
    x += spacing;
  }
  parent.append(g);
  return g;
};
