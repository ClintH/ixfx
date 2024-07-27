import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import { property } from "lit/decorators/property.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { CanvasHelper } from "src/dom/CanvasHelper.js";
import type { Rect, RectPositioned } from "src/geometry/Types.js";
import * as Numbers from '../numbers/index.js';
import type { Colourish } from "src/visual/Colour.js";
import type { DrawingHelper } from "src/visual/Drawing.js";
import { Colour, Drawing } from "src/visual/index.js";
import { Pathed } from "src/data/index.js";

/**
 * Attributes
 * * streaming: true/false (default: true)
 * * max-length: number (default: 500). How many data points per series to store
 * * data-width: when streaming, how much horizontal width per point
 * * fixed-max/fixed-min: global input scaling (default: NaN, ie. disabled)
 * 
 * * line-width: stroke width of drawing line (default:2)
 * 
 * * render: 'dot' or 'line' (default: 'dot')
 * 
 * Styling variables
 * * --legend-fg: legend foreground text
 */
@customElement(`plot-element`)
export class PlotElement extends LitElement {
  @property({ attribute: `streaming`, type: Boolean })
  streaming = true;

  @property({ attribute: `max-length`, type: Number })
  maxLength = 500;

  @property({ attribute: `data-width`, type: Number })
  dataWidth = 5;

  @property({ attribute: `fixed-max`, type: Number })
  fixedMax = Number.NaN;

  @property({ attribute: `fixed-min`, type: Number })
  fixedMin = Number.NaN;

  @property({ attribute: `line-width`, type: Number })
  lineWidth = 2;

  @property({ attribute: `render`, type: String })
  renderStyle = `dot`

  autoRedraw = true;
  padding = 5;

  paused = false;
  #series: Map<string, PlotSeries> = new Map();
  #canvas: CanvasHelper | undefined;
  #drawing: DrawingHelper | undefined;

  #legendColour: string = ``;
  #hue = 0;

  canvasEl: Ref<HTMLCanvasElement> = createRef();

  constructor() {
    super();
  }

  get series() {
    return [ ...this.#series.values() ];
  }

  get seriesCount() {
    return this.#series.size;
  }
  /**
   * Delete a series.
   * Returns _true_ if there was a series to delete
   * @param name 
   * @returns 
   */
  deleteSeries(name: string): boolean {
    name = name.toLowerCase();
    const s = this.#series.get(name);
    if (!s) return false;
    this.#series.delete(name);
    return true;
  }

  /**
   * Keeps the series, but deletes its data
   * @param name
   * @returns 
   */
  clearSeries(name: string): boolean {
    name = name.toLowerCase();
    const s = this.#series.get(name);
    if (!s) return false;
    this.#series.clear();
    return true;
  }

  /**
   * Delete all data & series
   */
  clear() {
    this.#series.clear();
  }

  /**
   * Keeps all series, but deletes their data
   */
  clearData() {
    for (const s of this.#series.values()) {
      s.clear();
    }
  }

  render() {
    return html`<canvas ${ ref(this.canvasEl) }></canvas>`
  }

  #setupCanvas(): CanvasHelper {
    if (this.#canvas !== undefined) return this.#canvas;
    const canvas = this.canvasEl.value!;// this.shadowRoot?.querySelector(`canvas`);
    if (!canvas) throw new Error(`canvas element not found`);
    const c = new CanvasHelper(canvas);
    this.#canvas = c;
    this.#drawing = Drawing.makeHelper(c.ctx);
    return c;
  }

  connectedCallback(): void {
    super.connectedCallback();

  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    const canvas = this.canvasEl.value!;
    const ro = new ResizeObserver((event) => {
      const c = this.#setupCanvas();
      if (!c) return;
      const entry = event[ 0 ];
      c.setLogicalSize(entry.contentRect);
    });
    ro.observe(this);
    this.updateColours();
  }

  updateColours() {
    this.#legendColour = Colour.getCssVariable(`legend-fg`, `black`);
    //this.#backgroundColour = Colour.getCssVariable(`background`, `white`);
  }

  // protected updated(_changedProperties: PropertyValues): void {
  //   this.#setupCanvas();
  // }

  plot(value: number, seriesName: string = ``) {
    let s = this.#series.get(seriesName.toLowerCase());
    if (s === undefined) {
      s = new PlotSeries(seriesName, this.colourGenerator(seriesName), this);
      this.#series.set(seriesName.toLowerCase(), s);
    }
    s.push(value);
    if (this.autoRedraw) this.draw();
    return s;
  }

  plotObject(value: object) {
    for (const p of Pathed.getPathsAndData(value, true)) {
      this.plot(p.value, p.path);
    }
  }

  colourGenerator(series: string): Colour.Colourish {
    const c = Colour.fromHsl(this.#hue, 0.9, 0.4);
    this.#hue = Numbers.wrap(this.#hue + 0.1);
    return c;
  }

  draw() {
    if (this.paused) return;

    const c = this.#canvas;
    const d = this.#drawing;
    const padding = this.padding;
    if (!d || !c) return;
    c.clear();
    const ctx = d.ctx;

    const axisYwidth = this.computeAxisYWidth(c);
    const remainingWidth = c.width - axisYwidth;

    // Legend across bottom
    const clLegend = this.computeLegend(c, remainingWidth, padding);
    const plotHeight = c.height - clLegend.bounds.height - padding;
    const cy = { width: axisYwidth, height: plotHeight };
    const cp = this.computePlot(c, plotHeight, cy.width, padding);
    const cl = { ...clLegend.bounds, x: cy.width, y: cp.y + cp.height + padding }

    let globalScaler: ((v: number) => number) | undefined;
    if (!Number.isNaN(this.fixedMax) && !Number.isNaN(this.fixedMin)) {
      globalScaler = Numbers.scaler(this.fixedMin, this.fixedMax);
    }

    // Draw legend
    ctx.save();
    ctx.translate(cl.x + padding, cl.y + padding);
    this.drawLegend(cl, d);
    ctx.restore();

    ctx.save();
    ctx.translate(cp.x + padding, cp.y + padding);
    //ctx.fillStyle = `whitesmoke`;
    //ctx.fillRect(0, 0, cp.width, cp.height);

    // Draw data
    for (const series of this.#series.values()) {

      const data = globalScaler === undefined ?
        series.getScaled() :
        series.getScaledBy(globalScaler);

      const colour = Colour.resolveToString(series.colour);
      switch (this.renderStyle) {
        case `line`:
          this.drawLineSeries(data, cp, d, colour);
          break;
        default:
          this.drawDotSeries(data, cp, d, colour);
      }
    }
    ctx.restore();

  }

  drawLegend(cl: RectPositioned, d: DrawingHelper) {
    const textColour = this.#legendColour;
    const padding = this.padding;
    let x = 0;
    let y = padding;
    let swatchSize = 10;
    const ctx = d.ctx;

    for (const series of this.#series.values()) {
      ctx.fillStyle = Colour.resolveToString(series.colour);
      ctx.fillRect(x, y, swatchSize, swatchSize);
      ctx.fillStyle = textColour;
      x += swatchSize + padding;
      const m = ctx.measureText(series.name);
      ctx.textBaseline = `middle`;
      ctx.fillText(series.name, x, y + swatchSize / 2);

      x += m.width + padding;
      if (x >= cl.width) {
        y += 10 + padding;
        x = 0;
      }
    }
  }

  drawLineSeries(data: number[], cp: Rect, d: DrawingHelper, colour: string) {
    const pointWidth = this.streaming ? this.dataWidth : (cp.width / data.length);
    let x = 0;
    if (this.streaming) x = cp.width - (pointWidth * data.length);
    const pos = data.map(d => {
      x += pointWidth;
      return {
        x: x,
        y: (1 - d) * cp.height,
        radius: pointWidth
      };
    })
    // Ignore points off the screen
    const trimmed = pos.filter(p => {
      if (p.x < 0) return false;
      return true;
    })
    d.connectedPoints(trimmed, {
      strokeStyle: colour,
      lineWidth: this.lineWidth
    });
  }

  drawDotSeries(data: number[], cp: Rect, d: DrawingHelper, colour: string) {
    const pointWidth = this.streaming ? this.dataWidth : cp.width / data.length;
    let x = 0;
    if (this.streaming) x = cp.width - (pointWidth * data.length);
    const pos = data.map(d => {
      x += pointWidth;
      return {
        x,
        y: (1 - d) * cp.height,
        radius: pointWidth
      }
    })
    // Ignore points off the screen
    const trimmed = pos.filter(p => {
      if (p.x < 0) return false;
      return true;
    })
    d.dot(trimmed, { filled: true, fillStyle: colour });
  }
  computePlot(c: CanvasHelper, plotHeight: number, axisYwidth: number, padding: number) {
    return {
      x: axisYwidth,
      y: 0,
      width: c.width - axisYwidth - padding,
      height: plotHeight - padding - padding
    }
  }

  computeAxisYWidth(c: CanvasHelper) {
    return 0;
  }

  #swatchSize = 10;

  computeLegend(c: CanvasHelper, maxWidth: number, padding: number) {
    const ctx = c.ctx;

    const series = [ ...this.#series.values() ];
    let largestH = 0;
    const sizes = series.map(s => {
      let width = this.#swatchSize + padding;
      const m = ctx.measureText(s.name);
      width += m.width;
      const height = m.emHeightAscent + m.emHeightDescent;
      largestH = Math.max(height, largestH);
      return {
        width,
        height
      }
    });
    const parts = [];
    let x = padding;
    let y = padding;
    let usedWidthMax = 0;
    for (const s of sizes) {
      parts.push({
        x, y, ...s
      })
      x += s.width;
      usedWidthMax = Math.max(x, usedWidthMax);
      if (x >= maxWidth) {
        x = padding;
        y += largestH + padding;
      }
    }
    const bounds = { width: usedWidthMax, height: y + largestH + padding }
    return {
      bounds, parts
    }
  }

  getSeries(name: string): PlotSeries | undefined {
    return this.#series.get(name);
  }

  static styles = css`
  :host {
    width: 100%;
    height: 100%;
    display: block;
  }
  `
}


export class PlotSeries {
  data: number[] = [];
  minSeen = Number.MAX_SAFE_INTEGER;
  maxSeen = Number.MIN_SAFE_INTEGER;

  constructor(public name: string, public colour: Colourish, private plot: PlotElement) {
  }

  clear() {
    this.data = [];
    this.resetScale();
  }

  /**
   * Returns a copy of the data scaled by the current
   * range of the data
   * @returns 
   */
  getScaled() {
    const r = this.maxSeen - this.minSeen;
    const s = Numbers.scaler(this.minSeen, this.maxSeen);
    return this.getScaledBy(s);
  }

  getScaledBy(scaler: (v: number) => number) {
    return this.data.map(v => Numbers.clamp(scaler(v)));
  }

  push(value: number) {
    this.data.push(value);
    if (this.data.length > this.plot.maxLength && this.plot.streaming) {
      this.data = this.data.slice(1);
    }
    this.minSeen = Math.min(this.minSeen, value);
    this.maxSeen = Math.max(this.maxSeen, value);
  }

  resetScale() {
    this.minSeen = Number.MAX_SAFE_INTEGER;
    this.maxSeen = Number.MIN_SAFE_INTEGER;
  }
}
