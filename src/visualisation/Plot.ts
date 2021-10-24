import {SlidingWindow} from "../SlidingWindow.js"
import {BasePlot} from "./BasePlot.js"

/**
 * Usage:
 * let plot = new Plot(plotCanvasEl)
 * plot.push(value)
 * 
 * @export
 * @class Plot
 * @extends {BaseGraph}
 */
export class Plot extends BasePlot {
  buffer: SlidingWindow;
  samples: number;
  color: string = 'silver';
  lineWidth: number = 3;

  constructor(canvasEl: HTMLCanvasElement, samples = 10) {
    super(canvasEl);
    this.buffer = new SlidingWindow(samples);
    this.samples = samples;
  }

  draw(g: CanvasRenderingContext2D, plotWidth: number, plotHeight: number) {
    const d = this.buffer.toArray(); // copy
    const dataLength = d.length;
    let {min, max, avg} = this.buffer.getMinMaxAvg();

    const range = this.pushScale(min, max);
    const lineWidth = plotWidth / dataLength;

    let x = this.plotPadding;
    if (this.showScale) x += 25;
    g.beginPath();
    g.lineWidth = lineWidth;
    g.strokeStyle = this.color;
    for (let i = 0; i < dataLength; i++) {
      const y = this.map(d[i], this.scaleMin, this.scaleMax, plotHeight, 0) + this.plotPadding;
      if (i == 0)
        g.moveTo(x, y);
      else
        g.lineTo(x, y);
      x += lineWidth;
    }
    g.stroke();

    g.fillStyle = 'black';

    this.drawScale(g, min, max, avg, range, plotWidth, plotHeight);

  }

  clear() {
    this.buffer.clear(this.samples);
    this.repaint();
  }

  push(v: number) {
    this.buffer.push(v);
    if (this.paused) return;
    this.repaint();
  }

}