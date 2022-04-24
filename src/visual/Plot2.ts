/* eslint-disable */
import {minIndex} from '~/collections/NumericArrays.js';
import {PointCalculableShape} from '~/geometry/Point.js';
import {Arrays} from '../collections/index.js';
import { Points, Rects} from '../geometry/index.js';
import {flip, scale} from '../Util.js';
import { resolveEl, parentSizeCanvas } from "../dom/Util.js";
import * as Sg from './SceneGraph.js';

interface DataSource {
  dirty:boolean
  type: string
  get range():DataRange
  add(value:number):void
}

export type Opts = {
  autoSize?:boolean
  axisColour?:string
  axisWidth?:number
}

export type SeriesOpts = {
  colour:string
  width?:number
  drawingStyle?: `line`|`dotted`|`bar`
  axisRange?:DataRange
  /**
   * If true, range will stay at min/max, rather than continuously adapting
   * to the current data range.
   */
  visualRangeStretch?:boolean
};

type DataPoint = {
  value:number
  index:number
  title?:string
};


type DataHitPoint = (pt:Points.Point) => [point: DataPoint|undefined, distance: number];


class ArrayDataSource implements DataSource {
  data:number[];
  series:Series;
  dirty = false;
  type = `array`;

  _range:Arrays.MinMaxAvgTotal|undefined;
  
  constructor(series:Series) {
    this.series = series;
    this.data = [];
    this.dirty = true;
  }

  set(data:number[]) {
    this.data = data;
    this.dirty = true;
  }

  get length():number {
    return this.data.length;
  }

  get range():DataRange {
    if (!this.dirty && this._range !== undefined) return this._range;
    this.dirty = false;
    this._range = Arrays.minMaxAvg(this.data);
    return {...this._range, changed: true};
  }

  add(value:number) {
    this.data = [...this.data, value];
    this.dirty = true;
  }
}

class StreamingDataSource extends ArrayDataSource {
  desiredDataPointMinWidth = 5;
  
  constructor(series:Series) {
    super(series);
  }

  add(value:number) {
    const lastWidth = this.series.lastPxPerPt;
    if (lastWidth > -1 && lastWidth < this.desiredDataPointMinWidth) { 
      // Remove older data
      const pts = Math.floor(this.desiredDataPointMinWidth / lastWidth);
      const d = [...this.data.slice(pts), value];
      super.set(d);
    } else super.add(value);
  }
}

type DataRange = {
  min:number,
  max:number,
  changed?:boolean
}

class Series {
  name:string;
  colour:string;
  source: DataSource
  drawingStyle:`line`|`dotted`|`bar`;
  width = 3;
  dataHitPoint: DataHitPoint|undefined;
  tooltip?:string;
  precision = 2;

  // How many pixels wide per data point on last draw
  lastPxPerPt = -1;

  protected _visualRange:DataRange;
  protected _visualRangeStretch:boolean;

  constructor(name:string, sourceType:`array`|`stream`, private plot:Plot, opts:SeriesOpts) {
    this.name = name;

    this.drawingStyle = opts.drawingStyle ?? `line`;
    this.colour = opts.colour;
    this.width = opts.width ?? 3;
    this._visualRange = opts.axisRange ?? {min:0,max:0};
    this._visualRangeStretch = opts.visualRangeStretch ?? true;

    if(sourceType === `array`) {
      this.source = new ArrayDataSource(this);
    } else if (sourceType === `stream`) {
      this.source = new StreamingDataSource(this);
    } else throw new Error(`Unknown sourceType. Expected array|stream`);
  }

  formatValue(v:number) {
    return v.toFixed(this.precision);
  }

  get visualRange():DataRange {
    let vr = this._visualRange;
    const sourceRange = this.source.range;
    let changed = false;
    if (sourceRange.changed) { 
      if (this._visualRangeStretch) {
        // Stretch range to lowest/highest-seen min/max
        const rmin = Math.min(vr.min, sourceRange.min);
        const rmax = Math.max(vr.max, sourceRange.max);
        if (rmin !== vr.min || rmax !== vr.max) {
          // Changed
          vr = {min:rmin, max:rmax};
          changed = true;
        }
      } else {
        // Use actual range of data
        if (!isRangeEqual(sourceRange, vr)) {
          vr = sourceRange;
          changed = true;
        }
      }
    }
    this._visualRange = vr;
    return {...vr, changed};
  }

  scaleValue(value:number): number {
    if (this.source === undefined) return value;
    const r = this.visualRange;
    return scale(value, r.min, r.max);
  }

  add(value:number) {
    this.source.add(value);
    this.plot.plotArea.needsDrawing = true;
  }
}

class PlotArea extends Sg.CanvasBox {
  paddingPx = 3;
  piPi = Math.PI*2;
  // If pointer is more than this distance away from a data point, it's ignored
  pointerDistanceThreshold = 20;
  lastRangeChange = 0;

  constructor(private plot:Plot) {
    super(plot, plot.canvasEl, `PlotArea`);
    this.debugLayout = false;
  }
  
  protected measureSelf(opts: Sg.MeasureState, parent?: Sg.Measurement): Rects.Rect | Rects.RectPositioned | undefined {
    const axisY = opts.getSize(`AxisY`);
    if (axisY === undefined) return;
    
    const legend = opts.getSize(`Legend`);
    if (legend === undefined) return;

    const axisX = opts.getSize(`AxisX`);
    if (axisX === undefined) return;

    return {
      x: axisY.width,
      y: 0,
      width: opts.bounds.width - axisY.width,
      height: opts.bounds.height - legend.height - axisX.height,
    };
  }

  protected onNotify(msg: string, source: Sg.Box): void {
    if (msg === `measureApplied` && source === this.plot.axisY) this._needsLayout = true;  
  }

  protected onPointerLeave(): void {
    const series = [...this.plot.series.values()];
    series.forEach(series => {
      series.tooltip = undefined;
    });    
    this.plot.legend.onLayoutNeeded();

  }

  protected onPointerMove(p: Points.Point): void {
    const series = [...this.plot.series.values()];
    series.forEach(series => {
      if (series.dataHitPoint === undefined) return;
      const v = series.dataHitPoint(p);
      if (v[0] === undefined) return;
      if (v[1] > this.pointerDistanceThreshold) return; // too far away
      series.tooltip = series.formatValue(v[0].value);
      this.plot.legend.onLayoutNeeded();
    });
  }

  protected drawSelf(ctx: CanvasRenderingContext2D): void {
    const series = [...this.plot.series.values()];
    ctx.clearRect(0, 0, this.visual.width, this.visual.height);

    series.forEach(series => {      
      if (series.source.type === `array` || series.source.type === `stream`) {
        const arraySeries = series.source as ArrayDataSource;
        if (arraySeries.data === undefined) return;
        const d = [...arraySeries.data];
        this.drawDataSet(series, d, ctx);
      }
      else console.warn(`Unknown data source type ${series.source.type}`);
    });
  }

  computeY(series:Series, rawValue:number) {
    const s = series.scaleValue(rawValue);
    return (flip(s)*this.visual.height) + this.paddingPx;
  }

  drawDataSet(series:Series, d:number[], ctx:CanvasRenderingContext2D): void {
    const padding = this.paddingPx + series.width;
    const v = Rects.subtract(this.visual, padding*2, padding*2);
    const pxPerPt = v.width/ d.length;
    
    series.lastPxPerPt = pxPerPt;
    let x = padding;
    
    ctx.strokeStyle = series.colour;
    ctx.lineWidth = series.width;
    const shapes:(DataPoint & PointCalculableShape)[] = [];
  
    series.dataHitPoint = (pt:Points.Point):[DataPoint,number] => {
      const distances = shapes.map(v => Points.distanceToExterior(pt, v));
      const i = minIndex(...distances);
      const closest = shapes[i];
      if (closest === undefined) [undefined,0];
      return [closest, distances[i]];
    };

    if (series.drawingStyle === `line`) {
      let y = 0;
      ctx.beginPath();

      for (let i=0;i<d.length;i++) {
        const scaled = series.scaleValue(d[i]);
        y = padding + this.paddingPx + (v.height * flip(scaled));
        shapes.push({x, y, index:i, value:d[i]});

        if (i == 0) ctx.moveTo(x+pxPerPt/2, y);
        else ctx.lineTo(x+pxPerPt/2,y);
       
        x += pxPerPt;
      }
      ctx.strokeStyle = series.colour;
      ctx.stroke();
    } else if (series.drawingStyle === `dotted`) {
      let y = 0;
      ctx.fillStyle = series.colour;
      for (let i=0;i<d.length;i++) {
        const scaled = series.scaleValue(d[i]);
        y = padding + (v.height * flip(scaled));
        ctx.beginPath();
        ctx.arc(x + pxPerPt/2, y, series.width, 0, this.piPi);
        ctx.fill();
        shapes.push({radius: series.width, x, y, index:i, value: d[i]});
        x += pxPerPt;
      }
    } else if (series.drawingStyle === `bar`) {
      ctx.fillStyle = series.colour;
      const interBarPadding = Math.ceil(pxPerPt*0.1);
      for (let i=0;i<d.length;i++) {
        const scaled = series.scaleValue(d[i]);
        const h = (v.height) * scaled;
        const r = {
          x: x + interBarPadding,
          y: v.height - h + padding,
          width: pxPerPt-interBarPadding,
          height: h,
          index: i,
          value: d[i]
        };
        ctx.fillRect(r.x, r.y, r.width, r.height);
        shapes.push(r);
        x += pxPerPt;
      }
    }
  }
}

class Legend extends Sg.CanvasBox {
  sampleSize = {width:10, height: 10};
  padding = 3;
  constructor(plot:Plot) {
    super(plot, plot.canvasEl, `Legend`);
    this.debugLayout = false;
  }

  protected measureSelf(opts: Sg.MeasureState, parent?: Sg.Measurement): Rects.Rect | Rects.RectPositioned | undefined {
    const yAxis = opts.measurements.get(`AxisY`);
    if (yAxis === undefined) return;
    const h = this.sampleSize.height + this.padding + this.padding;
    return {
      x: yAxis.size.width,
      y: opts.bounds.height - h,
      width: opts.bounds.width - yAxis.size.width,
      height: h
    };
  }
    
  protected drawSelf(ctx: CanvasRenderingContext2D): void {
    const plot = this._parent as Plot;
    const series = plot.seriesArray();
    const sample = this.sampleSize;
    const padding = this.padding;
    let x = padding;
    let y = padding;
    
    ctx.clearRect(0, 0, this.visual.width, this.visual.height);
    for (let i=0;i<series.length;i++) {
      const s = series[i];
      ctx.fillStyle = s.colour;
      ctx.fillRect(x, y, sample.width, sample.height);
      x += sample.width + padding;
      ctx.textBaseline = `middle`;
      
      ctx.fillText(s.name, x, y + (sample.height/2));
      const labelSize = ctx.measureText(s.name);
      x += labelSize.width + padding;

      if (s.tooltip) {
        ctx.fillStyle = plot.axisColour;
        ctx.fillText(s.tooltip, x, y+ (sample.height/2));
        const tooltipSize = ctx.measureText(s.tooltip);
        x += tooltipSize.width + padding;
      }
      x += padding;
    }
  }

  protected onNotify(msg: string, source: Sg.Box): void {
    if (msg === `measureApplied` && source === (this._parent as Plot).axisY) this._needsLayout = true;  
  }
}

class AxisX extends Sg.CanvasBox {
  paddingPx = 2;
  colour?:string;

  constructor(plot:Plot) {
    super(plot, plot.canvasEl,`AxisX`);
    this.debugLayout = false;
  }

  protected onNotify(msg: string, source: Sg.Box): void {
    if (msg === `measureApplied` && source === (this._parent as Plot).axisY) this._needsLayout = true;  
  }

  protected drawSelf(ctx: CanvasRenderingContext2D): void {
    const plot = this._parent as Plot;
    const v = this.visual;
    const width = plot.axisWidth;

    const colour = this.colour ?? plot.axisColour;
    ctx.strokeStyle = colour;

    ctx.clearRect(0,0,v.width, v.height);
    ctx.beginPath();
    ctx.lineWidth = width;    
    ctx.moveTo(0, width/2);
    ctx.lineTo(v.width, width/2);
    ctx.stroke();
  }

  protected measureSelf(opts: Sg.MeasureState, parent?: Sg.Measurement): Rects.Rect | Rects.RectPositioned | undefined {
    const plot = this._parent as Plot;
    
    const yAxis = opts.measurements.get(`AxisY`);
    if (yAxis === undefined) return;
    
    const legend = opts.measurements.get(`Legend`);
    if (legend === undefined) return;

    const h = plot.axisWidth + this.paddingPx;
    return {
      x: yAxis.size.width,
      y: opts.bounds.height - h - legend.size.height,
      width: opts.bounds.width - yAxis.size.width,
      height: h
    }
  }
}

const isRangeEqual = (a:DataRange, b:DataRange) =>  a.max === b.max && a.min === b.min;

class AxisY extends Sg.CanvasBox {
  seriesToShow:string|undefined;
  //precision = 2;
  maxDigits = 1;
  paddingPx = 2;
  colour?:string;
  
  lastRange:DataRange;

  constructor(plot:Plot) {
    super(plot, plot.canvasEl, `AxisY`);
    this.debugLayout = false;
    this.lastRange = {min:0,max:0};
  }

  protected measurePreflight(): void {
    const series = this.getSeries();
    if (series !== undefined && !isRangeEqual(series.visualRange, this.lastRange)) {
      this._needsLayout = true;
      this.needsDrawing = true;
    }  
  }


  protected measureSelf(opts: Sg.MeasureState): Rects.RectPositioned {
    //this.debugLog(`measureSelf. needsLayout: ${this._needsLayout} needsDrawing: ${this.needsDrawing}`);
    
    const copts = opts as Sg.CanvasMeasureState;
    const paddingPx = this.paddingPx;

    const textToMeasure = `9`.repeat(this.maxDigits);
    const text = copts.ctx.measureText(textToMeasure);
    const textWidth = paddingPx + text.width + paddingPx + (this._parent as Plot).axisWidth + paddingPx;  
    const w = opts.resolveToPx(this.desiredSize?.width, textWidth);
    return {
      x:0,
      y:0,
      width: w,
      height: opts.bounds.height
    }
  }

  protected drawSelf(ctx: CanvasRenderingContext2D): void {
    const s = this.getSeries();
    if (s !== undefined) this.seriesAxis(s, ctx);
    else console.warn(`Plot AxisY series '${this.seriesToShow}' is missing.`);
  }

  getSeries():Series|undefined {
    const plot = this._parent as Plot;
    if (this.seriesToShow === undefined) {
      // Pick first series
      return plot.seriesArray()[0];
    } else {
      // Try designated series name
      return plot.series.get(this.seriesToShow);
    }
  }

  seriesAxis(series:Series, ctx:CanvasRenderingContext2D) {
    const plot = this._parent as Plot;
    const plotArea = plot.plotArea;
    const v = this.visual;
    const paddingPx = this.paddingPx;
    const r = series.visualRange;
    const width = plot.axisWidth;

    const colour = this.colour ?? plot.axisColour;
    ctx.strokeStyle = colour;
    ctx.fillStyle = colour;

    if (r.min === 0 && r.max === 0) return; // Empty
    this.lastRange = r;
    this.maxDigits = Math.ceil(r.max).toString().length + series.precision + 1;
    ctx.clearRect(0,0,v.width, v.height);
 
    ctx.beginPath();
    ctx.lineWidth = width;    
    const lineX = v.width - width/2;
    ctx.moveTo(lineX, plotArea.paddingPx + (width));
    ctx.lineTo(lineX, plotArea.visual.height + width);
    ctx.stroke();

    ctx.textBaseline = `top`;
    const fromRight = v.width - (paddingPx *4);
    drawText(ctx, series.formatValue(r.max), size => [
      fromRight-size.width, 
      plotArea.computeY(series, r.max) + (width/2)
    ]);
    drawText(ctx, series.formatValue(r.min), size => [
      fromRight-size.width,
      plotArea.computeY(series, r.min) - 5
    ]);
  }
}

const drawText = (ctx:CanvasRenderingContext2D, text:string, position:(size:TextMetrics) => [x:number,y:number]) => {
  const size = ctx.measureText(text);
  const xy = position(size);
  ctx.fillText(text, xy[0], xy[1]);
}


export class Plot extends Sg.CanvasBox {
  plotArea:PlotArea;
  legend:Legend;
  axisX:AxisX;
  axisY:AxisY;
  axisColour:string;
  axisWidth:number;
  series:Map<string,Series>;
  
  constructor(canvasEl:HTMLCanvasElement, opts:Opts = {}) {
      
    if (canvasEl === undefined) throw new Error(`canvasEl undefined`);
    super(undefined, canvasEl, `Plot`);
  
    if (opts.autoSize) {
      parentSizeCanvas(canvasEl, evt => {
        this.update(true);
      });
    }

    this.axisColour = opts.axisColour ?? `black`;
    this.axisWidth = opts.axisWidth ?? 3;
    this.series = new Map();
    this.plotArea = new PlotArea(this);
    this.legend = new Legend(this);
    this.axisX = new AxisX(this);
    this.axisY = new AxisY(this);

    this.debugLayout = false;
  }

  seriesArray():Series[] {
    return [...this.series.values()];
  }

  get seriesLength():number {
    return this.series.size;
  }

  createSeries(name?:string, type:`stream`|`array` = `array`, initialData?:number[]):Series {
    const len = this.seriesLength;
    if (name === undefined) name = `series-${len}`;
    if (this.series.has(name)) throw new Error(`Series name '${name}' already in use`);

    const opts:SeriesOpts = {
      colour: `hsl(${len*20 % 360}, 80%,50%)`
    }
    const s = new Series(name, type, this, opts);
    if (type === `array` && initialData !== undefined) {
      (s.source as ArrayDataSource).set(initialData);
    }
    
    this.series.set(name, s);
    this.setReady(true, true);
    this.plotArea.needsDrawing = true;
    return s;
  }
}