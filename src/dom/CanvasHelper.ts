import { resolveEl } from "./ResolveEl.js";
import { Rects, Scaler } from '../geometry/index.js';
import { type Rect } from '../geometry/rect/index.js';
import { multiply as RectsMultiply } from "../geometry/rect/index.js";
import { windowResize } from "./DomRx.js";
import type { ScaleBy } from "../geometry/Scaler.js";

// export type CanvasHelper = {
//   readonly size: Rect,
//   readonly width: number,
//   readonly height: number,
//   readonly ctx: CanvasRenderingContext2D,
//   readonly abs: Scaler.Scaler,
//   readonly rel: Scaler.Scaler
//   clear: () => void
// }

export type CanvasOpts = {
  /**
   * If true, it won't add any position CSS
   */
  readonly skipCss: boolean;
  //readonly fullSize: boolean;
  readonly scaleBy: ScaleBy;
  readonly onResize?: (size: Rect) => void
  /**
   * Automatically set canvas to fill.
   * * viewport: size of screen
   * * parent: size of parent element
   * * none: no resizing
   * 
   */
  readonly fill: `viewport` | `parent` | `none`
  readonly width: number
  readonly height: number
  readonly draw?: (ctx: CanvasRenderingContext2D, size: Rect) => void
};

/**
 * Creates a 'helper' that scales the canvas for high-DPI displays
 * and automatically sizes it to fill the parent container (by default).
 * 
 * If 'fill' is set to 'viewport' it will additionally set position
 * CSS properties on the canvas
 * @param domQueryOrEl 
 * @param opts 
 * @returns 
 */
export class CanvasHelper {

  readonly el: HTMLCanvasElement;
  readonly opts: CanvasOpts

  //#desiredSize: Rect | undefined;
  #scaler: Scaler.ScalerCombined;
  #currentSize: Rect = Rects.empty;
  #ctx: CanvasRenderingContext2D | undefined;

  #getContext(reset = false) {
    if (this.#ctx === undefined || reset) {
      const ratio = window.devicePixelRatio || 1;
      const c = this.el.getContext(`2d`);
      if (c === null) throw new Error(`Could not create drawing context`);
      this.#ctx = c;
      // Reset scale
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.scale(ratio, ratio);
    }
    return this.#ctx;
  };

  get abs() {
    return this.#scaler.abs;
  }

  get rel() {
    return this.#scaler.rel;
  }

  // Sets dimensions of canvas to be rect
  updateDimensions(rect: Rect) {
    const ratio = window.devicePixelRatio || 1;

    // Create a new scaler
    this.#scaler = Scaler.scaler(this.opts.scaleBy, rect);
    console.log(`Created scaler`);
    const pixelScaled = RectsMultiply(rect, ratio, ratio);

    this.el.width = pixelScaled.width;
    this.el.height = pixelScaled.height;
    this.el.style.width = rect.width + `px`;
    this.el.style.height = rect.height + `px`;

    this.#getContext(true);
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.#currentSize = rect;
    const r = this.opts.onResize;
    if (r) {
      setTimeout(() => { r(this.size) }, 100);
    }
  }

  constructor(domQueryOrEl: Readonly<string | HTMLCanvasElement | undefined | null>, opts: Partial<CanvasOpts> = {}) {
    if (!domQueryOrEl) throw new Error(`Param 'domQueryOrEl' is null or undefined`);
    this.el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
    if (this.el.nodeName !== `CANVAS`) {
      throw new Error(`Expected CANVAS HTML element. Got: ${ this.el.nodeName }`);
    }

    // const skipCss = opts.skipCss;
    // const fill = opts.fill ?? `none`;
    // const scaleBy = opts.scaleBy ?? `both`;
    // const desiredWidth = opts.width ?? -1;
    // const desiredHeight = opts.height ?? -1;
    // this.#currentSize = Rects.empty;

    this.opts = {
      fill: opts.fill ?? `none`,
      height: opts.height ?? -1,
      width: opts.width ?? -1,
      scaleBy: opts.scaleBy ?? `both`,
      onResize: opts.onResize,
      draw: opts.draw,
      skipCss: opts.skipCss ?? false
    }

    this.#scaler = Scaler.scaler(`both`);

    this.#init();
  }

  #onParentResize() {
    const parentEl = this.el.parentElement;
    if (!parentEl) return;
    const bounds = parentEl.getBoundingClientRect();
    this.updateDimensions({ width: bounds.width, height: bounds.height });
  }

  #onWindowResize() {
    this.updateDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  #init() {
    switch (this.opts.fill) {
      case `viewport`: {
        if (!this.opts.skipCss) {
          this.el.style.position = `absolute`;
          this.el.style.left = `0px`;
          this.el.style.top = `0px`;
          this.el.style.zIndex = `-1`;
        }
        const r = windowResize();
        r.value(() => { this.#onWindowResize() });

        this.#onWindowResize();
        break;
      }
      case `parent`: {
        const parentEl = this.el.parentElement;
        if (!parentEl) throw new Error(`Canvas element has no parent?!`);
        if (!this.opts.skipCss) {
          this.el.style.position = `relative`;
          this.el.style.left = `0px`;
          this.el.style.top = `0px`;
        }
        // const r = resizeObservable(parentEl);
        // r.value(onParentResize);
        const r = windowResize();
        r.value(() => { this.#onParentResize() });
        this.#onParentResize();
        break;
      }
      case `none`: {
        // Use current size
        const bounds = this.el.getBoundingClientRect();
        const desiredSize = { width: bounds.width, height: bounds.height };
        this.updateDimensions(desiredSize);
        break;
      }
      default: {
        throw new Error(`Unknown 'fill' value. Expecting 'viewport' or 'fill'`);
      }
    }

    const d = this.opts.draw;
    if (d) {
      const sched = () => {
        d(this.ctx, this.#currentSize);
        requestAnimationFrame(sched);
      }
      setTimeout(() => { sched() }, 100);
    }
  }

  clear() {
    if (this.#ctx) {
      this.#ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  get ctx() {
    if (this.#ctx === undefined) throw new Error(`Context not available`);
    return this.#getContext();
  }

  get width() {
    return this.#currentSize.width;
  }

  get height() {
    return this.#currentSize.height;
  }

  get size() {
    return this.#currentSize;
  }
}