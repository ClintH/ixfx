import * as Lists from '../collections/Lists.js';
import {getMinMaxAvg} from '../util.js';
import {BasePlot} from './BasePlot.js';

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
  buffer: Lists.Circular<number>;
  readonly samples: number;
  color = `silver`;
  lineWidth = 3;

  constructor(canvasEl: HTMLCanvasElement, samples = 10) {
    super(canvasEl);
    if (samples <= 0) throw new Error(`samples must be greater than zero`);
    this.buffer = new Lists.Circular(samples);
    this.samples = samples;
  }

  draw(g: CanvasRenderingContext2D, plotWidth: number, plotHeight: number) {
    const d = this.buffer;
    const dataLength = d.length;
    const {min, max, avg} = getMinMaxAvg(d);

    const range = this.pushScale(min, max);
    const lineWidth = plotWidth / dataLength;

    let x = this.plotPadding;
    if (this.showScale) x += 25;
    g.beginPath();
    g.lineWidth = lineWidth;
    g.strokeStyle = this.color;
    for (let i = 0; i < dataLength; i++) {
      const y = this.map(d[i], this.scaleMin, this.scaleMax, plotHeight, 0) + this.plotPadding;
      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
      x += lineWidth;
    }
    g.stroke();

    g.fillStyle = `black`;

    this.drawScale(g, min, max, avg, range, plotWidth, plotHeight);

  }

  clear() {
    this.buffer = new Lists.Circular(this.samples);
    this.repaint();
  }

  push(v: number) {
    this.buffer = this.buffer.add(v);
    if (this.paused) return;
    this.repaint();
  }

}