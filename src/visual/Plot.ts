/* eslint-disable */
import { minMaxAvg } from '../collections/NumericArrays.js';
import { CircularArray, MapOfMutable } from '../collections/Interfaces.js';
import { mapCircular, mapArray} from "../collections/MapMultiMutable.js"

import * as Palette from "./Palette.js";
import {number as guardNumber} from '../Guards.js';
import { Point} from "../geometry/Point.js";
import { resolveEl, parentSizeCanvas } from "../dom/Util.js";
import {Rect, RectPositioned} from '~/geometry/Rect.js';
import {Colour} from './index.js';

export type Plotter = {
  add(value:number, series?:string, skipDrawing?:boolean):void
  drawValue(index:number):void
  clear():void
  dispose():void
}

type Series = {
  min:number,
  max:number,
  range:number,
  name:string,
  colour:string
};

type DrawingOpts = PlotOpts & {
  x:Axis,
  y:Axis,
  ctx: CanvasRenderingContext2D
  //dataXScale?: number
  //yLabelWidth: number
  //palette: Palette.Palette
  textHeight: number
  capacity:number
  coalesce:boolean
  //showYAxis:boolean
  //showXAxis:boolean
  margin:number
  canvasSize:Rect
  clearCanvas:boolean
  translucentPlot?:boolean
  highlightIndex?:number
  leadingEdgeDot:boolean
  debug:boolean
}

/**
 * Properties for an axis
 */
export type Axis = {
  allowedSeries?:string[]
  /**
   * Name of axis, eg `x`
   */
  name:string,
  /**
   * Colour to use for axis labels
   */
  colour?:string,
  /**
   * Forced scale for values
   */
  scaleRange?:[number,number],
  /**
   * Forced range for labelling, by default
   * uses scaleRange
   */
  labelRange?:[number,number],
  /**
   * Width of axis line
   */
  lineWidth:number,
  /**
   * How line ends
   */
  endWith: `none` | `arrow`,
  /**
   * Where to place the name of the axis
   */
  namePosition: `none` | `end` | `side`,
  /**
   * Width for y axis, height for x axis
   */
  textSize: number,
  /**
   * If true, axis labels (ie numeric scale) are shown. Default: true
   */
  showLabels:boolean,
  /**
   * If true, a line is drawn to represent axis. Default: true
   */
  showLine:boolean
}

export type SeriesColours = {
  [id:string]: string|undefined
};

/**
 * Plotter options
 */
export type PlotOpts = {
  debug?:boolean,
  seriesColours?:SeriesColours,
  x?:Axis,
  y?:Axis,
  plotSize?:Rect
  autoSizeCanvas?:boolean
  style?:`connected` | `dots` | `none`
  //palette?: Palette.Palette
  /**
   * Number of items to keep in the circular array
   * Default: 10
   */
  capacity?:number
  //showYAxis?:boolean
  //showXAxis?:boolean
  //yAxes?: string[]|string
  textHeight?: number
  /**
   * Width of plotted line
   */
  lineWidth?:number
  /**
   * If true, sub-pixel data points are ignored
   */
  coalesce?:boolean
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
}

const piPi = Math.PI *2;

export const defaultAxis = (name:string):Axis => ({
  endWith: `none`,
  lineWidth: 1,
  namePosition: 'none',
  name: name,
  showLabels: name === `y`,
  showLine: true,
  textSize: 20
 });

export const calcScale = (buffer:BufferType, seriesColours?:SeriesColours) => {
  const seriesNames = buffer.keys();
  const scales:Series[] = [];
  seriesNames.forEach(s => {
    const series = buffer.get(s);
    if (series === undefined) return;

    let {min,max} = minMaxAvg(series);
    let range = max - min;
    
    let colour;
    if (seriesColours !== undefined) {
      colour = seriesColours[s];
    }
    if (colour == undefined) colour = Colour.getCssVariable(`yellow`, `white`);
     
    if (range === 0) {
      range = min;
      min = min - range/2;
      max = max + range/2;
    }
    scales.push({
      min, max, range,
      name: s,
      colour: colour
    })
  });
  return scales;
}

export const add = (buffer:BufferType, value:number, series:string = "") => {
  buffer.addKeyedValues(series, value);
}

type BufferType = MapOfMutable<number, CircularArray<number>> | MapOfMutable<number, ReadonlyArray<number>>;

export const drawValue = (index:number, buffer:BufferType, drawing:DrawingOpts) => {
  const c =
  drawing =  {
    ...drawing,
    translucentPlot: true,
    leadingEdgeDot: false
  };
  draw(buffer, drawing);
  
  drawing =  {
    ...drawing,
    highlightIndex: index,
    leadingEdgeDot: true,
    translucentPlot: false,
    style: `none`,
    clearCanvas: false
  };
  draw(buffer, drawing);
};

const scaleWithFixedRange = (buffer:BufferType, range:[number,number], drawing:DrawingOpts) => calcScale(buffer, drawing.seriesColours).map((s) => ({...s, range: range[1] - range[0], min: range[0], max: range[1]}));

/**
 * Draws a `buffer` of data with `drawing` options.
 * 
 * @param buffer 
 * @param drawing 
 */
export const draw = (buffer:BufferType, drawing:DrawingOpts) => {
  const {x:xAxis, y:yAxis, ctx, canvasSize} = drawing;
  const margin = drawing.margin;
  const cap = drawing.capacity === 0 ? buffer.lengthMax : drawing.capacity;
  const series = drawing.y.scaleRange ? scaleWithFixedRange(buffer, drawing.y.scaleRange, drawing) : calcScale(buffer, drawing.seriesColours);

  if (drawing.clearCanvas) ctx.clearRect(0,0,canvasSize.width,canvasSize.height);
  
  // if (drawing.debug) {
  //   ctx.strokeStyle = `orange`;
  //   ctx.strokeRect(0,0,canvasSize.width, canvasSize.height); 
  // }
  
  // Move in for margin
  ctx.translate(margin, margin);

  // Calculate/use plot area
  const plotSize = drawing.plotSize ?? plotSizeFromBounds(canvasSize, drawing);

  // Draw vertical axes
  const axisSize = {height: plotSize.height + margin + margin, width:plotSize.width};

  if (yAxis.showLabels || yAxis.showLine) {
    // Draw the labels for each series
    series.forEach(s => {
      if (yAxis.allowedSeries !== undefined) {
        if (!yAxis.allowedSeries.includes(s.name)) return;
      }
      drawYSeriesScale(s, axisSize, drawing);
    });

    // Draw vertical line
    drawYLine(axisSize, series[0], drawing);
  }

  // Draw x/horizontal axis if needed
  if (xAxis.showLabels || xAxis.showLine) {
    const yPos = yAxis.labelRange ? yAxis.labelRange[0] : series[0].min;
    drawXAxis(plotSize.width, calcYForValue(yPos, series[0], plotSize.height)+margin + xAxis.lineWidth, drawing);
  }

  const plotDrawing = {
    ...drawing,
    plotSize}
    //,
    //dataXScale: drawing.dataXScale ?? plotSize.width / (cap -1)
  //};

  // Draw data for each series
  series.forEach(s => {
    const data = buffer.getSource(s.name);
    if (data === undefined) return;
    
    let leadingEdgeIndex = (buffer.typeName === `circular`)  ? (data as CircularArray<number>).pointer - 1: data.length -1;
    if (drawing.highlightIndex !== undefined) leadingEdgeIndex = drawing.highlightIndex; 
    ctx.save();
    ctx.translate(0, margin + margin);
    drawSeriesData(s, data, plotSize, plotDrawing, leadingEdgeIndex);
    ctx.restore();
  });

  ctx.resetTransform();
}

/**
 * Draw vertical axis
 * @param series 
 * @param height 
 * @param drawing 
 */
const drawYSeriesScale = (series:Series, plotSize:Rect, drawing:DrawingOpts) => {
  const {ctx, y, margin} = drawing;
  const {width, height} = plotSize;

  if (drawing.debug) {
    ctx.strokeStyle = `green`;
    ctx.strokeRect(0,0, y.textSize, height + margin);  
  }
  
  ctx.fillStyle = series.colour.length > 0 ? series.colour : `white`;

  // Override colour with axis-defined colour
  if (y.colour) ctx.fillStyle = y.colour;

  // Draw labels
  const min = y.labelRange ? y.labelRange[0] : series.min;
  const max = y.labelRange ? y.labelRange[1] : series.max;
  const range = y.labelRange ? max - min : series.range;
  const mid = min + (range / 2)
  const halfHeight = drawing.textHeight / 2;

  ctx.textBaseline = `top`;
  ctx.fillText(min.toFixed(2), 0, calcYForValue(min, series, height)-halfHeight);
  ctx.fillText(mid.toFixed(2), 0, calcYForValue(mid, series, height)-halfHeight);
  ctx.fillText(max.toFixed(2), 0, calcYForValue(max, series, height)-halfHeight);

  // ctx.fillText(min.toFixed(2), 0, height - drawing.textHeight + margin);
  // ctx.fillText(max.toFixed(2), 0, 0);
  // ctx.fillText(mid.toFixed(2), 0, height/2 - halfHeight);
  ctx.translate(y.textSize + margin, 0);
}

const drawYLine = (plotSize:Rect, series:Series, drawing:DrawingOpts) => {
  const {ctx, y} = drawing;
  const {width, height} = plotSize;
  
  const min = y.labelRange ? y.labelRange[0] : series.min;
  const max = y.labelRange ? y.labelRange[1] : series.max;

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

const drawXAxis = (width:number, yPos:number, drawing:DrawingOpts) => {
  //const {width, height} = plotSize;
  const {ctx, x, y} = drawing;

  if (!x.showLine) return;

  // Use axis colour if defined, or otherwise series
  // if (palette.has(`series-axis`))
  //   ctx.strokeStyle = palette.get(`series-axis`);
  // else
  //   ctx.strokeStyle = palette.getOrAdd(`series`);
  if (x.colour) ctx.strokeStyle = x.colour;
  ctx.lineWidth = x.lineWidth;
  ctx.beginPath();

  // Assumes ctx is translated after drawing Y axis
  ctx.moveTo(0, yPos);//height-1);
  ctx.lineTo(width, yPos);//height -1);
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
  const {ctx, lineWidth = 2, translucentPlot = false, margin, x:xAxis} = drawing;
  const style = drawing.style ?? `connected`;
  const height = plotSize.height - margin;

  let dataXScale = 1;
  if (xAxis.scaleRange) {
    const xAxisRange = xAxis.scaleRange[1] - xAxis.scaleRange[0];
    dataXScale = plotSize.width / xAxisRange;
  } else {
    if (drawing.capacity === 0) dataXScale = plotSize.width / values.length;
    else dataXScale = plotSize.width / drawing.capacity;
  }

  // Step through data faster if per-pixel density is above one
  const incrementBy = drawing.coalesce ? 
    dataXScale! < 0 ? Math.floor((1/dataXScale!)) : 1
    : 1;

  let x = 0;
  let leadingEdge:Point|undefined;
  
  // if (drawing.debug) {
  //   ctx.strokeStyle = `green`;
  //   ctx.strokeRect(0,0, plotSize.width, plotSize.height);
  // }

  const colourTransform = (c:string) => {
    if (translucentPlot) return Colour.opacity(c, 0.2);
    return c;
  }

  if (style === `dots`) { 
    ctx.fillStyle = colourTransform(series.colour);// colourTransform(drawing.palette.getOrAdd(`series${series.name}`));
  } else if (style === `none`) {
  } else {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = colourTransform(series.colour); //colourTransform(drawing.palette.getOrAdd(`series${series.name}`));
  } 

  for (let i=0; i<values.length; i += incrementBy) {
    let y = calcYForValue(values[i], series, height);// (1 - (values[i] - series.min) / series.range) * height;
    
    if (style === `dots`) {
      ctx.beginPath();
      ctx.arc(x, y, lineWidth, 0, piPi);
      ctx.fill();
    } else if (style === `none`) {
    } else  {
      if (i == 0) ctx.moveTo(x, y);
      ctx.lineTo(x, y);
    }
    
    if (i === leadingEdgeIndex) {
      leadingEdge = {x, y}
    }
    x += dataXScale;
  }

  if (style === `connected`) {
    ctx.stroke();
  }

  // Draw a circle at latest data point
  if (leadingEdge !== undefined && drawing.leadingEdgeDot) {
    ctx.beginPath();
    ctx.fillStyle = colourTransform(series.colour);// drawing.palette.getOrAdd(`series${series.name}`));
    ctx.arc(leadingEdge.x, leadingEdge.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}

const calcYForValue = (v:number, series:Series, height:number) => (1 - (v - series.min) / series.range) * height;

const calcSizing = (margin:number, x:Axis, y:Axis) => {
  let fromLeft = margin;
  if (y.showLabels) fromLeft += y.textSize;
  if (y.showLine) fromLeft += y.lineWidth;
  if (y.showLabels || y.showLine) fromLeft += margin + margin;
  let fromRight = margin;

  let fromTop = margin + margin;
  let fromBottom = margin + margin;
  if (x.showLabels) fromBottom += x.textSize;
  if (x.showLine) fromBottom += x.lineWidth;
  if (x.showLabels || x.showLine) fromBottom += margin;

  return {
    left: fromLeft,
    right: fromRight,
    top: fromTop,
    bottom: fromBottom
  };
}

const plotSizeFromBounds = (bounds:Rect, opts:{margin:number, y:Axis, x:Axis}):Rect => {
  const { width, height } = bounds;
  const sizing = calcSizing(opts.margin, opts.x, opts.y);
  return {
    width: width - sizing.left - sizing.right, 
    height: height - sizing.top - sizing.bottom
  }
};

const canvasSizeFromPlot = (plot:Rect, opts:{margin:number, y:Axis, x:Axis}):Rect => {
  const { width, height } = plot;
  const sizing = calcSizing(opts.margin, opts.x, opts.y);
  return {
    width: plot.width + sizing.left + sizing.right,
    height: plot.height + sizing.top + sizing.bottom
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
 * @return Plotter instance
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

  const xAxis = opts.x ?? defaultAxis(`x`);
  let yAxis = opts.y ?? defaultAxis(`y`);

  let drawingOpts = {
    ...opts,
    y: yAxis,
    x: xAxis,

    capacity, coalesce, plotSize, canvasSize, ctx,
    textHeight: opts.textHeight ?? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    // palette: opts.palette ?? Palette.create(),
    style: opts.style ?? `connected`,
    margin: 3,
    yLabelWidth: 25,
    clearCanvas:true,
    leadingEdgeDot:true,
    debug: opts.debug ?? false
  };

  if (plotSize) {
    // Size canvas based on given plot size
    //console.log(`Canvas size from plot`);
    const canvasSize = canvasSizeFromPlot(plotSize, drawingOpts);
    canvasEl.width = canvasSize.width;
    canvasEl.height = canvasSize.height;
    //console.log(`Canvas size from plot: ${canvasSize.width},${canvasSize.height} plot: ${plotSize.width}, ${plotSize.height}`);
    drawingOpts.canvasSize = canvasSize;
  } else {
    //console.log(`Assuming canvas is sized`);
  }

  //console.log(drawingOpts);
  if (opts.autoSizeCanvas) {
    console.log(`autoSizeCanvas`);
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
    drawValue: (index:number) => {
      drawValue(index, buffer, drawingOpts);
    },
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

