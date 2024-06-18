import * as Drawing from "./Drawing.js";
import * as Bipolar from "../data/Bipolar.js";
import * as Queues from "../collections/queue/index.js";
import * as Colour from "./Colour.js";
import { type CirclePositioned } from "../geometry/index.js";
import type { IQueueImmutable } from "../collections/queue/IQueueImmutable.js";

/**
 * Options
 */
export type BipolarViewOptions = Readonly<{
  width?: number,
  height?: number,
  labelPrecision?: number
  labels?: [ string, string ],
  axisColour?: string,
  bgColour?: string,
  whiskerColour?: string,
  whiskerSize?: number,
  dotColour?: string,
  dotRadius?: number,
  showWhiskers?: boolean,
  showDot?: boolean,
  showLabels?: boolean,
  padding?: number,
  labelColour?: string,
  axisWidth?: number,
  asPercentages?: boolean,
  /**
   * If non-zero, will render the last X number of values with increasing opacity.
   * Default: 0
   */
  displayLastValues?: number
  /**
   * If _true_, (default) negative y values are at the bottom.
   * If _false_  negative y values are at the top.
   */
  yAxisBottomNegative?: boolean,
  /**
   * Custom rendering for background
   */
  renderBackground?: Render
}>

function getNumericAttribute(el: HTMLElement, name: string, defaultValue: number) {
  const a = el.getAttribute(name);
  if (a === null) return defaultValue;
  return Number.parseInt(a);
}

export type Render = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
/**
 * A function that plots a point on the graph
 */
export type BipolarView = (x: number, y: number) => void;

/**
 * Initialises a plotter for bipolar values (-1...1)
 * 
 * ```js
 * const p = BipolarView.init(`#my-canvas`);
 * // Shows the dot at 1, 0.5
 * p(1, 0.5);
 * ```
 * @param elementQuery 
 * @param opts 
 * @returns 
 */
export const init = (elementQuery: string, opts: BipolarViewOptions = {}): BipolarView => {
  const element = document.querySelector<HTMLCanvasElement>(elementQuery);
  if (!element) throw new Error(`Element query could not be found (${ elementQuery })`);
  const labels = opts.labels ?? [ `x`, `y` ];
  const labelPrecision = opts.labelPrecision ?? 2;
  const asPercentages = opts.asPercentages ?? false;
  const displayLastValues = opts.displayLastValues ?? 0;
  // Flags
  const showWhiskers = opts.showWhiskers ?? true;
  const showDot = opts.showDot ?? true;
  const showLabels = opts.showLabels ?? true;
  const yAxisBottomNegative = opts.yAxisBottomNegative ?? true;
  // Colours
  const axisColour = Colour.resolveToString(opts.axisColour, `silver`);
  const bgColour = Colour.resolveToString(opts.bgColour, `white`);
  const whiskerColour = Colour.resolveToString(opts.whiskerColour, `black`);
  const dotColour = Colour.resolveToString(opts.dotColour, opts.whiskerColour, `black`);
  const labelColour = Colour.resolveToString(opts.labelColour, opts.axisColour, `silver`);

  // Sizes
  const axisWidth = (opts.axisWidth ?? 1 * window.devicePixelRatio);
  const dotRadius = (opts.dotRadius ?? 5 * window.devicePixelRatio);
  const pad = (opts.padding ?? 10 * window.devicePixelRatio);
  const whiskerSize = (opts.whiskerSize ?? 5 * window.devicePixelRatio);
  const width = (opts.width ?? getNumericAttribute(element, `width`, 200) * window.devicePixelRatio);
  const height = (opts.height ?? getNumericAttribute(element, `height`, 200) * window.devicePixelRatio);

  let lastValues: IQueueImmutable<CirclePositioned> | undefined;
  if (displayLastValues > 0) {
    lastValues = Queues.immutable<CirclePositioned>({
      capacity: displayLastValues,
      discardPolicy: `older`
    });
  }

  element.width = width;// * window.devicePixelRatio;
  element.height = height;// * window.devicePixelRatio;
  element.style.width = `${ (width / window.devicePixelRatio) }px`;
  element.style.height = `${ (height / window.devicePixelRatio) }px`;

  const midY = height / 2;
  const midX = width / 2;
  const ctx = element.getContext(`2d`);
  if (!ctx) throw new Error(`Could not create drawing context`);

  if (window.devicePixelRatio >= 2) {
    ctx.font = `20px sans-serif`;
  }
  const percentageFormat = (v: number) => `${ Math.round(v * 100) }%`;
  const fixedFormat = (v: number) => v.toFixed(labelPrecision);

  const valueFormat = asPercentages ? percentageFormat : fixedFormat;
  if (showLabels) {
    labels[ 0 ] = labels[ 0 ] + `:`;
    labels[ 1 ] = labels[ 1 ] + `:`;
  } else {
    labels[ 0 ] = ``;
    labels[ 1 ] = ``;
  }

  const renderBackground: Render = opts.renderBackground ?? ((ctx, width, height): void => {
    if (opts.bgColour === `transparent`) {
      ctx.clearRect(0, 0, width, height);
    } else {
      ctx.fillStyle = bgColour;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return (x: number, y: number) => {
    x = Bipolar.clamp(x);
    y = Bipolar.clamp(y);

    renderBackground(ctx, width, height);

    // Labels
    ctx.fillStyle = labelColour;
    ctx.textBaseline = `top`;
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText((labels[ 1 ] + ` ` + valueFormat(y)).trim(), -midX + pad, 1);
    ctx.restore();
    ctx.fillText((labels[ 0 ] + ` ` + valueFormat(x)).trim(), pad, midX + 2);

    if (!yAxisBottomNegative) y *= -1;

    // Axes
    ctx.strokeStyle = axisColour;
    ctx.lineWidth = axisWidth;
    ctx.beginPath();
    ctx.moveTo(pad, midY);
    ctx.lineTo(width - pad, midY);
    ctx.moveTo(midX, pad);
    ctx.lineTo(midX, height - pad);
    ctx.stroke();
    ctx.closePath();

    const yy = (height - pad - pad) / 2 * -y;
    const xx = (width - pad - pad) / 2 * x;
    const dotPos = { x: xx, y: yy, radius: dotRadius };

    if (lastValues) {
      lastValues = lastValues.enqueue(dotPos);
    }
    ctx.save();
    ctx.translate(midX, midY);

    // Dot
    if (showDot) {
      if (lastValues) {
        const opacityStep = 1 / lastValues.length;
        let opacity = 1;
        // eslint-disable-next-line unicorn/no-array-for-each
        lastValues.forEach(d => {
          const colour = Colour.opacity(dotColour, opacity);
          Drawing.circle(ctx, d, { fillStyle: colour });
          opacity -= opacityStep;
        });
      } else {
        Drawing.circle(ctx, dotPos, { fillStyle: dotColour });
      }
    }

    // Whiskers
    if (showWhiskers) {
      ctx.strokeStyle = whiskerColour;

      // y line
      ctx.beginPath();
      ctx.moveTo(0, yy - whiskerSize);
      ctx.lineTo(0, yy + whiskerSize);

      // x line
      ctx.moveTo(xx - whiskerSize, 0);
      ctx.lineTo(xx + whiskerSize, 0);
      ctx.stroke();
      ctx.closePath();
    }

    // Restore transform
    ctx.restore();
  }
}
