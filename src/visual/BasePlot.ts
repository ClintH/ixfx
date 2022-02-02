
export class BasePlot {
  canvasEl: HTMLCanvasElement;
  precision: number;
  paused: boolean;
  scaleMin: number;
  scaleMax: number;
  allowScaleDeflation: boolean;
  labelInset: number;
  lastPaint: number;
  maxPaintMs: number;
  textHeight: number;
  plotPadding = 10;
  showMiddle = true;
  showScale = true;
  drawLoop: () => void;

  constructor(canvasEl: HTMLCanvasElement) {
    if (canvasEl === undefined) throw Error(`canvasEl undefined`);
    this.canvasEl = canvasEl;
    this.drawLoop = this.baseDraw.bind(this);
    this.precision = 3;
    this.paused = false;
    this.allowScaleDeflation = false;
    this.scaleMin = Number.MAX_SAFE_INTEGER;
    this.scaleMax = Number.MIN_SAFE_INTEGER;
    this.labelInset = 5;

    this.lastPaint = 0;
    this.maxPaintMs = 10; // Don't trigger paint within 10ms

    canvasEl.addEventListener(`pointerup`, () => {
      this.paused = !this.paused;
      if (this.paused) {
        canvasEl.classList.add(`paused`);
      } else {
        canvasEl.classList.remove(`paused`);
      }
    });
    const measure = this.canvasEl.getContext(`2d`)?.measureText(`Xy`);
    if (measure === undefined) this.textHeight = 20;
    else this.textHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
  }

  pushScale(min: number, max: number) {
    if (min > this.scaleMin && this.allowScaleDeflation) this.scaleMin = min;
    else this.scaleMin = Math.min(min, this.scaleMin);

    if (max < this.scaleMax && this.allowScaleDeflation) this.scaleMax = max;
    else this.scaleMax = Math.max(max, this.scaleMax);
    const range = this.scaleMax - this.scaleMin;
    return range;
  }

  map(value: number, x1: number, y1: number, x2: number, y2: number) {
    return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
  }

  scaleNumber(v: number): string {
    if (Math.abs(v) > 50) return Math.floor(v).toString();
    return v.toFixed(this.precision);
  }

  drawScale(g: CanvasRenderingContext2D, min: number, max: number, avg: number, range: number, plotWidth: number, plotHeight: number) {
    if (!this.showScale) return;
    const labelInset = this.labelInset;
    const textHalf = this.textHeight / 3;
    const rightJustif = plotWidth - 40;

    g.fillStyle = `black`;

    const bottomY = this.plotPadding + plotHeight + textHalf;
    const middleY = this.plotPadding + (plotHeight / 2) + textHalf;
    const topY = this.plotPadding + textHalf;

    // Scale
    g.fillText(this.scaleNumber(this.scaleMin), labelInset, bottomY);
    g.fillText(this.scaleNumber(((range / 2) + this.scaleMin)), labelInset, middleY);
    g.fillText(this.scaleNumber(this.scaleMax), labelInset, topY);

    // Live
    g.fillText(this.scaleNumber(min), rightJustif, bottomY);
    g.fillText(`Avg: ${this.scaleNumber(avg)}`, rightJustif, middleY);
    g.fillText(this.scaleNumber(max), rightJustif, topY);
  }

  baseDraw() {
    const c = this.canvasEl;
    const g = c.getContext(`2d`);
    if (g === null) return;
    const canvasHeight = c.height;
    const canvasWidth = c.width;

    const plotHeight = canvasHeight - this.plotPadding - this.plotPadding;
    const plotWidth = canvasWidth - this.plotPadding - this.plotPadding;

    // Clear background
    g.fillStyle = `white`;
    g.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw middle line
    if (this.showMiddle) {
      g.lineWidth = 2;
      g.beginPath();
      g.strokeStyle = `whitesmoke`;
      g.moveTo(this.plotPadding, plotHeight / 2 + this.plotPadding);
      g.lineTo(plotWidth, plotHeight / 2 + this.plotPadding);
      g.stroke();
    }

    // Get subclass to draw
    this.draw(g, plotWidth, plotHeight);

    this.lastPaint = performance.now();
  }

  // eslint-disable-next-line
  draw(g: CanvasRenderingContext2D, plotWidth: number, plotHeight: number) {}

  repaint() {
    if (this.paused) return;

    const elapsed = performance.now() - this.lastPaint;
    if (elapsed >= this.maxPaintMs) {
      window.requestAnimationFrame(this.drawLoop);
    }
  }

}