import { resolveEl } from "./resolve-el.js";
import {  getComputedPixels } from "./css.js";
import {Rects} from "@ixfxfun/geometry";
import type { Rect } from "@ixfxfun/geometry/rect";

/**
 * * width: use width of parent, set height based on original aspect ratio of element. Assumes parent has a determined width.
 * * height: use height of parent, set width based on original aspect ratio of element. Assumes parent has a determined height.
 * * both: use height & width of parent, so the element adopts the ratio of the parent. Be sure that parent has a width and height set.
 * * min: use the smallest dimension of parent
 * * max: use the largest dimension of parent
 */
export type ElementResizeLogic = `width` | `height` | `both` | `none` | `min` | `max`;

/**
 * Options
 */
export type ElementSizerOptions<T extends HTMLElement | SVGElement> = {
  /**
   * @defaultValue 'none'
   */
  stretch?: ElementResizeLogic
  naturalSize?: Rects.Rect
  /**
   * If not specified, the element's parent is used
   */
  containerEl?: HTMLElement | string
  onSetSize: (size: Rects.Rect, el: T) => void
}

/**
 * Consider using static methods:
 * 
 * ```js
 * // Resize an <SVG> element to match viewport
 * Dom.ElementSizer.svgViewport(svg);
 * 
 * // Resize canvas to match its parent
 * Dom.ElementSizer.canvasParent(canvas);
 * 
 * // Resize canvas to match viewport
 * Dom.ElementSizer.canvasViewport(canvas);
 * ```
 */
export class ElementSizer<T extends HTMLElement | SVGElement> {
  #stretch: ElementResizeLogic;
  #size: Rects.Rect;
  #naturalSize: Rects.Rect;
  #naturalRatio: number;
  #viewport: Rects.RectPositioned;
  #onSetSize;
  #el: T;
  #containerEl: HTMLElement;
  #disposed = false;
  #resizeObservable: ResizeObserver | undefined;

  constructor(elOrQuery: T | string, options: ElementSizerOptions<T>) {
    this.#el = resolveEl(elOrQuery);
    this.#containerEl = options.containerEl ? resolveEl(options.containerEl) : this.#el.parentElement!;

    this.#stretch = options.stretch ?? `none`;
    this.#onSetSize = options.onSetSize;
    this.#size = Rects.Empty;

    let naturalSize = options.naturalSize;
    if (naturalSize === undefined) {
      naturalSize = this.#el.getBoundingClientRect();
    }
    this.#naturalRatio = 1;
    this.#naturalSize = naturalSize;
    this.setNaturalSize(naturalSize);
    this.#viewport = Rects.EmptyPositioned;

    if (this.#containerEl === document.body) {
      this.#byViewport();
    } else {
      this.#byContainer();
    }
  }

  dispose(reason?: string) {
    if (this.#disposed) return;
    this.#disposed = true;
    if (this.#resizeObservable) {
      this.#resizeObservable.disconnect();
      this.#resizeObservable = undefined;
    }
  }

  static canvasParent(canvasElementOrQuery: HTMLCanvasElement | string, options: ElementSizerOptions<HTMLCanvasElement>): ElementSizer<HTMLCanvasElement> {
    const el = resolveEl<HTMLCanvasElement>(canvasElementOrQuery);
    const er = new ElementSizer<HTMLCanvasElement>(el, {
      ...options,
      onSetSize(size, el) {
        el.width = size.width;
        el.height = size.height;
        if (options.onSetSize) options.onSetSize(size, el);
      },
    });
    return er;
  }

  static canvasViewport(canvasElementOrQuery: HTMLCanvasElement | string, options: { zIndex?: number } & ElementSizerOptions<HTMLCanvasElement>): ElementSizer<HTMLCanvasElement> {
    const el = resolveEl<HTMLCanvasElement>(canvasElementOrQuery);
    el.style.position = `absolute`;
    el.style.zIndex = (options.zIndex ?? 0).toString();
    el.style.left = `0px`;
    el.style.top = `0px`;
    const opts: ElementSizerOptions<HTMLCanvasElement> = { ...options, containerEl: document.body }
    return this.canvasParent(canvasElementOrQuery, opts);
  }

  /**
   * Size an SVG element to match viewport
   * @param svg 
   * @returns 
   */
  static svgViewport(svg: SVGElement, onSizeSet?: (size: Rects.Rect) => void): ElementSizer<SVGElement> {
    const er = new ElementSizer<SVGElement>(svg, {
      containerEl: document.body,
      stretch: `both`,
      onSetSize(size) {
        svg.setAttribute(`width`, size.width.toString());
        svg.setAttribute(`height`, size.height.toString());
        if (onSizeSet) onSizeSet(size);
      },
    });
    return er;
  }


  #byContainer() {
    const c = this.#containerEl;
    if (!c) throw new Error(`No container element`);

    // Listen for resize
    const r = new ResizeObserver((entries) => {
      this.#onParentResize(entries);
    });
    r.observe(c);
    // Get current value
    const current = this.#computeSizeBasedOnParent(c.getBoundingClientRect());
    this.size = current;

    this.#resizeObservable = r;
  }

  #byViewport() {
    const r = new ResizeObserver((entries) => {
      this.#onViewportResize();
    });
    r.observe(document.documentElement);
    this.#resizeObservable = r;
    this.#onViewportResize();
  }

  #onViewportResize() {
    this.size = { width: window.innerWidth, height: window.innerHeight };
    this.#viewport = {
      x: 0, y: 0,
      ...this.size
    };
  }
  /**
   * Sets the 'natural' size of an element.
   * This can also be specified when creating ElementSizer.
   * @param size 
   */
  setNaturalSize(size: Rect) {
    this.#naturalSize = size;
    this.#naturalRatio = size.width / size.height;
  }

  get naturalSize() {
    return this.#naturalSize;
  }

  get viewport() {
    return this.#viewport;
  }

  #computeSizeBasedOnParent(parentSize: Rects.Rect) {
    let { width, height } = parentSize;

    let stretch = this.#stretch;
    if (stretch === `min`) {
      stretch = width < height ? `width` : `height`;
    } else if (stretch === `max`) {
      stretch = width > height ? `width` : `height`;
    }

    if (stretch === `width`) {
      height = width / this.#naturalRatio;
    } else if (stretch === `height`) {
      width = height * this.#naturalRatio;
    }

    // If we have a border, take that into account
    if (this.#el instanceof HTMLElement) {
      const b = getComputedPixels(this.#el, `borderTopWidth`, `borderLeftWidth`, `borderRightWidth`, `borderBottomWidth`);
      width -= (b.borderLeftWidth + b.borderRightWidth);
      height -= (b.borderTopWidth + b.borderBottomWidth);
    }

    return { width, height };
  }


  #onParentResize(args: Array<ResizeObserverEntry>) {
    const box = args[ 0 ].contentBoxSize[ 0 ];
    const parentSize = { width: box.inlineSize, height: box.blockSize };
    this.size = this.#computeSizeBasedOnParent(parentSize);
    this.#viewport = {
      x: 0, y: 0,
      width: parentSize.width,
      height: parentSize.height
    }
  }

  set size(size: Rects.Rect) {
    Rects.guard(size, `size`);
    this.#size = size;
    this.#onSetSize(size, this.#el);
  }

  get size() {
    return this.#size;
  }
}