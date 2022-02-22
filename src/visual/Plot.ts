/* eslint-disable */
import { minMaxAvg } from '../collections/NumericArrays.js';
import { CircularArray, MapOfMutable } from '../collections/Interfaces.js';
import { mapCircular, mapArray} from "../collections/MapMultiMutable.js"

import * as Palette from "./Palette.js";
import {number as guardNumber} from '../Guards.js';
import { Point} from "../geometry/Point.js";
import { resolveEl, parentSizeCanvas } from "../dom/Util.js";
import {Rect} from '~/geometry/Rect.js';

export type Plotter = {
  add(value:number, series?:string, skipDrawing?:boolean):void
  clear():void
  dispose():void
}

type Series = {
  min:number,
  max:number,
  range:number,
  name:string
};

type DrawingOpts = PlotOpts & {
  ctx: CanvasRenderingContext2D
  dataXScale?: number
  yLabelWidth: number
  palette: Palette.Palette
  textHeight: number
  capacity:number
  coalesce:boolean
  showYAxis:boolean
  showXAxis:boolean
  margin:number
  canvasSize:Rect
}

/**
 * Plotter options
 */
export type PlotOpts = {
  plotSize?:Rect
  autoSizeCanvas?:boolean
  style?:`connected` | `dots`
  palette?: Palette.Palette
  /**
   * Number of items to keep in the circular array
   * Default: 10
   */
  capacity?:number
  showYAxis?:boolean
  showXAxis?:boolean
  yAxes?: string[]|string
  textHeight?: number
  /**
   * Width of plotted line
   */
  lineWidth?:number
  /**
   * If true, sub-pixel data points are ignored
   */
  coalesce?:boolean
  fixedRange?:[number,number]
  /**
   * How many horizontal pixels per data point. If unspecified,
   * it will scale based on width of canvas and capacity.
   */
  dataXScale?:number
}

const piPi = Math.PI *2;

export const createScales = (buffer:BufferType) => {
  const seriesNames = buffer.keys();
  const scales:Series[] = [];
  seriesNames.forEach(s => {
    const series = buffer.get(s);
    if (series === undefined) return;

    let {min,max} = minMaxAvg(series);
    let range = max - min;
    
    if (range === 0) {
      range = min;
      min = min - range/2;
      max = max + range/2;
    }
    scales.push({
      min, max, range,
      name: s
    })
  });
  return scales;
}

export const add = (buffer:BufferType, value:number, series:string = "") => {
  buffer.addKeyedValues(series, value);
}

type BufferType = MapOfMutable<number, CircularArray<number>> | MapOfMutable<number, ReadonlyArray<number>>;

export const draw = (buffer:BufferType, drawing:DrawingOpts) => {
  const {fixedRange, ctx, yLabelWidth, canvasSize} = drawing;
  const margin = drawing.margin;
  const cap = drawing.capacity === 0 ? buffer.lengthMax : drawing.capacity;
  const axisLineWidth = 1;
  let series = createScales(buffer);

  // Calculate series ranges
  if (fixedRange !== undefined) {
    series = series.map((s) => ({...s, range: fixedRange[1] - fixedRange[0], min: fixedRange[0], max: fixedRange[1]}));
  }

  ctx.clearRect(0,0,canvasSize.width,canvasSize.height);
  
  // ctx.strokeStyle = `orange`;
  // ctx.strokeRect(0,0,canvasSize.width, canvasSize.height);

  // For everything
  ctx.translate(margin, margin);

  // Calculate/use plot area
  const plotSize = drawing.plotSize ?? plotSizeFromBounds(canvasSize, drawing); 
  //console.log(`Plot size: ${plotSize.width} x ${plotSize.height}`);

  // Draw vertical axes
  const axisSize = {height: plotSize.height + margin + margin, width:plotSize.width};
  if (drawing.showYAxis) {
    series.forEach(s => {
      if (drawing.yAxes !== undefined) {
        if (typeof drawing.yAxes === `string` && s.name !== drawing.yAxes) return;
        if (!drawing.yAxes.includes(s.name)) return;
      }

      drawVerticalAxis(s, axisSize, drawing);
      ctx.translate(yLabelWidth +axisLineWidth, 0);
    });
  }
  if (drawing.showXAxis) {
    drawHorizontalAxis(axisSize, drawing)
  }

  // Apply margin for plot area
  ctx.translate(0, margin);

  // Debug: Draw plot area
  // ctx.strokeStyle = `yellow`;
  // ctx.strokeRect(0,0,plotSize.width, plotSize.height);

  const plotDrawing = {
    ...drawing,
    plotSize,
    dataXScale: drawing.dataXScale ?? plotSize.width / (cap -1)
  };
  // const plotDrawing =  { 
  //   ...drawing,
  //   width: width - margin - margin - (showYAxis ? yLabelWidth : 0), 
  //   height: height - margin - margin,
  // }
  //if (plotDrawing.dataXScale === undefined) plotDrawing.dataXScale = plotSize.width / (cap -1);

  // Apply margin for plot area compared to series title
  //ctx.translate(0, margin);

  // Draw data for each series
  series.forEach(s => {
    const data = buffer.getSource(s.name);
    if (data === undefined) return;
    //console.log(`draw ${s.name} min: ${s.min} max: ${s.max} range: ${s.range}`);
    const leadingEdgeIndex = (buffer.typeName === `circular`)  ? (data as CircularArray<number>).pointer - 1: data.length -1;
    drawSeriesData(s, data, plotSize, plotDrawing, leadingEdgeIndex);
  });

  ctx.resetTransform();
}

/**
 * Draw vertical axis
 * @param series 
 * @param height 
 * @param drawing 
 */
const drawVerticalAxis = (series:Series, plotSize:Rect, drawing:DrawingOpts) => {
  const {ctx, palette, yLabelWidth} = drawing;
  const {width, height} = plotSize;

  // ctx.strokeStyle = `green`;
  // ctx.strokeRect(0,0, drawing.yLabelWidth, height);
  
  // Use axis colour if defined, or otherwise series
  if (palette.has(`series${series.name}-axis`))
    ctx.fillStyle = palette.get(`series${series.name}-axis`);
  else
    ctx.fillStyle = palette.getOrAdd(`series${series.name}`);

  // Draw line
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(yLabelWidth ,0);
  ctx.lineTo(yLabelWidth, height);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.stroke();

  // Draw labels
  const mid = series.min + (series.range / 2)
  const halfHeight = drawing.textHeight / 2;
  ctx.textBaseline = `top`;
  ctx.fillText(series.min.toFixed(2), 0, height - drawing.textHeight);
  ctx.fillText(series.max.toFixed(2), 0, 0);
  ctx.fillText(mid.toFixed(2), 0, height/2 - halfHeight);
}

const drawHorizontalAxis = (plotSize:Rect, drawing:DrawingOpts) => {
  const {width, height} = plotSize;

  const {ctx, palette, yLabelWidth} = drawing;

  // Use axis colour if defined, or otherwise series
  if (palette.has(`series-axis`))
    ctx.strokeStyle = palette.get(`series-axis`);
  else
    ctx.strokeStyle = palette.getOrAdd(`series`);

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height-1);
  ctx.lineTo(width, height -1);
  ctx.stroke();
}

/**
 * Draw series data
 * @param series 
 * @param values 
 * @param plotSize 
 * @param drawing 
 */
const drawSeriesData = (series:Series, values:ArrayLike<number>, plotSize:Rect, drawing:DrawingOpts, leadingEdgeIndex:number) => {
  const {ctx, dataXScale = 1, lineWidth = 2} = drawing;
  const style = drawing.style ?? `connected`;

  let x = 0;
  let leadingEdge:Point|undefined;
  
  if (style === `dots`) { 
    ctx.fillStyle = drawing.palette.getOrAdd(`series${series.name}`);
  } else {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = drawing.palette.getOrAdd(`series${series.name}`);
  } 

  const height = plotSize.height;
  const incrementBy = drawing.coalesce ? 
    drawing.dataXScale! < 0 ? Math.floor((1/drawing.dataXScale!)) : 1
    : 1;
  for (let i=0; i<values.length; i += incrementBy) {
    let y = (1 - (values[i] - series.min) / series.range) * height;
    
    if (style === `dots`) {
      ctx.beginPath();
      ctx.arc(x, y, lineWidth, 0, piPi);
      ctx.fill();
    } else  {
      if (i == 0) ctx.moveTo(x, y);
      ctx.lineTo(x, y);
    }
    //if (i +1 == values.pointer) {
    if (i === leadingEdgeIndex) {
      leadingEdge = {x, y}
    }
    x += dataXScale;
  }
  ctx.stroke();

  // Draw a circle at latest data point
  if (leadingEdge !== undefined) {
    ctx.beginPath();
    ctx.arc(leadingEdge.x, leadingEdge.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}


const plotSizeFromBounds = (bounds:Rect, opts:{showYAxis:boolean, margin:number, yLabelWidth:number}):Rect => {
  const showYAxis = opts.showYAxis;
  const margin = opts.margin;
  const width = bounds.width;
  const height = bounds.height;
  const yLabelWidth = opts.yLabelWidth;
  return {
    width: width - (4*margin) - (showYAxis ? yLabelWidth : 0), 
    height: height - (4 * margin)
  }
};

const canvasSizeFromPlot = (plot:Rect, opts:{showYAxis:boolean, margin:number, yLabelWidth:number}):Rect => {
  const showYAxis = opts.showYAxis;
  const margin = opts.margin;
  const width = plot.width;
  const height = plot.height;
  const yLabelWidth = opts.yLabelWidth;
  return {
    width: width + margin + margin + margin + margin + (showYAxis ? yLabelWidth : 0),
    height: height + margin + margin + margin
  }
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
 *  palette: Palette,  // Colour palette instance to use
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
 * @return PLotter instance
 */
export const plot = (parentElOrQuery:string|HTMLElement, opts:PlotOpts):Plotter => {
  if (parentElOrQuery === null) throw new Error(`parentElOrQuery is null. Expected string or element`);

  const parentEl = resolveEl(parentElOrQuery);
  let canvasEl:HTMLCanvasElement;
  let destroyCanvasEl = true;
  let plotSize:Rect|undefined = opts.plotSize;
  let canvasSize:Rect
  if (parentEl.nodeName === `CANVAS`)  {
    // Use provided canvas
    canvasEl = parentEl as HTMLCanvasElement;  
    destroyCanvasEl = false;
    canvasSize = {width: canvasEl.width, height: canvasEl.height};
  } else {
    // Create a CANVAS that fills parent
    //console.log('not reusing');
    canvasEl = document.createElement(`CANVAS`) as HTMLCanvasElement;
    parentEl.append(canvasEl);
    plotSize = opts.plotSize;
    canvasSize = {width: canvasEl.width, height: canvasEl.height};
  }
  
  const ctx = canvasEl.getContext(`2d`)!;
  const capacity = opts.capacity ?? 10;
  const buffer = capacity > 0 ? mapCircular<number>({ capacity }) : mapArray<number>();
  const metrics = ctx.measureText('Xy');
  const coalesce = opts.coalesce ?? true;

  // Sanity-check
  if (ctx === null) throw new Error(`Drawing context not available`);

  let drawingOpts = {
    ...opts,
    capacity, coalesce, plotSize, canvasSize, ctx,
    textHeight: opts.textHeight ?? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    palette: opts.palette ?? Palette.create(),
    style: opts.style ?? `connected`,
    showYAxis: opts.showYAxis ?? true,
    showXAxis: opts.showXAxis ?? false,
    margin: 3,
    yLabelWidth: 25
  };

  if (plotSize) {
    // Size canvas based on given plot size
    const canvasSize = canvasSizeFromPlot(plotSize, drawingOpts);
    canvasEl.width = canvasSize.width;
    canvasEl.height = canvasSize.height;
  }

  //console.log(drawingOpts);
  if (opts.autoSizeCanvas) {
    parentSizeCanvas(canvasEl, (args) => {
      const bounds = args.bounds;
      drawingOpts = {
        ...drawingOpts, 
        plotSize: plotSizeFromBounds(bounds, drawingOpts),
        canvasSize: bounds
      };
      draw(buffer, drawingOpts);

    });
  }

  return {
    dispose: () => {
      if (destroyCanvasEl) canvasEl.remove();
    },
    add: (value:number, series = "", skipDrawing = false) => {
      add(buffer, value, series);
      if (skipDrawing) return;
      draw(buffer, drawingOpts)
    },
    clear:() => {
      buffer.clear();
    }
  }
}

