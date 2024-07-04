import { type ICircularArray } from '../collections/CircularArray.js';
import { resolveEl } from '../dom/ResolveEl.js';
import * as Colour from './Colour.js';
import * as Drawing from './Drawing.js';
import {
  ofArrayMutable,
  ofCircularMutable,
  type IMapOfMutableExtended,
} from '../collections/map/index.js';
import type { Rect, Point } from '../geometry/Types.js';
import { parentSizeCanvas } from '../dom/CanvasSizing.js';
import { minMaxAvg } from '../data/arrays/MinMaxAvg.js';

export type Plotter = {
  add(value: number, series?: string, skipDrawing?: boolean): void;
  drawValue(index: number): void;
  /**
   * Draws current data. Useful if skipDrawing was true for earlier add() calls.
   */
  draw(): void;
  clear(): void;
  dispose(): void;
};

/**
 * Series
 */
export type Series = {
  min: number;
  max: number;
  range: number;
  name: string;
  colour: string;
  lastValue?: number;
  hoverValue?: number;
};

/**
 * Drawing options
 */
export type DrawingOpts = PlotOpts & {
  x: Axis;
  y: Axis;
  ctx: CanvasRenderingContext2D;
  textHeight: number;
  capacity: number;
  coalesce: boolean;
  margin: number;
  canvasSize: Rect;
  clearCanvas: boolean;
  translucentPlot?: boolean;
  highlightIndex?: number;
  leadingEdgeDot: boolean;
  debug: boolean;
  digitsPrecision: number;
  lineWidth: number;
  defaultSeriesColour: string;
  defaultSeriesVariable?: string;
  showLegend: boolean;
  pointer: { x: number; y: number };
};

/**
 * Properties for an axis
 */
export type Axis = {
  allowedSeries?: Array<string>;
  /**
   * Name of axis, eg `x`
   */
  name: string;
  /**
   * Colour to use for axis labels
   */
  colour?: string;
  /**
   * Forced scale for values
   */
  scaleRange?: [ number, number ];
  /**
   * Forced range for labelling, by default
   * uses scaleRange
   */
  labelRange?: [ number, number ];
  /**
   * Width of axis line
   */
  lineWidth: number;
  /**
   * How line ends
   */
  endWith: `none` | `arrow`;
  /**
   * Where to place the name of the axis
   */
  namePosition: `none` | `end` | `side`;
  /**
   * Width for y axis, height for x axis
   */
  textSize: number;
  /**
   * If true, axis labels (ie numeric scale) are shown. Default: true
   */
  showLabels: boolean;
  /**
   * If true, a line is drawn to represent axis. Default: true
   */
  showLine: boolean;
};

export type SeriesColours = Record<string, string | undefined>;

/**
 * Plotter options
 */
export type PlotOpts = {
  debug?: boolean;
  seriesColours?: SeriesColours;
  /**
   * Default: 2
   */
  digitsPrecision?: number;
  x?: Axis;
  y?: Axis;
  plotSize?: Rect;
  autoSizeCanvas?: boolean;
  style?: `connected` | `dots` | `none`;
  //palette?: Palette.Palette
  /**
   * Number of items to keep in the circular array
   * Default: 10
   */
  capacity?: number;
  //showYAxis?:boolean
  //showXAxis?:boolean
  //yAxes?: string[]|string
  textHeight?: number;
  /**
   * Width of plotted line
   */
  lineWidth?: number;
  /**
   * If true, sub-pixel data points are ignored
   */
  coalesce?: boolean;
  /**
   * Fixed range to scale Y values. By default normalises values
   * as they come in. This will also determine the y-axis labels and drawing
   */
  //fixedRange?:[number,number]
  /**
   * How many horizontal pixels per data point. If unspecified,
   * it will scale based on width of canvas and capacity.
   */
  //dataXScale?:number
  defaultSeriesColour?: string;
  defaultSeriesVariable?: string;
  showLegend?: boolean;
};

const piPi = Math.PI * 2;

export const defaultAxis = (name: string): Axis => ({
  endWith: `none`,
  lineWidth: 1,
  namePosition: `none`,
  name: name,
  showLabels: name === `y`,
  showLine: true,
  // For y axis, it's the width, for x axis it's the text height
  textSize: name === `y` ? 20 : 10,
});

export const calcScale = (
  buffer: BufferType,
  drawingOpts: DrawingOpts,
  seriesColours?: SeriesColours
) => {
  //const seriesNames = buffer.keys();
  const scales: Array<Series> = [];

  for (const s of buffer.keys()) {
    //seriesNames.forEach(s => {

    const series = [ ...buffer.get(s) ];
    if (series.length === 0) break;

    let { min, max } = minMaxAvg(series);
    let range = max - min;

    let colour;
    if (seriesColours !== undefined) {
      colour = seriesColours[ s ];
    }
    if (colour == undefined) {
      colour = drawingOpts.defaultSeriesVariable ? Colour.getCssVariable(
        `accent`,
        drawingOpts.defaultSeriesColour
      ) : drawingOpts.defaultSeriesColour;
    }

    if (range === 0) {
      range = min;
      min = min - range / 2;
      max = max + range / 2;
    }
    scales.push({
      min,
      max,
      range,
      name: s,
      colour: colour,
    });
  }
  return scales;
};

export const add = (buffer: BufferType, value: number, series = ``) => {
  buffer.addKeyedValues(series, value);
};

export type BufferType =
  | IMapOfMutableExtended<number, ICircularArray<number>>
  | IMapOfMutableExtended<number, ReadonlyArray<number>>;

export const drawValue = (
  index: number,
  buffer: BufferType,
  drawing: DrawingOpts
) => {
  const c = {
    ...drawing,
    translucentPlot: true,
    leadingEdgeDot: false,
  };
  draw(buffer, c);

  drawing = {
    ...drawing,
    highlightIndex: index,
    leadingEdgeDot: true,
    translucentPlot: false,
    style: `none`,
    clearCanvas: false,
  };
  draw(buffer, drawing);
};

const scaleWithFixedRange = (
  buffer: BufferType,
  range: [ number, number ],
  drawing: DrawingOpts
) =>
  calcScale(buffer, drawing, drawing.seriesColours).map((s) => ({
    ...s,
    range: range[ 1 ] - range[ 0 ],
    min: range[ 0 ],
    max: range[ 1 ],
  }));

/**
 * Draws a `buffer` of data with `drawing` options.
 *
 * @param buffer
 * @param drawing
 */
export const draw = (buffer: BufferType, drawing: DrawingOpts) => {
  const { x: xAxis, y: yAxis, ctx, canvasSize } = drawing;
  const margin = drawing.margin;
  // const cap = drawing.capacity === 0 ? buffer.lengthMax : drawing.capacity;
  const series = drawing.y.scaleRange
    ? scaleWithFixedRange(buffer, drawing.y.scaleRange, drawing)
    : calcScale(buffer, drawing, drawing.seriesColours);

  if (drawing.clearCanvas)
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

  if (drawing.debug) {
    ctx.strokeStyle = `orange`;
    ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
  }

  // Move in for margin
  ctx.translate(margin, margin);

  // Calculate/use plot area
  const plotSize = drawing.plotSize ?? plotSizeFromBounds(canvasSize, drawing);

  // Draw vertical axes
  const axisSize = {
    height: plotSize.height + margin + margin,
    width: plotSize.width,
  };

  if (yAxis.showLabels || yAxis.showLine) {
    // Draw the labels for each series
    for (const s of series) {
      if (yAxis.allowedSeries !== undefined && !yAxis.allowedSeries.includes(s.name)) continue;
      drawYSeriesScale(s, axisSize, drawing);
    }

    // Draw vertical line
    if (series.length > 0 && yAxis.showLine)
      drawYLine(axisSize, series[ 0 ], drawing);
  }

  // Draw x/horizontal axis if needed
  if ((xAxis.showLabels || xAxis.showLine) && series.length > 0) {
    const yPos = yAxis.labelRange ? yAxis.labelRange[ 0 ] : series[ 0 ].min;
    drawXAxis(
      plotSize.width,
      calcYForValue(yPos, series[ 0 ], plotSize.height) +
      margin +
      xAxis.lineWidth,
      drawing
    );
  }

  const plotDrawing = {
    ...drawing,
    plotSize,
  };

  const ptr = Drawing.translatePoint(ctx, drawing.pointer);
  // Draw data for each series
  for (const s of series) {
    const data = buffer.getSource(s.name);
    if (data === undefined) continue;

    let leadingEdgeIndex =
      buffer.typeName === `circular`
        ? (data as ICircularArray<number>).pointer - 1
        : data.length - 1;
    if (drawing.highlightIndex !== undefined)
      leadingEdgeIndex = drawing.highlightIndex;
    ctx.save();
    ctx.translate(0, margin + margin);

    drawSeriesData(s, data, plotSize, plotDrawing, leadingEdgeIndex);
    ctx.restore();
  }

  if (drawing.showLegend) {
    ctx.save();
    ctx.translate(0, plotSize.height + margin + margin + margin);
    const legendSize = {
      width: plotSize.width,
      height: drawing.x.textSize + margin + margin,
    };
    drawLegend(series, drawing, legendSize);
    ctx.restore();
  }
  ctx.resetTransform();
};

/**
 * Draw vertical axis
 * @param series
 * @param height
 * @param drawing
 */
const drawYSeriesScale = (
  series: Series,
  plotSize: Rect,
  drawing: DrawingOpts
) => {
  const { ctx, y, digitsPrecision, margin } = drawing;
  const { height } = plotSize;

  if (drawing.debug) {
    ctx.strokeStyle = `purple`;
    ctx.strokeRect(0, 0, y.textSize, height + margin);
  }

  ctx.fillStyle = series.colour.length > 0 ? series.colour : `white`;

  // Override colour with axis-defined colour
  if (y.colour) ctx.fillStyle = y.colour;

  // Draw labels
  const min = y.labelRange ? y.labelRange[ 0 ] : series.min;
  const max = y.labelRange ? y.labelRange[ 1 ] : series.max;
  const range = y.labelRange ? max - min : series.range;
  const mid = min + range / 2;
  const halfHeight = drawing.textHeight / 2;

  ctx.textBaseline = `top`;
  ctx.fillText(
    min.toFixed(digitsPrecision),
    0,
    calcYForValue(min, series, height) - halfHeight
  );
  ctx.fillText(
    mid.toFixed(digitsPrecision),
    0,
    calcYForValue(mid, series, height) - halfHeight
  );
  ctx.fillText(
    max.toFixed(digitsPrecision),
    0,
    calcYForValue(max, series, height) - margin
  );

  ctx.translate(y.textSize + margin, 0);
};

const drawYLine = (plotSize: Rect, series: Series, drawing: DrawingOpts) => {
  if (series === undefined) throw new Error(`series undefined`);
  const { ctx, y } = drawing;
  const { height } = plotSize;

  const min = y.labelRange ? y.labelRange[ 0 ] : series.min;
  const max = y.labelRange ? y.labelRange[ 1 ] : series.max;

  const minPos = calcYForValue(min, series, height);
  const maxPos = calcYForValue(max, series, height);

  // Draw line
  ctx.translate(y.lineWidth, 0);
  ctx.lineWidth = y.lineWidth;
  ctx.beginPath();
  ctx.moveTo(0, minPos);
  ctx.lineTo(0, maxPos);
  ctx.strokeStyle = series.colour;
  if (y.colour) ctx.strokeStyle = y.colour;
  ctx.stroke();
  ctx.translate(y.lineWidth, 0);
};

const drawLegend = (
  series: Array<Series>,
  drawing: DrawingOpts,
  size: { width: number; height: number }
) => {
  const { ctx } = drawing;
  const lineSampleWidth = 10;

  let x = 0;
  const lineY = drawing.margin * 3;
  const textY = drawing.margin;

  ctx.lineWidth = drawing.lineWidth;

  for (const s of series) {
    ctx.moveTo(x, lineY);
    ctx.strokeStyle = s.colour;
    ctx.lineTo(x + lineSampleWidth, lineY);
    ctx.stroke();
    x += lineSampleWidth + drawing.margin;

    let label = s.name;
    if (s.lastValue)
      label += ` ` + s.lastValue.toFixed(drawing.digitsPrecision);
    const labelSize = ctx.measureText(label);

    ctx.fillStyle = s.colour;
    ctx.fillText(label, x, textY);
    x += labelSize.width;
  }
};

const drawXAxis = (width: number, yPos: number, drawing: DrawingOpts) => {
  const { ctx, x, y } = drawing;

  if (!x.showLine) return;

  if (x.colour) ctx.strokeStyle = x.colour;
  ctx.lineWidth = x.lineWidth;
  ctx.beginPath();

  // Assumes ctx is translated after drawing Y axis
  ctx.moveTo(0, yPos);
  ctx.lineTo(width, yPos);
  ctx.stroke();
};

/**
 * Draw series data
 * @param series
 * @param values
 * @param plotSize
 * @param drawing
 */
const drawSeriesData = (
  series: Series,
  values: ArrayLike<number>,
  plotSize: Rect,
  drawing: DrawingOpts,
  leadingEdgeIndex: number
) => {
  const { ctx, lineWidth, translucentPlot = false, margin, x: xAxis } = drawing;
  const style = drawing.style ?? `connected`;
  const height = plotSize.height - margin;

  let dataXScale = 1;
  if (xAxis.scaleRange) {
    const xAxisRange = xAxis.scaleRange[ 1 ] - xAxis.scaleRange[ 0 ];
    dataXScale = plotSize.width / xAxisRange;
  } else {
    dataXScale = drawing.capacity === 0 ? plotSize.width / values.length : plotSize.width / drawing.capacity;
  }

  // Step through data faster if per-pixel density is above one
  const incrementBy = drawing.coalesce
    ? (dataXScale < 0
      ? Math.floor(1 / dataXScale)
      : 1)
    : 1;

  let x = 0;
  let leadingEdge: Point | undefined;

  if (drawing.debug) {
    ctx.strokeStyle = `green`;
    ctx.strokeRect(0, 0, plotSize.width, plotSize.height);
  }

  const colourTransform = (c: string) => {
    if (translucentPlot) return Colour.opacity(c, 0.2);
    return c;
  };

  if (style === `dots`) {
    ctx.fillStyle = colourTransform(series.colour);
  } else if (style === `none`) {} else {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = colourTransform(series.colour);
  }

  for (let index = 0; index < values.length; index += incrementBy) {
    const y = calcYForValue(values[ index ], series, height) - 1;

    if (style === `dots`) {
      ctx.beginPath();
      ctx.arc(x, y, lineWidth, 0, piPi);
      ctx.fill();
    } else if (style === `none`) {} else {
      if (index == 0) ctx.moveTo(x, y);
      ctx.lineTo(x, y);
    }

    if (index === leadingEdgeIndex) {
      leadingEdge = { x, y };
      series.lastValue = values[ index ];
    }
    x += dataXScale;
  }

  if (style === `connected`) {
    ctx.stroke();
  }

  // Draw a circle at latest data point
  if (leadingEdge !== undefined && drawing.leadingEdgeDot) {
    ctx.beginPath();
    ctx.fillStyle = colourTransform(series.colour); // drawing.palette.getOrAdd(`series${series.name}`));
    ctx.arc(leadingEdge.x, leadingEdge.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
};

const calcYForValue = (v: number, series: Series, height: number) =>
  (1 - (v - series.min) / series.range) * height;

/**
 * Calculates lost area, given a margin value, axis settings.
 * @param margin
 * @param x
 * @param y
 * @param showLegend
 * @returns
 */
const calcSizing = (margin: number, x: Axis, y: Axis, showLegend: boolean) => {
  let fromLeft = margin;
  if (y.showLabels) fromLeft += y.textSize;
  if (y.showLine) fromLeft += y.lineWidth;
  if (y.showLabels || y.showLine) fromLeft += margin + margin;
  const fromRight = margin;

  const fromTop = margin + margin;
  let fromBottom = margin + margin;
  fromBottom += x.showLabels ? x.textSize : margin;
  if (x.showLine) fromBottom += x.lineWidth;
  if (x.showLabels || x.showLine) fromBottom += margin;

  if (showLegend) fromBottom += x.textSize;

  return {
    left: fromLeft,
    right: fromRight,
    top: fromTop,
    bottom: fromBottom,
  };
};

const plotSizeFromBounds = (
  bounds: Rect,
  opts: { margin: number; y: Axis; x: Axis; showLegend: boolean }
): Rect => {
  const { width, height } = bounds;
  const sizing = calcSizing(opts.margin, opts.x, opts.y, opts.showLegend);
  return {
    width: width - sizing.left - sizing.right,
    height: height - sizing.top - sizing.bottom,
  };
};

const canvasSizeFromPlot = (
  plot: Rect,
  opts: { margin: number; y: Axis; x: Axis; showLegend: boolean }
): Rect => {
  const { width, height } = plot;
  const sizing = calcSizing(opts.margin, opts.x, opts.y, opts.showLegend);
  return {
    width: width + sizing.left + sizing.right,
    height: height + sizing.top + sizing.bottom,
  };
};

/**
 * Creates a simple horizontal data plot within a DIV.
 *
 * ```
 * const p = plot(`#parentDiv`);
 * p.add(10);
 * p.clear();
 *
 * // Plot data using series
 * p.add(-1, `temp`);
 * p.add(0.4, `humidty`);
 * ```
 *
 * Options can be specified to customise plot
 * ```
 * const p = plot(`#parentDiv`, {
 *  capacity: 100,     // How many data points to store (default: 10)
 *  showYAxis: false,  // Toggle whether y axis is shown (default: true)
 *  lineWidth: 2,      // Width of plot line (default: 2)
 *  yAxes:  [`temp`],  // Only show these y axes (by default all are shown)
 *  coalesce: true,    // If true, sub-pixel data points are skipped, improving performance for dense plots at the expense of plot precision
 * });
 * ```
 *
 * For all `capacity` values other than `0`, a circular array is used to track data. Otherwise an array is used that will
 * grow infinitely.
 *
 * By default, will attempt to use CSS variable `--series[seriesName]` for axis colours.
 *  `--series[name]-axis` for titles. Eg `--seriesX`. For data added without a named series,
 * it will use `--series` and `--series-axis`.
 * @param parentElOrQuery
 * @param opts
 * @return Plotter instance
 */
export const plot = (
  parentElementOrQuery: string | HTMLElement,
  opts: PlotOpts
): Plotter => {
  if (parentElementOrQuery === null)
    throw new Error(`parentElOrQuery is null. Expected string or element`);

  const parentEl = resolveEl(parentElementOrQuery);
  let canvasEl: HTMLCanvasElement;
  let destroyCanvasEl = true;
  let plotSize: Rect | undefined = opts.plotSize;
  let canvasSize: Rect;
  if (parentEl.nodeName === `CANVAS`) {
    // Use provided canvas
    canvasEl = parentEl as HTMLCanvasElement;
    destroyCanvasEl = false;
    canvasSize = { width: canvasEl.width, height: canvasEl.height };
  } else {
    // Create a CANVAS that fills parent
    canvasEl = document.createElement(`CANVAS`) as HTMLCanvasElement;
    parentEl.append(canvasEl);
    plotSize = opts.plotSize;
    canvasSize = { width: canvasEl.width, height: canvasEl.height };
  }

  const pointer = { x: 0, y: 0 };

  const onPointerMove = (event: PointerEvent) => {
    pointer.x = event.offsetX;
    pointer.y = event.offsetY;
  };

  canvasEl.addEventListener(`pointermove`, onPointerMove);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvasEl.getContext(`2d`)!;

  const capacity = opts.capacity ?? 10;
  const buffer =
    capacity > 0
      ? ofCircularMutable<number>({ capacity })
      : ofArrayMutable<number>();
  const metrics = ctx.measureText(`Xy`);
  const coalesce = opts.coalesce ?? true;

  // Sanity-check
  if (ctx === null) throw new Error(`Drawing context not available`);

  let xAxis = defaultAxis(`x`);
  if (opts.x) xAxis = { ...xAxis, ...opts.x };
  let yAxis = defaultAxis(`y`);
  if (opts.y) yAxis = { ...yAxis, ...opts.y };

  let drawingOpts: DrawingOpts = {
    ...opts,
    y: yAxis,
    x: xAxis,
    pointer: pointer,
    capacity,
    coalesce,
    plotSize,
    canvasSize,
    ctx,
    textHeight:
      opts.textHeight ??
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    style: opts.style ?? `connected`,
    defaultSeriesColour: opts.defaultSeriesColour ?? `yellow`,
    margin: 3,
    clearCanvas: true,
    leadingEdgeDot: true,
    debug: opts.debug ?? false,
    digitsPrecision: opts.digitsPrecision ?? 2,
    lineWidth: opts.lineWidth ?? 2,
    showLegend: opts.showLegend ?? false,
  };

  if (plotSize) {
    // Size canvas based on given plot size
    const canvasSize = canvasSizeFromPlot(plotSize, drawingOpts);
    canvasEl.width = canvasSize.width;
    canvasEl.height = canvasSize.height;

    drawingOpts.canvasSize = canvasSize;
  }

  if (opts.autoSizeCanvas) {
    parentSizeCanvas(canvasEl, (args) => {
      const bounds = args.bounds;
      drawingOpts = {
        ...drawingOpts,
        plotSize: plotSizeFromBounds(bounds, drawingOpts),
        canvasSize: bounds,
      };
      draw(buffer, drawingOpts);
    });
  }

  return {
    drawValue: (index: number) => {
      drawValue(index, buffer, drawingOpts);
    },
    dispose: () => {
      canvasEl.removeEventListener(`pointermove`, onPointerMove);
      if (destroyCanvasEl) canvasEl.remove();
    },
    add: (value: number, series = ``, skipDrawing = false) => {
      add(buffer, value, series);
      if (skipDrawing) return;
      draw(buffer, drawingOpts);
    },
    draw: () => {
      draw(buffer, drawingOpts);
    },
    clear: () => {
      buffer.clear();
    },
  };
};
