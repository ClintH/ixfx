
import { DataSet } from "./DataSet.js";
import * as Cart from './cartesian.js';
import { round } from "@ixfx/numbers";
import type { GridStyle, LineStyle, SeriesMeta, ShowOptions, TextStyle } from "./types.js";
import type { RecursivePartial } from "@ixfx/core";
import type { CanvasRegion, CanvasRegionSpec } from "../canvas-region.js";
import { CanvasSource } from "../canvas-region.js";
import { resolveEl } from "@ixfx/dom";
import { ElementSizer } from "@ixfx/dom";
import type { RectPositioned } from "@ixfx/geometry/rect";
import { Points, Rects } from "@ixfx/geometry";
import type { Line } from "@ixfx/geometry/line";
import type { Point } from "@ixfx/geometry/point";
import { goldenAngleColour } from "../colour/generate.js";
import { toCssColour as ColourToString } from "../colour/conversion.js";
export type InsertOptions = {
  region?: CanvasRegionSpec
  /**
   * Parent to insert CANVAS element into.
   * If undefined, it will be added to the body.
   */
  parent?: HTMLElement | string
  /**
   * How canvas should be sized
   */
  canvasResizeTo: `parent` | `viewport`
};


export const insert = (insertOptions: InsertOptions, options: RecursivePartial<Cart.CartesianPlotOptions> = {}) => {

  const parentEl = (insertOptions.parent === undefined) ? document.body : resolveEl(insertOptions.parent);
  const canvasEl = document.createElement(`canvas`);
  parentEl.prepend(canvasEl);

  const ds = new DataSet<Cart.PlotPoint, SeriesMeta>();

  const source = new CanvasSource(canvasEl, `min`);
  const spec = insertOptions.region ?? ({ relativePositioned: { x: 0, y: 0, width: 1, height: 1 } });
  const region = source.createRegion(spec);
  const p = new CartesianCanvasPlot(region, ds, options);

  if (insertOptions.canvasResizeTo === `viewport`) {
    ElementSizer.canvasViewport(canvasEl, {
      onSetSize: (size, _el) => {
        source.setLogicalSize(size);
        p.invalidateRange();
        p.draw();
      }
    });
  } else {
    // Parent
    ElementSizer.canvasParent(canvasEl, {
      onSetSize: (size, _el) => {
        source.setLogicalSize(size);
        p.invalidateRange();
        p.draw();
      }
    });
  }
  return p;
}


/**
 * Simple plotting of cartesian values.
 * 
 * Create a plot that fills screen
 * ```js
 * const p = Plot.insert({fill`viewport});
 * const dataSet = p.dataSet;
 * 
 * // Add data
 * ds.add({ x: 1, y: 2 });
 * 
 * // Draw
 * p.draw();
 * ```
 *
 * Create a plot that fills a container
 * ```js
 * const p = Plot.insert({parent:`#someel`});
 * ```
 * 
 * Add data using the created data set
 * ```js
 * 
 * // Add a value to the `alpha` series
 * p.dataSet.add({x:1,y:1}, `alpha`);
 * ```
 * 
 * Set default series formatting
 * ```js
 * p.setMeta(`default`, {
 *  colour: `hsl(50,100%,50%)`,
 *  lineWidth: 10
 * });
 * ```
 * 
 * Series can have metadata associated with it in the DataSet
 * ```js
 * // Use 'pink' by default for the series 'alpha'
 * p.setMeta(`alpha`, { colour: `pink` });
 * ``
 * 
 */
export class CartesianCanvasPlot {
  #data;
  #lastDataChange;
  #canvasRegion: CanvasRegion;

  actualDataRange: RectPositioned = Rects.EmptyPositioned;
  visibleRange: RectPositioned = Rects.PlaceholderPositioned;
  show: ShowOptions;
  whiskerLength: number;
  axisRounder = round(1, true);
  onInvalidated: undefined | (() => void);

  /**
   * List of lines to draw after drawing everything else.
   * Lines are given in value-coordinate space
   */
  overlayLines: (Line & LineStyle)[] = [];
  #grid: GridStyle
  #rangeMode;

  #currentRange?: Cart.CartesianDataRange;

  #axisStyle: LineStyle;
  #valueStyle;
  #connectStyle;
  #rangeManual: Cart.PointMinMax | undefined;
  #textStyle: TextStyle;
  #visualPadding: number;
  #visualClear: `region` | `canvas`;

  constructor(cr: CanvasRegion, data: DataSet<Cart.PlotPoint, SeriesMeta>, options: RecursivePartial<Cart.CartesianPlotOptions> = {}) {
    if (!data) throw new TypeError(`Param 'data' is undefined`);
    if (typeof data !== `object`) throw new TypeError(`Param 'data' is not an object. Got: ${ typeof data }`);
    this.onInvalidated = options.onInvalidated as undefined | (() => void);
    this.#data = data;
    this.#canvasRegion = cr;
    this.#lastDataChange = 0;
    this.#visualClear = options.clear ?? `region`;
    this.#rangeMode = options.range ?? `auto`;
    this.#valueStyle = options.valueStyle ?? `dot`;
    this.#connectStyle = options.connectStyle ?? ``;
    this.whiskerLength = options.whiskerLength ?? 5;
    this.#visualPadding = options.visualPadding ?? 20;
    this.show = {
      axes: true,
      axisValues: true,
      grid: true,
      whiskers: true,
      ...options.show
    };

    this.#axisStyle = {
      colour: `black`,
      width: 2,
      ...options.axisStyle
    };
    this.#textStyle = {
      colour: `black`,
      size: `1em`,
      font: `system-ui`,
      ...options.textStyle
    };

    this.#grid = {
      increments: 0.1,
      major: 5,
      colour: `whitesmoke`,
      width: 1,
      ...options.grid
    }
  }

  getCurrentRange() {
    if (this.#data.lastChange === this.#lastDataChange && this.#currentRange) return this.#currentRange;
    this.#lastDataChange = this.#data.lastChange;
    const r = this.#createRange();
    this.#currentRange = r;
    if (this.onInvalidated) this.onInvalidated();
    return r;
  }

  invalidateRange() {
    this.#currentRange = undefined;
  }

  #createRange(): Cart.CartesianDataRange {
    // Compute scale of data
    const range = this.getDataRange(); // actual data range, or user-provided

    const absDataToRelative = Cart.relativeCompute(range);
    const relDataToAbs = Cart.absoluteCompute(range);
    const cr = this.#canvasRegion;
    const padding = this.#visualPadding;

    // Offsets are in canvas coordinates, not region
    // eg 0,0 is top-left corner of canvas
    let xOffset = cr.x + padding;
    let yOffset = cr.y + padding;

    const allowedHeight = cr.height - (padding * 2);
    const allowedWidth = cr.width - (padding * 2);
    const dimensionMin = Math.min(allowedHeight, allowedWidth);;

    if (allowedWidth >= allowedHeight) {
      // Landscape
      xOffset += (allowedWidth / 2) - (dimensionMin / 2);
    } else {
      // Portrait
      yOffset += (allowedHeight / 2) - (dimensionMin / 2);
    }

    const relDataToCanvas = (pt: Point) => {
      let { x, y } = pt;
      if (x === Number.NEGATIVE_INFINITY) x = 0;
      else if (x === Number.POSITIVE_INFINITY) x = 1;
      if (y === Number.NEGATIVE_INFINITY) y = 0;
      else if (y === Number.POSITIVE_INFINITY) y = 1;
      x = x * dimensionMin;
      y = (1 - y) * dimensionMin;

      x += xOffset;
      y += yOffset;

      return { x, y }
    };

    const canvasToRelData = (pt: Point) => {
      let { x, y } = pt;
      x -= xOffset;
      y -= yOffset;
      x = x / dimensionMin;
      y = 1 - (y / dimensionMin);
      return { x, y }
    };

    // Convert region-space to plot area relative
    const regionSpaceToRelative = (pt: Point) => {
      let { x, y } = pt;
      x = x - cr.x + this.#visualPadding;
      y = (dimensionMin + this.#visualPadding) - y;
      x /= dimensionMin;
      y = (y / dimensionMin);
      return { x, y }
    }

    return {
      absDataToRelative, relDataToCanvas, canvasToRelData, regionSpaceToRelative, relDataToAbs, range
    }
  }


  /**
   * Positions an element at the viewport location of `data` point.
   * Ensure the element has `position:absolute` set.
   * @param data 
   * @param elementToPosition 
   * @param by 
   */
  positionElementAt(data: Point, elementToPosition: HTMLElement | string, by: `middle` | `top-left` = `middle`, relativeToQuery?: HTMLElement | string) {
    const el = resolveEl(elementToPosition);
    let { x, y } = this.valueToScreenSpace(data);
    // x -= this.canvasSource.offset.x;
    // y -= this.canvasSource.offset.y;
    if (by === `middle`) {
      const bounds = el.getBoundingClientRect();
      x -= bounds.width / 2;
      y -= bounds.height / 2;
    } else if (by === `top-left`) {
      // no-op
    } else throw new Error(`Param 'by' expected to be 'middle' or 'top-left'.`);
    if (relativeToQuery) {
      const relativeTo = resolveEl(relativeToQuery);
      const bounds = relativeTo.getBoundingClientRect();

      //console.log(`Plot relativeTo: ${ relativeTo.scrollTop } y:  ${ bounds.y }`);
      x -= bounds.x;
      y -= bounds.y;
    }
    el.style.left = `${ x }px`;
    el.style.top = `${ y }px`;
  }

  /**
   * When range is auto, returns the range of the data
   * Otherwise returns the user-provided range.
   * @returns 
   */
  getDataRange(): Cart.PointMinMax {
    if (this.#rangeMode === `auto`) {
      return Cart.computeMinMax([ ...this.#data.getValues() ]);
    } else {
      if (!this.#rangeManual) {
        this.#rangeManual = Cart.computeMinMax([ this.#rangeMode.max, this.#rangeMode.min ]);
      }
      return this.#rangeManual;
    }
  }

  valueToScreenSpace(dataPoint: Point) {
    const region = this.valueToRegionSpace(dataPoint);
    const offset = this.canvasSource.offset;
    const scr = {
      x: region.x + offset.x,
      y: region.y + offset.y
    }
    return scr;
  }

  valueToRegionSpace(dataValue: Point, debug = false) {
    const ds = this.getCurrentRange();

    // Scale absolute value relative to total dimensions of data
    const rel = ds.absDataToRelative(dataValue);

    // Scale relative data value to canvas space
    const region = ds.relDataToCanvas(rel);

    if (debug) console.log(`orig: ${ dataValue.x }x${ dataValue.y } rel: ${ rel.x }x${ rel.y } region: ${ region.x }x${ region.y }`);
    return {
      ...dataValue,
      x: region.x,
      y: region.y
    }
  }

  // #regionSpaceToValue(scr: Point, clamped: boolean) {
  //   const ds = this.getCurrentRange();

  //   const rel = ds.regionSpaceToRelative(scr);
  //   //console.log(`regionSpaceToRelative ${ rel.x.toFixed(2) },${ rel.y.toFixed(2) }`);

  //   const value = ds.relDataToAbs(rel);
  //   //if (debug) console.log(`orig: ${ a.x }x${ a.y } rel: ${ rel.x }x${ rel.y } scr: ${ scr.x }x${ scr.y }`);

  //   const pt = {
  //     ...scr,
  //     x: value.x,
  //     y: value.y
  //   }
  //   if (clamped) return clamp(pt);
  //   return pt;
  // }

  /**
   * Converts a point in pixel coordinates to a value.
   * Useful for converting from user input coordinates.
   * @param point 
   * @returns 
   */
  pointToValue(point: Point, _source: `screen`) {
    const ds = this.getCurrentRange();

    // Apply offset
    const canvasPoint = Points.subtract(point, this.canvasSource.offset);

    const v = ds.canvasToRelData(canvasPoint);
    return ds.relDataToAbs(v);
  }

  // valueToScreen(a: Point) {
  //   const ds = this.getCurrentRange();
  //   const rel = ds.valueToRelative(a);
  //   const scr = ds.relativeToElementSpace(rel);
  //   const bounds = this.helper.el.getBoundingClientRect();
  //   return {
  //     x: scr.x + bounds.x,
  //     y: scr.y + bounds.y
  //   }
  // }

  // valueRectToScreen(a: Point, b: Point): RectPositioned {
  //   a = this.valueToScreen(a);
  //   b = this.valueToScreen(b);
  //   return {
  //     x: a.x,
  //     y: b.y,
  //     width: b.x - a.x,
  //     height: a.y - b.y
  //   }
  // }

  /**
   * Compute canvas-relative coordinates based on two points in value space
   * @param valueA 
   * @param valueB 
   */
  #valueLineToCanvasSpace(valueA: Point, valueB: Point, debug = false): Line {
    valueA = this.valueToRegionSpace(valueA, debug) as Point;
    valueB = this.valueToRegionSpace(valueB, debug) as Point;
    return { a: valueA, b: valueB };
  }

  getDefaultMeta(): SeriesMeta {
    return {
      colour: goldenAngleColour(this.#data.metaCount),
      lineWidth: 2,
      dotRadius: 5
    }
  }

  draw() {
    if (this.#visualClear === `region`) {
      this.#canvasRegion.clear();
    } else {
      this.canvasSource.clear();
    }

    //const ctx = this.helper.ctx;
    //this.helper.drawBounds(`whitesmoke`);
    //Drawing.rect(ctx, this.renderArea, { strokeStyle: `whitesmoke` });

    this.#useGrid();
    if (this.show.axes) this.#drawAxes();

    //let seriesCount = 0;
    for (const [ k, v ] of this.#data.getEntries()) {
      let meta = this.#data.getMeta(k);
      if (!meta) {
        meta = this.getDefaultMeta();
        this.#data.setMeta(k, meta);
      }
      this.#drawSeries(k, v, meta);
      //seriesCount++;
    }
    //console.log(`series count: ${ seriesCount }`);
    for (const line of this.overlayLines) {
      this.drawLine(line, line.colour, line.width);
    }
  }

  /**
   * Draws a line in value-coordinate space
   * @param line 
   * @param colour 
   * @param width 
   */
  drawLine(line: Line, colour: string, width: number) {
    const l = this.#valueLineToCanvasSpace(line.a, line.b);
    this.#drawLineCanvasSpace(l, colour, width);
  }

  setMeta(series: string, meta: Partial<SeriesMeta>) {
    this.#data.setMeta(series, {
      ...this.getDefaultMeta(),
      ...meta
    })
  }

  #drawAxes() {
    const { colour, width } = this.#axisStyle;
    // Axis coordinates in canvas-space
    const yAxis = this.#valueLineToCanvasSpace({ x: 0, y: Number.NEGATIVE_INFINITY }, { x: 0, y: Number.POSITIVE_INFINITY }, false);
    const xAxis = this.#valueLineToCanvasSpace({ x: Number.NEGATIVE_INFINITY, y: 0 }, { x: Number.POSITIVE_INFINITY, y: 0 }, false);

    //console.log(`x axis: ${ xAxis.a.x }-${ xAxis.b.x }`);
    this.#drawLineCanvasSpace(xAxis, colour, width, false);
    this.#drawLineCanvasSpace(yAxis, colour, width, false);
  }


  #drawYAxisValues(yPoints: Point[]) {
    //const { ctx } = this.helper;
    const ctx = this.#canvasRegion.context;

    ctx.font = this.#textStyle.size + ` ` + this.#textStyle.font;
    ctx.fillStyle = this.#textStyle.colour;
    ctx.textBaseline = `middle`;


    for (const p of yPoints) {
      if (p.x === 0 && p.y === 0) continue;
      const reg = this.valueToRegionSpace(p, false);
      const value = this.axisRounder(p.y);
      const label = value.toString();
      const measure = ctx.measureText(label);
      const x = reg.x - measure.width - (this.whiskerLength / 2) - 5;
      const y = reg.y;
      ctx.fillText(label, x, y);
    }
  }

  #drawXAxisValues(xPoints: Point[]) {
    //const { ctx } = this.helper;
    const ctx = this.#canvasRegion.context;
    ctx.font = this.#textStyle.size + ` ` + this.#textStyle.font;
    ctx.fillStyle = this.#textStyle.colour;
    ctx.textBaseline = `top`;
    for (const p of xPoints) {
      const reg = this.valueToRegionSpace(p, false);
      const value = this.axisRounder(p.x);
      const label = value.toString();
      const measure = ctx.measureText(label);
      const x = reg.x - measure.width / 2;
      const y = reg.y + measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + (this.whiskerLength / 2);
      ctx.fillText(label, x, y);
    }
  }

  #drawWhisker(p: Cart.AxisMark, vertical: boolean) {
    const whiskerHalfLength = this.whiskerLength / 2;
    const v = vertical ? { x: p.x, y: 0 } : { y: p.y, x: 0 }
    const reg = this.valueToRegionSpace(v, false);

    const line = vertical ? {
      a: { x: reg.x, y: reg.y - whiskerHalfLength },
      b: { x: reg.x, y: reg.y + whiskerHalfLength },
    } :
      {
        a: { y: reg.y, x: reg.x - whiskerHalfLength },
        b: { y: reg.y, x: reg.x + whiskerHalfLength },
      }
    this.#drawLineCanvasSpace(line, this.#axisStyle.colour, this.#axisStyle.width, false);
  }

  #drawGridline(p: Cart.AxisMark, vertical: boolean) {
    const line = vertical ?
      this.#valueLineToCanvasSpace({ x: p.x, y: Number.NEGATIVE_INFINITY }, { x: p.x, y: Number.POSITIVE_INFINITY }) :
      this.#valueLineToCanvasSpace({ y: p.y, x: Number.NEGATIVE_INFINITY }, { y: p.y, x: Number.POSITIVE_INFINITY }, false);
    this.#drawLineCanvasSpace(line, this.#grid.colour, p.major ? this.#grid.width * 2 : this.#grid.width);
  }

  #useGrid() {
    const g = this.#grid;
    const showGrid = this.show.grid;
    const showWhiskers = this.show.whiskers;
    const showValues = this.show.axisValues;
    const mm = this.getCurrentRange().range; // actual data range, or user-provided
    const { increments, major } = g;

    // Vertical lines
    const axisMarks = Cart.computeAxisMark(mm, increments, major);
    for (const p of axisMarks.x) {
      if (showGrid) this.#drawGridline(p, true);
      if (showWhiskers && p.major) this.#drawWhisker(p, true);
    }

    // Horizontal lines
    for (const p of axisMarks.y) {
      if (showGrid) this.#drawGridline(p, false);
      if (showWhiskers && p.major) this.#drawWhisker(p, false);
    }

    if (showValues) {
      this.#drawXAxisValues(axisMarks.x.filter(p => p.major));
      this.#drawYAxisValues(axisMarks.y.filter(p => p.major));
    }
  }

  #drawSeries(name: string, series: Cart.PlotPoint[], meta: SeriesMeta) {
    if (this.#connectStyle === `line`) {
      this.#drawConnected(series, meta.colour, meta.lineWidth);
    }

    //let valueCount = 0;
    if (this.#valueStyle === `dot`) {
      for (const v of series) {
        this.#drawDot(v, meta.colour, meta.dotRadius);
        //valueCount++;
      }
    }
    //console.log(`valueCount: ${ valueCount }`);
  }

  #drawConnected(dots: Cart.PlotPoint[], colour: string, width: number) {
    const ctx = this.#canvasRegion.context;
    ctx.beginPath();
    for (const [ index, dot_ ] of dots.entries()) {
      const dot = this.valueToRegionSpace(dot_, false);
      if (index === 0) ctx.moveTo(dot.x, dot.y);
      ctx.lineTo(dot.x, dot.y);
    }
    ctx.strokeStyle = ColourToString(colour);
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.closePath();
  }

  #drawDot(originalDot: Cart.PlotPoint, fallbackColour: string, fallbackRadius: number) {
    const colour = ColourToString(originalDot.fillStyle ?? fallbackColour);
    const pos = this.valueToRegionSpace(originalDot);
    const radius = originalDot.radius ?? fallbackRadius;
    this.#canvasRegion.drawCircles([
      { ...pos, radius }
    ], colour);

    // const ctx = this.helper.ctx;
    // const dot = this.#valueToElementSpace(originalDot, false);
    // const radius = originalDot.radius ?? fallbackRadius;
    // //console.log(`dot ${ dot.x }x${ dot.y } (from ${ originalDot.x }x${ originalDot.y })`);
    // ctx.fillStyle = Colour.resolveToString(originalDot.fillStyle ?? fallbackColour);
    // ctx.beginPath();
    // ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.closePath();
  }


  #drawLineCanvasSpace(line: Line, colour: string, width: number, debug = false) {
    if (debug) console.log(line);
    const ctx = this.#canvasRegion.context;

    colour = ColourToString(colour);
    //this.#canvasRegion.drawConnectedPoints([ line.a, line.b ], colour, width);
    ctx.beginPath();
    ctx.moveTo(line.a.x, line.a.y);
    ctx.lineTo(line.b.x, line.b.y);
    ctx.strokeStyle = ColourToString(colour);
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.closePath();
  }

  get dataSet() {
    return this.#data;
  }

  get canvasRegion() {
    return this.#canvasRegion;
  }

  get canvasSource() {
    return this.#canvasRegion.source;
  }
}