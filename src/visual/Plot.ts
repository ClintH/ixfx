import { MutableCircularArray } from '../collections/MutableCircularArray.js';
import {getMinMaxAvg} from '../collections/NumericArrays.js';
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
  buffer: MutableCircularArray<number>;
  readonly samples: number;
  color = `silver`;
  lineWidth = 3;

  constructor(canvasEl: HTMLCanvasElement, samples = 10) {
    super(canvasEl);
    if (samples <= 0) throw new Error(`samples must be greater than zero`);
    this.buffer = new MutableCircularArray<number>(samples);
    this.samples = samples;
  }

  draw(g: CanvasRenderingContext2D, plotWidth: number, plotHeight: number) {
    const d = this.buffer;
    const dataLength = d.length;
    const {min, max, avg} = getMinMaxAvg(d);

    const range = this.pushScale(min, max);
    const lineWidth = plotWidth / dataLength;

    // eslint-disable-next-line functional/no-let
    let x = this.plotPadding;
    if (this.showScale) x += 25;
    g.beginPath();
    g.lineWidth = lineWidth;
    g.strokeStyle = this.color;

    // eslint-disable-next-line functional/no-loop-statement, functional/no-let
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
    this.buffer = new MutableCircularArray<number>(this.samples);
    this.repaint();
  }

  push(v: number) {
    this.buffer = this.buffer.add(v);
    if (this.paused) return;
    this.repaint();
  }

}