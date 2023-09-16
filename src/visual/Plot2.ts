import { minIndex } from '../collections/NumericArrays.js';
import { type PointCalculableShape } from '../geometry/Point.js';
import { Arrays } from '../collections/index.js';
import { Points, Rects } from '../geometry/index.js';
import { clamp, flip, scale } from '../data/index.js';
import { parentSizeCanvas } from '../dom/Util.js';
import * as Sg from './SceneGraph.js';

import { textRect, textWidth } from './Drawing.js';

import { getFieldPaths, getFieldByPath, ifNaN } from '../Util.js';
import { throwNumberTest } from '../Guards.js';
import type { RectPositioned } from 'src/geometry/Rect.js';
import { scaleCanvas } from './index.js';

/**
 * 
 *  const dataStream = new DataStream();
 *  dataStream.in({ key: `x`, value: 0.5 }); 
 *  const label = (obj:any) => {
 *    if (`key` in obj) return obj;
 *    return { key: randomKey(), ...obj }
 *  }
 *  const stream = pipeline(dataStream, label);
 *  // Actively compute size of window based on window width
 *  const windowSize = ops.divide(rxWindow.innerWidth, pointSize);
 *  const dataWindow = window(stream, windowSize);
 *  const dataToPoints = (value);
 * 
 *  const drawPlot = (dataWindow) => {
 *    for (const dataPoint in dataWindow) {
 *    }
 *  }
 */

/**
 * A data source
 */
export type DataSource = {
  dirty: boolean;
  type: string;
  get range(): DataRange;
  add(value: number): void;
  clear(): void;
}

/**
 * Plot options
 */
export type Opts = {
  /**
   * If true, Canvas will be resized to fit parent
   */
  autoSize?: boolean;
  /**
   * Colour for axis lines & labels
   */
  axisStrokeColour?: string;

  axisTextColour?: string

  legendTextColour?: string
  /**
   * Width for axis lines
   */
  axisStrokeWidth?: number;
};

/**
 * Series options
 */
export type SeriesOpts = {
  /**
   * Colour for series
   */
  colour: string;
  /**
   * Visual width/height (depends on drawingStyle)
   */
  width?: number;
  /**
   * How series should be rendered
   */
  drawingStyle?: `line` | `dotted` | `bar`;
  /**
   * Preferred data range
   */
  axisRange?: DataRange;
  /**
   * If true, range will stay at min/max, rather than continuously adapting
   * to the current data range.
   */
  visualRangeStretch?: boolean;
};

export type DataPoint = {
  value: number;
  index: number;
  title?: string;
};

export type DataHitPoint = (
  pt: Points.Point
) => [ point: DataPoint | undefined, distance: number ];

class ArrayDataSource implements DataSource {
  data: Array<number>;
  series: Series;
  dirty = false;
  type = `array`;

  private _range: Arrays.MinMaxAvgTotal | undefined;

  constructor(series: Series) {
    this.series = series;
    this.data = [];
    this.dirty = true;
  }

  clear() {
    this.set([]);
    this._range = undefined;
  }

  set(data: Array<number>) {
    this.data = data;
    this.dirty = true;
  }

  get length(): number {
    return this.data.length;
  }

  get range(): DataRange {
    if (!this.dirty && this._range !== undefined) return this._range;
    this.dirty = false;
    const updatedRange = Arrays.minMaxAvg(this.data);
    if (this._range === undefined || updatedRange.max !== this._range.max || updatedRange.min !== this._range.min) {
      this._range = updatedRange;
      return { ...this._range, changed: true };
    } else {
      return { ...this._range, changed: false };

    }
  }

  add(value: number) {
    this.data = [ ...this.data, value ];
    this.dirty = true;
  }
}

class StreamingDataSource extends ArrayDataSource {
  desiredDataPointMinWidth = 5;

  add(value: number) {
    const lastWidth = this.series.lastPxPerPt;
    if (lastWidth > -1 && lastWidth < this.desiredDataPointMinWidth) {
      // Remove older data
      const pts = Math.floor(this.desiredDataPointMinWidth / lastWidth);
      const d = [ ...this.data.slice(pts), value ];
      super.set(d);
    } else super.add(value);
  }
}

export type DataRange = {
  min: number;
  max: number;
  changed?: boolean;
};

export class Series {
  name: string;
  colour: string;
  source: DataSource;
  drawingStyle: `line` | `dotted` | `bar`;
  width = 3;
  dataHitPoint: DataHitPoint | undefined;
  tooltip?: string;
  precision = 2;

  readonly axisRange: DataRange;

  // How many pixels wide per data point on last draw
  lastPxPerPt = -1;

  protected _visualRange: DataRange;
  protected _visualRangeStretch: boolean;

  constructor(
    name: string,
    sourceType: `array` | `stream`,
    private plot: Plot,
    opts: SeriesOpts
  ) {
    this.name = name;

    this.drawingStyle = opts.drawingStyle ?? `line`;
    this.colour = opts.colour;
    this.width = opts.width ?? 3;
    this.axisRange = opts.axisRange ?? { min: Number.NaN, max: Number.NaN };
    this._visualRange = { ...this.axisRange };
    this._visualRangeStretch = opts.visualRangeStretch ?? true;

    if (sourceType === `array`) {
      this.source = new ArrayDataSource(this);
    } else if (sourceType === `stream`) {
      this.source = new StreamingDataSource(this);
    } else throw new Error(`Unknown sourceType. Expected array|stream`);
  }

  formatValue(v: number) {
    return v.toFixed(this.precision);
  }

  get visualRange(): DataRange {
    let vr = this._visualRange;
    const sourceRange = this.source.range;
    let changed = false;

    if (sourceRange.changed) {
      if (this._visualRangeStretch) {
        // Stretch range to lowest/highest-seen min/max
        const rmin = Math.min(ifNaN(vr.min, sourceRange.min), sourceRange.min);
        const rmax = Math.max(ifNaN(vr.max, sourceRange.max), sourceRange.max);
        if (rmin !== vr.min || rmax !== vr.max) {
          // Changed
          vr = { min: rmin, max: rmax };
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
    return { ...vr, changed };
  }

  scaleValue(value: number): number {
    if (this.source === undefined) return value;
    const r = this.visualRange;
    if (r.changed) {
      this.plot.notify(`range-change`, this.plot.plotArea);
    }
    if (r.min == r.max) {
      // No real scale - only received the same value for this series
      return 0.5;
    }
    return scale(value, r.min, r.max);
  }

  add(value: number) {
    throwNumberTest(value, ``, `value`);
    this.source.add(value);
    //this.plot.plotArea.layoutInvalidated(`Series.add`);
    this.plot.plotArea.drawingInvalidated(`Series.add`);
  }

  /**
   * Clears the underlying source
   * and sets a flag that the plot area needs redrawing
   */
  clear() {
    this.source.clear();
    this._visualRange = { ...this.axisRange };
    this.plot.plotArea.layoutInvalidated(`Series.clear`);
  }
}

export class PlotArea extends Sg.CanvasBox {
  paddingPx = 5;
  piPi = Math.PI * 2;
  // If pointer is more than this distance away from a data point, it's ignored
  pointerDistanceThreshold = 20;
  lastRangeChange = 0;
  pointer: Points.Point | undefined;

  constructor(private plot: Plot, region: Rects.RectPositioned) {
    super(plot, `PlotArea`, region);

  }

  clear() {
    this.lastRangeChange = 0;
    this.pointer = undefined;
  }

  protected measureSelf(
    opts: Sg.MeasureState,
    _parent?: Sg.Measurement
  ): Rects.Rect | string {

    const axisY = opts.getActualSize(`AxisY`);
    const padding = this.paddingPx;
    const legend = opts.getActualSize(`Legend`);
    const legendHeight = legend?.height ?? 0;

    const axisX = opts.getActualSize(`AxisX`);
    const axisXHeight = axisX?.height ?? 0;

    if (!axisY) return `No AxisY. Measured: ${ opts.whatIsMeasured().join(`, `) }`;
    if (!legend) return `No Legend`;
    if (!axisX) return `No AxisX`;

    return {
      width: opts.bounds.width - axisY.width - this.paddingPx,
      height: opts.bounds.height - legendHeight - axisXHeight - padding,
    };
  }

  protected layoutSelf(measureState: Sg.MeasureState, _layoutState: Sg.LayoutState, _parent: Sg.Layout) {
    const axisY = measureState.getActualSize(`AxisY`);
    //const axisX = measureState.getActualSize(`AxisX`);
    const padding = this.paddingPx;

    //const legend = measureState.getActualSize(`Legend`);
    //const legendHeight = legend?.height ?? 0;

    //const axisXHeight = axisX?.height ?? 0;
    const axisYWidth = axisY?.width ?? 0;

    //const height = this._measuredSize?.height ?? 0;

    return {
      x: axisYWidth,
      y: padding // layoutState.bounds.height - height - axisXHeight - legendHeight
    }
  }

  protected onNotify(message: string, source: Sg.Box): void {
    //this.debugLog(`onNotify message: ${ message } source: ${ source.id }`);
    if (message === `measureApplied` && source === this.plot.axisY)
      this.layoutInvalidated(`PlotArea.onNotify measureApplied to axisY`);
    if (message === `laidout` && source === this.plot.legend)
      this.layoutInvalidated(`PlotArea.onNotify laidout to legend`);
  }

  // protected onClick(p: Points.Point): void {
  //   this.plot.frozen = !this.plot.frozen;
  // }

  protected onPointerLeave(): void {
    for (const series of this.plot.series.values()) {
      series.tooltip = undefined;
    }
    this.pointer = undefined;
    (this.plot.legend as Sg.CanvasBox).drawingInvalidated(`PlotArea.onPointerLeave`);
  }

  protected onPointerMove(p: Points.Point): void {
    this.pointer = p;
    this.plot.legend.drawingInvalidated(`PlotArea.onPointerMove`);
  }

  protected measurePreflight(): void {
    this.updateTooltip();
  }

  updateTooltip() {
    const p = this.pointer;
    if (p === undefined) return;

    for (const series of this.plot.series.values()) {
      if (p === undefined) {
        series.tooltip = undefined;
        return;
      }
      if (series.dataHitPoint === undefined) return;
      const v = series.dataHitPoint(p);
      if (v[ 0 ] === undefined) return;
      if (v[ 1 ] > this.pointerDistanceThreshold) return; // too far away
      series.tooltip = series.formatValue(v[ 0 ].value);
      //this.plot.legend.onLayoutNeeded();
    }
    this.plot.legend.drawingInvalidated(`PlotArea.updateTooltip`);
  }

  protected drawSelf(ctx: CanvasRenderingContext2D): void {
    if (this.plot.frozen) return;
    const seriesCopy = this.plot.seriesArray(); // [...this.plot.series.values()];
    //ctx.fillStyle = `hsla(10,50%,50%,0.5)`;
    //ctx.fillRect(0, 0, this.canvasRegion.width, this.canvasRegion.height);

    // Using -1 for y to catch a few random peaks from sharp lines
    ctx.clearRect(0, -1, this.canvasRegion.width, this.canvasRegion.height);

    for (const series of seriesCopy) {
      if (series.source.type === `array` || series.source.type === `stream`) {
        const arraySeries = series.source as ArrayDataSource;
        if (arraySeries.data === undefined) return;
        const d = [ ...arraySeries.data ];
        this.drawDataSet(series, d, ctx);
      } else console.warn(`Unknown data source type ${ series.source.type }`);
    }
  }

  computeY(series: Series, rawValue: number) {
    const s = series.scaleValue(rawValue);
    return flip(s) * this.canvasRegion.height + this.paddingPx;
  }

  drawDataSet(
    series: Series,
    d: Array<number>,
    ctx: CanvasRenderingContext2D
  ): void {
    const padding = this.paddingPx + series.width;
    const v = Rects.subtract(this.canvasRegion, padding * 2, padding * 3.5);
    const pxPerPt = v.width / d.length;

    series.lastPxPerPt = pxPerPt;
    let x = padding;

    ctx.strokeStyle = series.colour;
    ctx.lineWidth = series.width;
    const shapes: Array<DataPoint & PointCalculableShape> = [];

    series.dataHitPoint = (pt: Points.Point): [ DataPoint, number ] => {
      const distances = shapes.map((v) => Points.distanceToExterior(pt, v));
      const index = minIndex(...distances);
      const closest = shapes[ index ];
      if (closest === undefined) [ undefined, 0 ];
      return [ closest, distances[ index ] ];
    };

    // eslint-disable-next-line unicorn/prefer-switch
    if (series.drawingStyle === `line`) {
      let y = 0;
      ctx.beginPath();

      // eslint-disable-next-line unicorn/no-for-loop
      for (let index = 0; index < d.length; index++) {
        const scaled = clamp(series.scaleValue(d[ index ]));
        y = padding + this.paddingPx + v.height * flip(scaled);
        shapes.push({ x, y, index: index, value: d[ index ] });

        if (index == 0) ctx.moveTo(x + pxPerPt / 2, y);
        else ctx.lineTo(x + pxPerPt / 2, y);

        if (y > this.canvasRegion.height)
          console.warn(`${ y } h: ${ this.canvasRegion.height }`);
        x += pxPerPt;
      }
      ctx.strokeStyle = series.colour;
      ctx.stroke();
    } else if (series.drawingStyle === `dotted`) {
      let y = 0;
      ctx.fillStyle = series.colour;
      // eslint-disable-next-line unicorn/no-for-loop
      for (let index = 0; index < d.length; index++) {
        const scaled = series.scaleValue(d[ index ]);
        y = padding + v.height * flip(scaled);
        ctx.beginPath();
        ctx.arc(x + pxPerPt / 2, y, series.width, 0, this.piPi);
        ctx.fill();
        shapes.push({ radius: series.width, x, y, index: index, value: d[ index ] });
        x += pxPerPt;
      }
    } else if (series.drawingStyle === `bar`) {
      ctx.fillStyle = series.colour;
      const interBarPadding = Math.ceil(pxPerPt * 0.1);
      // eslint-disable-next-line unicorn/no-for-loop
      for (let index = 0; index < d.length; index++) {
        const scaled = series.scaleValue(d[ index ]);
        const h = v.height * scaled;
        const r = {
          x: x + interBarPadding,
          y: v.height - h + padding,
          width: pxPerPt - interBarPadding,
          height: h,
          index: index,
          value: d[ index ],
        };
        ctx.fillRect(r.x, r.y, r.width, r.height);
        shapes.push(r);
        x += pxPerPt;
      }
    }
  }
}

export class Legend extends Sg.CanvasBox {
  sampleSize = { width: 10, height: 10 };
  padding = 3;
  widthSnapping = 20;

  labelMeasurements = new Map<string, Rects.RectPositioned>();

  constructor(private plot: Plot, region: Rects.RectPositioned) {
    super(plot, `Legend`, region);
  }

  clear() {
    /** no-op */
  }

  protected layoutSelf(measureState: Sg.MeasureState, layoutState: Sg.LayoutState, _parent: Sg.Layout) {
    const axisY = measureState.getActualSize(`AxisY`);
    const axisYWidth = axisY?.width ?? 0;

    const height = this._measuredSize?.height ?? 0;
    return {
      x: axisYWidth,
      y: layoutState.bounds.height - height
    }
  }

  protected measureSelf(
    opts: Sg.CanvasMeasureState,
    _parent?: Sg.Measurement
  ): Rects.Rect | Rects.RectPositioned | string {
    const series = this.plot.seriesArray();
    const sample = this.sampleSize;
    const padding = this.padding;
    const widthSnapping = this.widthSnapping;
    const ctx = opts.ctx;

    const yAxis = opts.measurements.get(`AxisY`);
    const yAxisWidth = yAxis?.actual.width ?? 0;

    let x = padding;
    let y = padding;
    const availableWidth = opts.bounds.width - yAxisWidth - padding;

    //let rows = 1;
    let rowHeight = 0;
    for (const s of series) {
      const startX = x;
      x += sample.width + padding;
      ctx.textBaseline = `middle`;

      const text = textRect(ctx, s.name, padding, widthSnapping);

      x += textWidth(ctx, s.name, padding, widthSnapping);

      if (s.tooltip) {
        x += textWidth(ctx, s.tooltip, padding, widthSnapping);
      }
      const r = { width: 10, height: 10, x: startX, y };

      this.labelMeasurements.set(s.name, r)
      rowHeight = Math.min(sample.height + padding + padding, text.height + padding + padding);
      x += padding;
      if (x > availableWidth) {
        x = padding;
        y += rowHeight;
        //rows++;

      }
    }

    return {
      width: availableWidth,
      height: y + rowHeight
    }
    // const ctx = (opts as Sg.CanvasMeasureState).ctx;

    // const usableWidth = opts.bounds.width - yAxisWidth;

    // let width = padding;
    // for (const s of series) {
    //   width += sample.width + padding;
    //   width += textWidth(ctx, s.name, padding, widthSnapping);
    //   width += textWidth(ctx, s.tooltip, padding, widthSnapping);
    // }

    // const rows = Math.max(1, Math.ceil(width / usableWidth));
    // console.log(`rows: ${ rows }`);
    // const h = rows * (this.sampleSize.height + this.padding + this.padding);
    // return {
    //   x: yAxisWidth,
    //   y: opts.bounds.height - h,
    //   width: usableWidth,
    //   height: h,
    // };
  }

  protected drawSelf(ctx: CanvasRenderingContext2D): void {
    const series = this.plot.seriesArray();
    const sample = this.sampleSize;
    const padding = this.padding;
    this.debugLog(`drawSelf`);

    ctx.clearRect(0, 0, this.canvasRegion.width, this.canvasRegion.height);
    for (const s of series) {
      const r = this.labelMeasurements.get(s.name);
      if (r === undefined) continue;
      let x = r.x;

      // Draw colour chip
      ctx.fillStyle = s.colour;
      ctx.fillRect(x, r.y, sample.width, sample.height);
      x += sample.width + padding;

      // Label
      ctx.textBaseline = `middle`;
      ctx.fillStyle = this.plot.legendTextColour;
      ctx.fillText(s.name, x, r.y + sample.height / 2);

      if (s.tooltip) {
        ctx.fillStyle = this.plot.legendTextColour;
        ctx.fillText(s.tooltip, r.x, r.y + sample.height / 2);
      }
    }
    // const series = this.plot.seriesArray();
    // const sample = this.sampleSize;
    // const padding = this.padding;
    // const widthSnapping = this.widthSnapping;

    // let x = padding;
    // let y = padding;

    // ctx.clearRect(0, 0, this.canvasRegion.width, this.canvasRegion.height);
    // let rows = 1;
    // for (const s of series) {
    //   ctx.fillStyle = s.colour;
    //   ctx.fillRect(x, y, sample.width, sample.height);
    //   x += sample.width + padding;
    //   ctx.textBaseline = `middle`;
    //   ctx.fillStyle = this.plot.legendTextColour;
    //   ctx.fillText(s.name, x, y + sample.height / 2);
    //   x += textWidth(ctx, s.name, padding, widthSnapping);

    //   if (s.tooltip) {
    //     ctx.fillStyle = this.plot.legendTextColour;
    //     ctx.fillText(s.tooltip, x, y + sample.height / 2);
    //     x += textWidth(ctx, s.tooltip, padding, widthSnapping);
    //   }
    //   x += padding;
    //   if (x > this.canvasRegion.width - 100) {
    //     x = padding;
    //     y += sample.height + padding + padding;
    //     rows++;
    //     this.debugLog(`drawSelf rows: ${ rows }`);
    //   }
    // }
  }

  protected onNotify(message: string, source: Sg.Box): void {
    this.debugLog(`onNotify ${ message } source: ${ source.id }`);
    if (message === `measureApplied` && source === (this._parent as Plot).axisY) {
      this.layoutInvalidated(`Legend.onNotify measureApplied to axisY`);

    } else if (message == `range-change`) {
      //this.layoutInvalidated(`Legend.onNotify range-change`);
    }
  }
}

export class AxisX extends Sg.CanvasBox {
  paddingPx = 2;
  colour?: string;

  constructor(private plot: Plot, region: RectPositioned) {
    super(plot, `AxisX`, region);
  }

  clear() {
    /** no-op */
  }

  protected onNotify(message: string, source: Sg.Box): void {
    //this.debugLog(message);
    if (message === `measureApplied` && source === this.plot.axisY) {
      this.layoutInvalidated(`AxisX.onNotify measureApplied to axisY`);
    }
    // if (message === `measureApplied` && source === this.plot.legend) {
    //   this.layoutInvalidated(`AxisX.onNotify measureApplied to legend`);
    // }
  }

  protected drawSelf(ctx: CanvasRenderingContext2D): void {
    const plot = this.plot;
    const v = this.canvasRegion;
    const strokeWidth = plot.axisStrokeWidth;

    const colour = this.colour ?? plot.axisStrokeColour;
    ctx.strokeStyle = colour;

    ctx.clearRect(0, 0, v.width, v.height);
    //ctx.fillStyle = `hsla(200,50%,50%,0.5)`;
    //ctx.fillRect(0, 0, v.width, v.height);
    //this.debugLog(`drawSelf: ${ v.width } x ${ v.height } padding: ${ this.paddingPx }`);
    ctx.beginPath();
    ctx.lineWidth = strokeWidth;
    ctx.moveTo(0, strokeWidth / 2);
    ctx.lineTo(v.width, strokeWidth / 2);
    ctx.stroke();
  }

  protected measureSelf(
    opts: Sg.CanvasMeasureState,
    _parent?: Sg.Measurement
  ): Rects.Rect | Rects.RectPositioned | string {
    const plot = this.plot;
    const padding = this.paddingPx;
    const yAxis = opts.measurements.get(`AxisY`);
    const yAxisWidth = yAxis?.actual.width ?? 0;

    // TODO: If we start using x-axis labels
    const heightOfText = 0;//textHeight(opts.ctx, `100`, padding);
    const h = plot.axisStrokeWidth + heightOfText + padding + padding;

    return {
      width: opts.bounds.width - yAxisWidth - padding,
      height: h,
    };
  }

  protected layoutSelf(measureState: Sg.MeasureState, _layoutState: Sg.LayoutState, _parent?: Sg.Layout | undefined): Points.Point | undefined {
    const yAxis = measureState.measurements.get(`AxisY`);
    const legend = measureState.getActualSize(`Legend`);
    const legendHeight = legend?.height ?? 0;

    const yAxisWidth = yAxis?.actual.width ?? 0;

    const height = this._measuredSize?.height ?? 0;
    return {
      x: yAxisWidth,
      y: measureState.bounds.height - height - legendHeight
    }
  }
}

const isRangeEqual = (a: DataRange, b: DataRange) =>
  a.max === b.max && a.min === b.min;
const isRangeSinglePoint = (a: DataRange) => a.max === a.min;

export class AxisY extends Sg.CanvasBox {
  // Number of digits axis will be expected to show as a data legend
  private _maxDigits = 1;

  seriesToShow: string | undefined;
  paddingPx = 2;
  colour?: string;

  lastRange: DataRange;
  lastPlotAreaHeight = 0;

  constructor(private plot: Plot, region: RectPositioned) {
    super(plot, `AxisY`, region);
    this.lastRange = { min: 0, max: 0 };
  }

  clear() {
    this.lastRange = { min: 0, max: 0 };
    this.lastPlotAreaHeight = 0;
  }

  protected measurePreflight(): void {
    //this.debugLog(`measurePreflight`);
    // const series = this.getSeries();
    // if (
    //   series !== undefined &&
    //   !isRangeEqual(series.visualRange, this.lastRange)
    // ) {
    //   this.layoutInvalidated(`AxisY.measurePreflight`);
    // }
  }

  protected onNotify(message: string, source: Sg.Box): void {
    //this.debugLog(message);
    const pa = this.plot.plotArea;
    if (message === `range-change`) {
      // Notification that series range has changed
      this.drawingInvalidated(`range-change`);
      return;
    }

    if (message === `measureApplied` && source === pa && (pa.canvasRegion.height !== this.lastPlotAreaHeight)) {
      this.lastPlotAreaHeight = pa.canvasRegion.height;
      this.drawingInvalidated(`AxisY.onNotify height change`);
    }
  }

  protected measureSelf(copts: Sg.CanvasMeasureState): Rects.Rect {
    //this.debugLog(`measureSelf. needsLayout: ${ this._needsLayoutX } needsDrawing: ${ this._needsDrawing }`);

    if (copts.ctx === undefined) throw new Error(`opts.ctx is undefined`);

    const paddingPx = this.paddingPx;
    let width = this.plot.axisStrokeWidth + paddingPx;

    const series = this.getSeries();
    if (series !== undefined) {
      const r = series.visualRange;
      this._maxDigits =
        Math.ceil(r.max).toString().length + series.precision + 1;

      const textToMeasure = `9`.repeat(this._maxDigits);
      width += textWidth(copts.ctx, textToMeasure, paddingPx * 2);
    }
    const w = copts.resolveToPx(this.desiredRegion?.width, width, width);
    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      width: w!,
      height: copts.bounds.height,
    };
  }

  protected layoutSelf(_measureState: Sg.MeasureState, _layoutState: Sg.LayoutState, _parent?: Sg.Layout | undefined): Points.Point {
    return { x: 0, y: 0 }
  }

  protected drawSelf(ctx: CanvasRenderingContext2D): void {
    const s = this.getSeries();
    if (s === undefined) {
      if (this.seriesToShow === undefined) return;
      console.warn(`Plot AxisY series '${ this.seriesToShow }' is missing.`);
    } else {
      this.seriesAxis(s, ctx);
    }
  }

  getSeries(): Series | undefined {
    return this.seriesToShow === undefined ?
      // Pick first series
      this.plot.seriesArray()[ 0 ] :
      // Try designated series name
      this.plot.series.get(this.seriesToShow);
  }

  seriesAxis(series: Series, ctx: CanvasRenderingContext2D) {
    const plot = this.plot;
    const plotArea = plot.plotArea;
    const v = this.canvasRegion;
    const paddingPx = this.paddingPx;
    const r = series.visualRange;
    const strokeWidth = plot.axisStrokeWidth;

    const colour = this.colour ?? plot.axisStrokeColour;
    ctx.strokeStyle = colour;
    ctx.fillStyle = colour;

    if (Number.isNaN(r.min) && Number.isNaN(r.max)) return; // Empty
    this.lastRange = r;
    ctx.clearRect(0, 0, v.width, v.height);

    // ctx.fillStyle = `yellow`;
    // ctx.fillRect(0, 0, this.canvasRegion.width, this.canvasRegion.height);

    ctx.beginPath();
    ctx.lineWidth = strokeWidth;
    const lineX = v.width - strokeWidth / 2;
    ctx.moveTo(lineX, plotArea.paddingPx + strokeWidth);
    ctx.lineTo(lineX, plotArea.canvasRegion.height + paddingPx + strokeWidth + strokeWidth);
    ctx.stroke();

    ctx.textBaseline = `top`;
    const fromRight = v.width - paddingPx * 4;

    ctx.fillStyle = plot.axisTextColour;
    if (isRangeSinglePoint(r)) {
      this.debugLog(`rangeSinglePoint`);
      drawText(ctx, series.formatValue(r.max), (size) => [
        fromRight - size.width,
        plotArea.computeY(series, r.max) - paddingPx * 4,
      ]);
    } else {
      // Draw min/max data labels
      drawText(ctx, series.formatValue(r.max), (size) => [
        fromRight - size.width,
        plotArea.computeY(series, r.max) + strokeWidth / 2,
      ]);
      drawText(ctx, series.formatValue(r.min), (size) => [
        fromRight - size.width,
        plotArea.computeY(series, r.min) - 5,
      ]);
    }
  }
}

const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  position: (size: TextMetrics) => [ x: number, y: number ]
) => {
  if (ctx === undefined) throw new Error(`ctx is undefined`);
  const size = ctx.measureText(text);
  const xy = position(size);
  ctx.fillText(text, xy[ 0 ], xy[ 1 ]);
};

/**
 * Canvas-based data plotter.
 *
 * ```
 * const p = new Plot(document.getElementById(`myCanvas`), opts);
 *
 * // Plot 1-5 as series  test'
 * p.createSeries(`test`, `array`, [1,2,3,4,5]);
 *
 * // Create a streaming series, add a random number
 * const s = p.createSeries(`test2`, `stream`);
 * s.add(Math.random());
 * ```
 * `createSeries` returns the {@link Series} instance with properties for fine-tuning
 *
 * For simple usage, use `plot(someData)` which automatically creates
 * series for the properties of an object.
 */
export class Plot extends Sg.CanvasBox {
  plotArea: PlotArea;
  legend: Legend;
  axisX: AxisX;
  axisY: AxisY;
  axisStrokeColour: string;
  axisTextColour: string;
  legendTextColour: string;

  axisStrokeWidth: number;
  series: Map<string, Series>;
  private _frozen = false;
  private _canvasEl: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  defaultSeriesOpts?: SeriesOpts;
  constructor(canvasElementOrQuery: HTMLCanvasElement | string, opts: Opts = {}) {
    const { ctx, element, bounds } = scaleCanvas(canvasElementOrQuery);
    super(undefined, `Plot`, bounds);
    this._canvasEl = element;
    this._ctx = ctx;

    if (opts.autoSize) {
      parentSizeCanvas(element, (event) => {
        this.drawingInvalidated(`resize`);
        this.update(event.ctx, true);
      });
    }

    this.axisStrokeColour = opts.axisStrokeColour ?? `black`;
    this.axisTextColour = opts.axisTextColour ?? `black`;
    this.legendTextColour = opts.legendTextColour ?? `black`;

    this.axisStrokeWidth = opts.axisStrokeWidth ?? 3;
    this.series = new Map();
    this.plotArea = new PlotArea(this, bounds);
    this.legend = new Legend(this, bounds);
    this.axisX = new AxisX(this, bounds);
    this.axisY = new AxisY(this, bounds);

    // this.plotArea.debugLayout = false;
    // this.axisX.debugLayout = false;
    // this.axisY.debugLayout = false;
    // this.legend.debugLayout = true;
    // this.debugLayout = true;
  }

  update(ctx?: CanvasRenderingContext2D, force = false) {
    if (ctx === undefined) ctx = this._ctx;
    super.update(ctx, force);
    // this.plotArea.update(ctx, force);
    // this.axisX.update(ctx, force);
    // this.axisY.update(ctx, force);
    // this.legend.update(ctx, force);
  }

  /**
   * Calls 'clear()' on each of the series
   */
  clearSeries() {
    for (const series of this.series.values()) {
      series.clear();
    }
    this.update();
  }

  /**
   * Removes all series, plot, legend
   * and axis data.
   */
  clear() {
    this.series = new Map();
    this.plotArea.clear();
    this.legend.clear();
    this.axisX.clear();
    this.axisY.clear();
    this.layoutInvalidated(`Plot.clear`);
    this.drawingInvalidated(`Plot.clear`);
    this.update();
  }

  get frozen(): boolean {
    return this._frozen;
  }

  set frozen(v: boolean) {
    this._frozen = v;
    if (v) {
      this._canvasEl.classList.add(`frozen`);
      this._canvasEl.title = `Plot frozen. Tap to unfreeze`;
    } else {
      this._canvasEl.title = ``;
      this._canvasEl.classList.remove(`frozen`);
    }
  }

  seriesArray(): Array<Series> {
    return [ ...this.series.values() ];
  }

  get seriesLength(): number {
    return this.series.size;
  }

  /**
   * Plots a simple object, eg `{ x: 10, y: 20, z: 300 }`
   * Series are automatically created for each property of `o`
   *
   * Be sure to call `update()` to visually refresh.
   * @param o
   */
  plot(o: any) {
    const paths = getFieldPaths(o);
    let seriesCreated = false;
    for (const p of paths) {
      let s = this.series.get(p);
      if (s === undefined) {
        s = this.createSeries(p, `stream`);
        s.drawingStyle = `line`;
        seriesCreated = true;
      }
      s.add(getFieldByPath(o, p));
    }
    if (seriesCreated) this.legend.layoutInvalidated(`new series`);
    this.update();
  }

  createSeriesFromObject(o: any, prefix = ``): Array<Series> {
    const keys = Object.keys(o);
    const create = (key: string): Array<Series> => {
      const v = o[ key ];
      if (typeof v === `object`) {
        return this.createSeriesFromObject(v, `${ prefix }${ key }.`);
      } else if (typeof v === `number`) {
        return [ this.createSeries(key, `stream`) ];
      } else {
        return [];
      }
    };
    return keys.flatMap(k => create(k));
  }

  createSeries(
    name?: string,
    type: `stream` | `array` = `array`,
    seriesOpts?: SeriesOpts
  ): Series {
    const seriesLength = this.seriesLength;

    if (name === undefined) name = `series-${ seriesLength }`;
    if (this.series.has(name))
      throw new Error(`Series name '${ name }' already in use`);

    let opts: SeriesOpts = {
      colour: `hsl(${ (seriesLength * 25) % 360 }, 70%,50%)`,
      ...seriesOpts,
    };
    if (this.defaultSeriesOpts) opts = { ...this.defaultSeriesOpts, ...opts };

    const s = new Series(name, type, this, opts);
    // if (type === `array` && initialData !== undefined) {
    //   (s.source as ArrayDataSource).set(initialData);
    // }

    this.series.set(name, s);
    this.setReady(true, true);
    this.plotArea.drawingInvalidated(`Plot.createSeries`);
    return s;
  }
}
