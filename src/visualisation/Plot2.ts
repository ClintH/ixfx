/* eslint-disable */

import {getMinMaxAvg} from "../util.js";
import {Circular} from "../collections/Lists.js"
import {mutableMapCircular, MutableMapOf} from "../collections/MutableMapMulti.js"
import {Palette} from "../colour/Palette.js";
import {Point} from "~/geometry/Point.js";

type Series = {
  min:number,
  max:number,
  range:number,
  name:string
};

export const createScales = (buffer:MutableMapOf<number, Circular<number>>) => {
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

export const add = (buffer:MutableMapOf<number, Circular<number>>, value:number, series:string = "") => {
  buffer.addKeyedValues(series, value);
  if (buffer.count(series) > 300) {
    console.log(buffer.count(series));
  }
}

export const draw = (buffer:MutableMapOf<number, Circular<number>>, drawing:DrawingOpts) => {
  const {ctx, width, height, yLabelWidth} = drawing;
  const showYAxis = drawing.showYAxis ?? true;
  const series = createScales(buffer);
  const margin = 10;
  
  ctx.clearRect(0,0,width,height);

  // Draw vertical axes
  ctx.translate(margin, 0);

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

export const drawSeries = (series:Series, values:Circular<number>, drawing:DrawingOpts) => {
  const {ctx, height, width, dataXScale = 1, lineWidth = 1} = drawing;
  let x = 0;
  let leadingEdge:Point|undefined;
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = drawing.palette.get(series.name);
  for (let i=0; i<values.length; i++) {
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

type DrawingOpts = PlotOpts & {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dataXScale?: number
  yLabelWidth: number
  palette: Palette
  textHeight: number
  capacity:number
}

type PlotOpts = {
  palette?: Palette
  capacity?:number
  showYAxis?:boolean
  yAxes?: string[]|string
  textHeight?: number
  lineWidth?:number
}
export const plot2 = (canvasSelector:string, opts:PlotOpts) => {
  const canvasEl = document.querySelector(canvasSelector) as HTMLCanvasElement;
  if (canvasEl === null) throw new Error(`Canvas not found ${canvasSelector}`);

  const ctx = canvasEl.getContext(`2d`)!;
  const capacity = opts.capacity ?? 10;
  const buffer = mutableMapCircular<number>({ capacity });

  const metrics = ctx.measureText('Xy');

  const drawingOpts = {
    ...opts,
    capacity,
    textHeight: opts.textHeight ?? metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    palette: opts.palette ?? new Palette(),
    width: canvasEl.width,
    height: canvasEl.height,
    ctx: ctx,
    yLabelWidth: 25,
  };

  return {
    add: (value:number, series = "", skipDrawing = false) => {
      add(buffer, value, series);
      if (skipDrawing) return;
      draw(buffer, drawingOpts)
    }
  }
}