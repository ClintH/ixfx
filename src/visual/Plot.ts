/* eslint-disable */

import { minMaxAvg } from '../collections/NumericArrays.js';
import { circularArray } from "../collections/CircularArray.js"
import { CircularArray, MapOfMutable } from '../collections/Interfaces.js';
import { mapCircular} from "../collections/MapMultiMutable.js"
import * as Palette from "./Palette.js";
import { Point} from "../geometry/Point.js";
import { resolveEl, parentSizeCanvas } from "../dom/Util.js";

type Series = {
  min:number,
  max:number,
  range:number,
  name:string
};

type DrawingOpts = PlotOpts & {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dataXScale?: number
  yLabelWidth: number
  palette: Palette.Palette
  textHeight: number
  capacity:number
  coalesce:boolean
}

export type PlotOpts = {
  autoSizeCanvas?:boolean
  style?:`connected` | `dots`
  palette?: Palette.Palette
  capacity?:number
  showYAxis?:boolean
  yAxes?: string[]|string
  textHeight?: number
  lineWidth?:number
  coalesce?:boolean
  fixedRange?:[number,number]
  dataXScale?:number
}

const piPi = Math.PI *2;

export const createScales = (buffer:MapOfMutable<number, CircularArray<number>>) => {
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

export const add = (buffer:MapOfMutable<number, CircularArray<number>>, value:number, series:string = "") => {
  buffer.addKeyedValues(series, value);
}

export const draw = (buffer:MapOfMutable<number, CircularArray<number>>, drawing:DrawingOpts) => {
  const {fixedRange, ctx, yLabelWidth, width, height} = drawing;
  const showYAxis = drawing.showYAxis ?? true;
  const margin = 10;
  const cap = drawing.capacity === 0 ? buffer.lengthMax : drawing.capacity;
  let series = createScales(buffer);

  if (fixedRange !== undefined) {
    series = series.map((s) => ({...s, range: fixedRange[1] - fixedRange[0], min: fixedRange[0], max: fixedRange[1]}));
  }

  ctx.clearRect(0,0,width,height);
  ctx.translate(margin, 0);

  // Draw vertical axes
  if (showYAxis) {
    series.forEach(s => {
      if (drawing.yAxes !== undefined) {
        if (typeof drawing.yAxes === `string` && s.name !== drawing.yAxes) return;
        if (!drawing.yAxes.includes(s.name)) return;
      }

      drawSeriesAxis(s, drawing);
      ctx.translate(yLabelWidth + 3, 0);
    });
  }

  // Apply margin
  const plotDrawing =  { 
    ...drawing,
    width: width - margin - margin - (showYAxis ? yLabelWidth : 0), 
    height: height - margin - margin,
  }
  if (plotDrawing.dataXScale === undefined) plotDrawing.dataXScale = plotDrawing.width / cap,
  ctx.translate(0, margin);

  // Draw data for each series
  series.forEach(s => {
    const data = buffer.getSource(s.name);
    if (data === undefined) return;
    //console.log(`draw ${s.name} min: ${s.min} max: ${s.max} range: ${s.range}`);
    drawSeries(s, data, plotDrawing);
  });

  ctx.resetTransform();
}

export const drawSeriesAxis = (series:Series, drawing:DrawingOpts) => {
  const {ctx, height, palette} = drawing;

  // Use axis colour if defined, or otherwise series
  if (palette.has(`series-${series.name}-axis`))
    ctx.fillStyle = palette.get(`series-${series.name}-axis`);
  else
    ctx.fillStyle = palette.getOrAdd(`series-${series.name}`);

  // ctx.lineWidth = 1;
  // ctx.beginPath();
  // ctx.moveTo(yLabelWidth ,0);
  // ctx.lineTo(yLabelWidth, height);
  // ctx.strokeStyle = palette.get(series.name);
  // ctx.strokeStyle = `silver`;
  // ctx.stroke();

  const mid = series.min + (series.range / 2)
  const halfHeight = drawing.textHeight / 2;
  const y = 6; // magic
  ctx.textBaseline = `top`;
  ctx.fillText(series.min.toFixed(2), 0, height - drawing.textHeight - y);
  ctx.fillText(series.max.toFixed(2), 0, halfHeight);
  ctx.fillText(mid.toFixed(2), 0, height/2 - halfHeight);
}

export const drawSeries = (series:Series, values:CircularArray<number>, drawing:DrawingOpts) => {
  const {ctx, height, dataXScale = 1, lineWidth = 2, fixedRange} = drawing;
  let x = 0;
  let leadingEdge:Point|undefined;
  
  const style = drawing.style ?? `connected`;
  if(style === `dots`) { 
    ctx.fillStyle = drawing.palette.getOrAdd(`series-${series.name}`);
  } else {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = drawing.palette.getOrAdd(`series-${series.name}`);
  } 

  const incrementBy = drawing.coalesce ? 
    drawing.dataXScale! < 0 ? Math.floor((1/drawing.dataXScale!)) : 1
    : 1;
  for (let i=0; i<values.length; i += incrementBy) {
    let y = (1 - (values[i] - series.min) / series.range) * height + 5;
    
    if (style === `dots`) {
      ctx.beginPath();
      ctx.arc(x, y, lineWidth, 0, piPi);
      ctx.fill();
    } else  {
      if (i == 0) ctx.moveTo(x, y);
      ctx.lineTo(x, y);
    }
    if (i +1 == values.pointer) {
      leadingEdge = {x, y}
    }
    x += dataXScale;
  }
  ctx.stroke();
  
  if (leadingEdge !== undefined) {
    ctx.beginPath();
    ctx.arc(leadingEdge.x, leadingEdge.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/**
 * Creates a simple horizontal data plot within a DIV.
 * 
 * ```
 * const plot = plot2(`#parentDiv`);
 * plot.add(10);
 * plot.clear();
 * 
 * // Plot data using series
 * plot.add(-1, `temp`);
 * plot.add(0.4, `humidty`);
 * ```
 * 
 * Options can be specified to customise plot
 * ```
 * const plot = plot2(`#parentDiv`, {
 *  capacity: 100,     // How many data points to store (default: 10)
 *  showYAxis: false,  // Toggle whether y axis is shown (default: true)
 *  lineWidth: 2,      // Width of plot line (default: 2)
 *  yAxes:  [`temp`],  // Only show these y axes (by default all are shown)
 *  palette: Palette,  // Colour palette instance to use
 *  coalesce: true,    // If true, sub-pixel data points are skipped, improving performance for dense plots at the expense of plot precision
 * });
 * ```
 * 
 * By default, will attempt to use CSS variable `--series[seriesName]` for axis colours. -axis for titles. 
 * @param {string} parentElOrQuery
 * @param {PlotOpts} opts
 * @return {*} 
 */
export const plot = (parentElOrQuery:string|HTMLElement, opts:PlotOpts):Plotter => {
  const parentEl = resolveEl(parentElOrQuery);
  let canvasEl:HTMLCanvasElement;
  let destroyCanvasEl = true;
  if (parentEl.nodeName === `CANVAS`)  {
    // Use provided canvas
    canvasEl = parentEl as HTMLCanvasElement;  
    destroyCanvasEl = false;
  } else {
    // Create a CANVAS that fills parent
    console.log('not reusing');
    canvasEl = document.createElement(`CANVAS`) as HTMLCanvasElement;
    // canvasEl.style.width = '100%';
    // canvasEl.style.height = '100%';
    parentEl.append(canvasEl);
  }

  
  const ctx = canvasEl.getContext(`2d`)!;
  const capacity = opts.capacity ?? 10;
  const buffer = mapCircular<number>({ capacity });
  const metrics = ctx.measureText('Xy');
  const coalesce = opts.coalesce ?? true;
  let drawingOpts = {
    ...opts,
    capacity, coalesce,
    textHeight: opts.textHeight ?? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    palette: opts.palette ?? Palette.create(),
    style: opts.style ?? `connected`,
    width: canvasEl.width,
    height: canvasEl.height,
    ctx: ctx,
    yLabelWidth: 25
  };

  if (opts.autoSizeCanvas) {
    parentSizeCanvas(canvasEl, (args) => {
      const bounds = args.bounds;
      drawingOpts = {...drawingOpts, width: bounds.width, height: bounds.height};
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

export type Plotter = {
  add(value:number, series?:string, skipDrawing?:boolean):void
  clear():void
  dispose():void
}