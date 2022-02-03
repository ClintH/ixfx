/* eslint-disable */

import {getMinMaxAvg} from '../collections/NumericArrays.js';
import {MutableCircularArray} from "../collections/MutableCircularArray.js"
import {mutableMapCircular, MutableMapOf} from "../collections/MutableMapMulti.js"
import * as Palette from "./Palette.js";
import {Point} from "../geometry/Point.js";
import {resolveEl} from "../dom/Util.js";
import {autoSizeCanvas} from "./Drawing.js";

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

type PlotOpts = {
  palette?: Palette.Palette
  capacity?:number
  showYAxis?:boolean
  yAxes?: string[]|string
  textHeight?: number
  lineWidth?:number
  coalesce?:boolean
}

export const createScales = (buffer:MutableMapOf<number, MutableCircularArray<number>>) => {
  const seriesNames = buffer.keys();
  const scales:Series[] = [];
  seriesNames.forEach(s => {
    const series = buffer.get(s);
    if (series === undefined) return;

    let {min,max} = getMinMaxAvg(series);
    let range = max -min;
    
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

export const add = (buffer:MutableMapOf<number, MutableCircularArray<number>>, value:number, series:string = "") => {
  buffer.addKeyedValues(series, value);
}

export const draw = (buffer:MutableMapOf<number, MutableCircularArray<number>>, drawing:DrawingOpts) => {
  const {ctx, yLabelWidth, width, height} = drawing;
  const showYAxis = drawing.showYAxis ?? true;
  const series = createScales(buffer);
  const margin = 10;
  
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
  const plotDrawing =  { ...drawing,
    width: width - margin - margin - (showYAxis ? yLabelWidth : 0), 
    height: height - margin - margin,
  }
  plotDrawing.dataXScale = plotDrawing.width / drawing.capacity,
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
  const {ctx, height, palette, width} = drawing;

  if (palette.has(series.name +'-axis'))
    ctx.fillStyle = palette.get(series.name + '-axis');
  else
    ctx.fillStyle = palette.get(series.name);

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

export const drawSeries = (series:Series, values:MutableCircularArray<number>, drawing:DrawingOpts) => {
  const {ctx, height, width, dataXScale = 1, lineWidth = 2} = drawing;
  let x = 0;
  let leadingEdge:Point|undefined;
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = drawing.palette.get(series.name);

  const incrementBy = drawing.coalesce ? 
    drawing.dataXScale! < 0 ? Math.floor((1/drawing.dataXScale!)) : 1
    : 1;
  for (let i=0; i<values.length; i += incrementBy) {
    let y = (1- (values[i] - series.min) / series.range) * height;
    if (i == 0) ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    x += dataXScale;

    if (i +1 == values.pointer) {
      leadingEdge = {x, y}
    }
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
 * @param {string} parentElOrQuery
 * @param {PlotOpts} opts
 * @return {*} 
 */
export const plot2 = (parentElOrQuery:string|HTMLElement, opts:PlotOpts) => {
  const parentEl = resolveEl(parentElOrQuery);
  if (parentEl.nodeName === `CANVAS`) throw new Error(`Parent element should be a container, not a CANVAS`);
  
  // Create a CANVAS that fills parent
  const canvasEl = document.createElement(`CANVAS`) as HTMLCanvasElement;
  canvasEl.style.width = '100%';
  canvasEl.style.height = '100%';
  parentEl.append(canvasEl);
  
  const ctx = canvasEl.getContext(`2d`)!;
  const capacity = opts.capacity ?? 10;
  const buffer = mutableMapCircular<number>({ capacity });
  const metrics = ctx.measureText('Xy');
  const coalesce = opts.coalesce ?? true;
  let drawingOpts = {
    ...opts,
    capacity, coalesce,
    textHeight: opts.textHeight ?? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    palette: opts.palette ?? Palette.create(),
    width: canvasEl.width,
    height: canvasEl.height,
    ctx: ctx,
    yLabelWidth: 25
  };

  autoSizeCanvas(canvasEl, () => {
    drawingOpts = {...drawingOpts, width: canvasEl.width, height: canvasEl.height};
    draw(buffer, drawingOpts);
  });

  return {
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