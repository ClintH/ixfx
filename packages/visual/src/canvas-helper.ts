import { ElementSizer, resolveEl, type ElementResizeLogic, type ElementSizerOptions } from '@ixfx/dom';
import { SimpleEventEmitter } from '@ixfx/events';
import type { ScaleBy, ScalerCombined } from '@ixfx/geometry';
import type { Rect, RectPositioned } from '@ixfx/geometry/rect';
import { Rects, scaler } from '@ixfx/geometry';
import * as Drawing from './drawing.js';
import * as ImageDataGrid from './image-data-grid.js';
import { cloneFromFields } from '@ixfx/core/records';
import type { Grid } from '@ixfx/geometry/grid';
import type { DrawingHelper } from './types.js';

export type CanvasEvents = {
  /**
   * Fired when canvas is resized
   */
  resize: { size: Rect, helper: CanvasHelper, ctx: CanvasRenderingContext2D }

  resized: { size: Rect, helper: CanvasHelper, ctx: CanvasRenderingContext2D }
  /**
   * Pointerdown. 
   * 
   * Adds logicalX/Y to get logical pixel coordinate
   */
  pointerdown: PointerEvent & { physicalX: number, physicalY: number },
  /**
 * Pointerup. 
 * 
 * Adds logicalX/Y to get logical pixel coordinate
 */
  pointerup: PointerEvent & { physicalX: number, physicalY: number },
  /**
 * Pointermove 
 * 
 * Adds logicalX/Y to get logical pixel coordinate
 */
  pointermove: PointerEvent & { physicalX: number, physicalY: number },
}


/**
 * CanvasHelper options
 */
export type CanvasHelperOptions = Readonly<{
  containerEl?: HTMLElement
  /**
   * Automatic canvas resizing logic.
   */
  resizeLogic?: ElementResizeLogic
  /**
   * By default, the helper emits pointer events from the canvas.
   * Set this to _true_ to disable.
   */
  disablePointerEvents: boolean
  /**
   * By default the display DPI is used for scaling.
   * If this is set, this will override.
   */
  pixelZoom: number
  /**
   * If _true_ (default) canvas is cleared when a resize happens
   */
  clearOnResize: boolean
  /**
   * If true, it won't add any position CSS
   */
  skipCss: boolean;
  coordinateScale: ScaleBy;
  /**
   * Callback when canvas is resized
   * @param size 
   * @returns 
   */
  onResizing?: (ctx: CanvasRenderingContext2D, size: Rect, helper: CanvasHelper) => void
  onResized?: (ctx: CanvasRenderingContext2D, size: Rect, helper: CanvasHelper) => void
  /**
   * Logical width of canvas.
   * This is used for establishing the desired aspect ratio.
   */
  width: number
  /**
   * Logical height of canvas.
   * This is used for establishing the desired aspect ratio.
   */
  height: number
  /**
   * If set, the z-index for this canvas.
   * By default, fullscreen canvas will be given -1
   */
  zIndex: number
  /**
   * Colour space to use. Defaults to sRGB.
   */
  colourSpace: PredefinedColorSpace;

  /**
   * If specified, this function be called in an animation loop.
   * @param ctx Drawing context
   * @param size Viewport size
   * @param helper CanvasHelper instance
   * @returns 
   */
  draw?: (ctx: CanvasRenderingContext2D, size: Rect, helper: CanvasHelper) => void
}>;


/**
 * A wrapper for the CANVAS element that scales the canvas for high-DPI displays
 * and helps with resizing.
 * 
 * ```js
 * const canvas = new CanvasHelper(`#my-canvas`, { resizeLogic: `both` });
 * const { ctx, width, height } = canvas.ctx; // Get drawing context, width & height
 * ```
 * 
 * Draw whenever it is resized using the 'resize' event
 * ```js
 * canvas.addEventListener(`resize`, ({ctx, size}) => {
 *  // Use ctx...  
 * });
 * ```
 * 
 * Or provide a function when initialising:
 * ```js
 * const onResize = (ctx, size) => {
 *  // Do drawing
 * }
 * const canvas = new CanvasHelper(`#my-canvas`, { resizeLogic: `both`, onResize });
 * ```
 * 
 * Automatically draw at animation speeds:
 * ```js
 * const draw = () => {
 * }
 * const canvas = new CanvasHelper(`#my-canvas`, { resizeLogic: `both`, draw });
 * ```
 */
export class CanvasHelper extends SimpleEventEmitter<CanvasEvents> {
  readonly el: HTMLCanvasElement;
  readonly opts: CanvasHelperOptions

  #scaler: ScalerCombined;
  #scalerSize: ScalerCombined;
  #viewport: RectPositioned = Rects.EmptyPositioned;
  #logicalSize: Rect = Rects.Empty;
  #ctx: CanvasRenderingContext2D | undefined;
  #drawHelper: DrawingHelper | undefined;
  #resizer: ElementSizer<HTMLCanvasElement> | undefined;
  #disposed = false;

  constructor(domQueryOrEl: Readonly<string | HTMLCanvasElement | undefined | null>, opts: Partial<CanvasHelperOptions> = {}) {
    super();
    if (!domQueryOrEl) throw new Error(`Param 'domQueryOrEl' is null or undefined`);
    this.el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
    if (this.el.nodeName !== `CANVAS`) {
      throw new Error(`Expected CANVAS HTML element. Got: ${ this.el.nodeName }`);
    }

    const size = this.el.getBoundingClientRect();
    this.opts = {
      resizeLogic: opts.resizeLogic ?? `none`,
      disablePointerEvents: opts.disablePointerEvents ?? false,
      pixelZoom: opts.pixelZoom ?? (window.devicePixelRatio || 1),
      height: opts.height ?? size.height,
      width: opts.width ?? size.width,
      zIndex: opts.zIndex ?? -1,
      coordinateScale: opts.coordinateScale ?? `both`,
      onResizing: opts.onResizing,
      onResized: opts.onResized,
      clearOnResize: opts.clearOnResize ?? true,
      draw: opts.draw,
      skipCss: opts.skipCss ?? false,
      colourSpace: `srgb`
    }

    this.#scaler = scaler(`both`);
    this.#scalerSize = scaler(`both`, size);
    this.#init();
  }

  getRectangle(): RectPositioned {
    return {
      x: 0, y: 0,
      ...this.#logicalSize
    }
  }
  dispose(reason?: string) {
    if (this.#disposed) return;
    this.#disposed = true;
    if (this.#resizer) {
      this.#resizer.dispose(`CanvasHelper disposing ${ reason }`.trim());
      this.#resizer = undefined;
    }
  }

  #getContext(reset = false) {
    if (this.#ctx === undefined || reset) {
      const ratio = this.ratio;
      const c = this.el.getContext(`2d`);
      if (c === null) throw new Error(`Could not create drawing context`);
      this.#ctx = c;
      // Reset scale
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.scale(ratio, ratio);
    }
    return this.#ctx;
  };

  /**
   * Gets the drawable area of the canvas.
   * This accounts for scaling due to high-DPI displays etc.
   * @returns 
   */
  getPhysicalSize() {
    return {
      width: this.width * this.ratio,
      height: this.height * this.ratio
    }
  }

  /**
   * Creates a drawing helper for the canvas.
   * If one is already created it is reused.
   */
  getDrawHelper() {
    if (!this.#drawHelper) {
      this.#drawHelper = Drawing.makeHelper(this.#getContext(), {
        width: this.width, height: this.height
      });
    }
  }

  setLogicalSize(logicalSize: Rect) {
    Rects.guard(logicalSize, `logicalSize`);
    const logicalSizeInteger = Rects.applyFields(v => Math.floor(v), logicalSize);
    const ratio = this.opts.pixelZoom;

    // Scaler for going between relative and logical units
    this.#scaler = scaler(this.opts.coordinateScale, logicalSize);
    this.#scalerSize = scaler(`both`, logicalSize);

    // Scaled logical size for DPI
    const pixelScaled = Rects.multiplyScalar(logicalSize, ratio);

    // Canvas will actually be much larger, based on DPI
    this.el.width = pixelScaled.width;
    this.el.height = pixelScaled.height;

    // But scaled down on screen
    this.el.style.width = logicalSizeInteger.width.toString() + `px`;
    this.el.style.height = logicalSizeInteger.height.toString() + `px`;

    // Since dimensions have change, reset context
    this.#getContext(true);

    if (this.opts.clearOnResize) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    this.#logicalSize = logicalSizeInteger;

    //console.log(`setting logical size to ${ this.#logicalSize.width }x${ this.#logicalSize.height }`);

    // Notify listeners of resize
    // const r = this.opts.onResizing;
    // if (r) {
    //   setTimeout(() => { r(this.ctx, this.size, this) }, 100);
    // }
    if (this.opts.onResizing) {
      this.opts.onResizing(this.ctx, this.size, this);
    }
    this.fireEvent(`resize`, { ctx: this.ctx, size: this.#logicalSize, helper: this });
  }


  #init() {
    //console.log(`init`, this.opts);

    // If there is a 'draw' callback, set up an animation loop
    const d = this.opts.draw;
    if (d) {
      const sched = () => {
        d(this.ctx, this.#logicalSize, this);
        requestAnimationFrame(sched);
      }
      setTimeout(() => { sched() }, 100);
    }

    if (!this.opts.disablePointerEvents) {
      this.#handleEvents();
    }

    const resizeLogic = this.opts.resizeLogic ?? `none`;
    if (resizeLogic === `none`) {
      this.setLogicalSize({ width: this.opts.width, height: this.opts.height });
    } else {
      const containerEl = this.opts.containerEl ?? this.el.parentElement;
      const resizerOptions: ElementSizerOptions<HTMLCanvasElement> = {
        onSizeChanging: (size) => {
          if (Rects.isEqual(this.#logicalSize, size)) return;
          this.setLogicalSize(size);
        },
        onSizeDone: (size, el) => {
          this.#onResizeDone(size);
        },
        containerEl,
        naturalSize: { width: this.opts.width, height: this.opts.height },
        stretch: this.opts.resizeLogic ?? `none`
      };
      this.#resizer = new ElementSizer(this.el, resizerOptions);
    }

    this.#getContext();
  }

  #onResizeDone(size: Rect) {
    if (this.opts.onResized) this.opts.onResized(this.ctx, this.size, this);
    this.fireEvent(`resized`, { ctx: this.ctx, size: this.#logicalSize, helper: this });
  }

  #handleEvents() {
    const handlePointerEvent = (event: PointerEvent) => {
      const { offsetX, offsetY } = event;
      const physicalX = offsetX * this.ratio;
      const physicalY = offsetY * this.ratio;
      event = cloneFromFields(event);
      const eventData = {
        physicalX, physicalY,
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...event
      };

      switch (event.type) {
        case `pointerup`: {
          {
            this.fireEvent(`pointerup`, eventData);
            break;
          };
        }
        case `pointermove`: {
          {
            this.fireEvent(`pointermove`, eventData);
            break;
          };
        }
        case `pointerdown`: {
          {
            this.fireEvent(`pointerup`, eventData);
            break;
          };
        }
      };
    }

    this.el.addEventListener(`pointermove`, handlePointerEvent);
    this.el.addEventListener(`pointerdown`, handlePointerEvent);
    this.el.addEventListener(`pointerup`, handlePointerEvent);
  }

  /**
   * Clears the canvas.
   * 
   * Shortcut for:
   * `ctx.clearRect(0, 0, this.width, this.height)`
   */
  clear() {
    if (!this.#ctx) return;
    this.#ctx.clearRect(0, 0, this.width, this.height);

  }

  /**
   * Fills the canvas with a given colour.
   * 
   * Shortcut for:
   * ```js
      * ctx.fillStyle = ``;
   * ctx.fillRect(0, 0, this.width, this.height);
   * ```
   * @param colour Colour
   */
  fill(colour?: string) {
    if (!this.#ctx) return;
    if (colour) this.#ctx.fillStyle = colour;
    this.#ctx.fillRect(0, 0, this.width, this.height);

  }
  /**
   * Gets the drawing context
   */
  get ctx() {
    if (this.#ctx === undefined) throw new Error(`Context not available`);
    return this.#getContext();
  }

  get viewport() {
    return this.#viewport;
  }

  /**
   * Gets the logical width of the canvas
   * See also: {@link height}, {@link size}
   */
  get width() {
    return this.#logicalSize.width;
  }

  /**
   * Gets the logical height of the canvas
   * See also: {@link width}, {@link size}
   */
  get height() {
    return this.#logicalSize.height;
  }

  /**
   * Gets the logical size of the canvas
   * See also: {@link width}, {@link height}
   */
  get size() {
    return this.#logicalSize;
  }

  /**
   * Gets the current scaling ratio being used
   * to compensate for high-DPI display
   */
  get ratio() {
    return window.devicePixelRatio || 1;
  }

  /**
   * Returns the width or height, whichever is smallest
   */
  get dimensionMin() {
    return Math.min(this.width, this.height);
  }

  /**
   * Returns the width or height, whichever is largest
   */
  get dimensionMax() {
    return Math.max(this.width, this.height);
  }



  drawBounds(strokeStyle = `green`) {
    const ctx = this.#getContext();
    Drawing.rect(ctx,
      { x: 0, y: 0, width: this.width, height: this.height },
      { crossed: true, strokeStyle, strokeWidth: 1 });

    Drawing.rect(ctx, this.#viewport, { crossed: true, strokeStyle: `silver`, strokeWidth: 3 })
  }

  /**
   * Returns a Scaler that converts from absolute
   * to relative coordinates.
   * This is based on the canvas size.
   * 
   * ```js
      * // Assuming a canvas of 800x500
   * toRelative({ x: 800, y: 600 });  // { x: 1,   y: 1 }
   * toRelative({ x: 0, y: 0 });   // { x: 0,   y: 0 }
   * toRelative({ x: 400, y: 300 }); // { x: 0.5, y: 0.5 }
   * ```
   */
  get toRelative() {
    return this.#scaler.rel;
  }

  /**
   * Returns a scaler for points based on width & height
   */
  get toAbsoluteFixed() {
    return this.#scalerSize.abs
  }

  /**
   * Returns a scaler for points based on width & height
   */
  get toRelativeFixed() {
    return this.#scalerSize.rel;
  }

  get logicalCenter() {
    return {
      x: this.#logicalSize.width / 2,
      y: this.#logicalSize.height / 2
    }
  }

  /**
 * Returns a Scaler that converts from relative to absolute
 * coordinates.
 * This is based on the canvas size.
 * 
 * ```js
 * // Assuming a canvas of 800x600
 * toAbsolute({ x: 1, y: 1 });      // { x: 800, y: 600}
 * toAbsolute({ x: 0, y: 0 });      // { x: 0, y: 0}
 * toAbsolute({ x: 0.5, y: 0.5 });  // { x: 400, y: 300}
 * ```
 */
  get toAbsolute() {
    return this.#scaler.abs;
  }

  /**
   * Gets the center coordinate of the canvas
   */
  get center() {
    return { x: this.width / 2, y: this.height / 2 }
  }

  /**
   * Gets the image data for the canvas.
   * Uses the 'physical' canvas size. Eg. A logical size of 400x400 might be
   * 536x536 with a high-DPI display.
   * @returns 
   */
  getImageData(): ImageData {
    const size = this.getPhysicalSize();
    const data = this.ctx.getImageData(0, 0, size.width, size.height, { colorSpace: this.opts.colourSpace });

    if (data === null || data === undefined) throw new Error(`Could not get image data from context`);
    return data;
  }

  /**
   * Returns the canvas frame data as a writable grid.
   * When editing, make as many edits as needed before calling
   * `flip`, which writes buffer back to the canvas.
   * ```js
      * const g = helper.getWritableBuffer();
   * // Get {r,g,b,opacity} of pixel 10,10
   * const pixel = g.get({ x: 10, y: 10 });
   * 
   * // Set a colour to pixel 10,10
   * g.set({ r: 0.5, g: 1, b: 0, opacity: 0 }, { x: 10, y: 10 });
   * 
   * // Write buffer to canvas
   * g.flip();
   * ```
   * 
   * Uses 'physical' size of canvas. Eg with a high-DPI screen, this will
   * mean a higher number of rows and columns compared to the logical size.
   * @returns
   */
  getWritableBuffer() {
    const ctx = this.ctx;
    const data = this.getImageData();
    const grid = ImageDataGrid.grid(data);
    const get = ImageDataGrid.accessor(data);
    const set = ImageDataGrid.setter(data);

    const flip = () => {
      ctx.putImageData(data, 0, 0);
    }

    return { grid, get, set, flip };
  }
}

// export const imageDataAsGrid = (canvas: HTMLCanvasElement, colorSpace: PredefinedColorSpace = `srgb`) => {
//   const ctx = canvas.getContext(`2d`);
//   if (!ctx) throw new Error(`Could not create context`);

//   const data = ctx.getImageData(0, 0, canvas.width, canvas.height, { colorSpace });
//   if (!data) throw new Error(`Could not get image data from context`);

//   const get = ImageDataGrid.accessor(data);
//   const set = ImageDataGrid.setter(data);
// }