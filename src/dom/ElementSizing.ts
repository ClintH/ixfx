import type { Reactive } from "src/rx/Types.js";
import type { Rect } from "../geometry/rect/RectTypes.js";
import * as Rects from '../geometry/rect/index.js';
import { resizeObservable, windowResize } from "./DomRx.js";
import { resolveEl } from "./ResolveEl.js";
import { getBoundingClientRectWithBorder, getComputedPixels } from "./Css.js";

/**
 * * width: use width of parent, set height based on original aspect ratio of element. Assumes parent has a determined width.
 * * height: use height of parent, set width based on original aspect ratio of element. Assumes parent has a determined height.
 * * both: use height & width of parent, so the element adopts the ratio of the parent. Be sure that parent has a width and height set.
 * * min: use the smallest dimension of parent
 * * max: use the largest dimension of parent
 */
export type ElementResizeLogic = `width` | `height` | `both` | `none` | `min` | `max`;

export type ElementSizerOptions<T extends HTMLElement | SVGElement> = {
  stretch?: ElementResizeLogic
  naturalSize?: Rect
  // el: HTMLElement | string
  containerEl?: HTMLElement | string
  onSetSize: (size: Rect, el: T) => void
}

export class ElementSizer<T extends HTMLElement | SVGElement> {
  #stretch: ElementResizeLogic;
  #size: Rect;
  #naturalSize: Rect;
  #naturalRatio: number;
  #viewport: Rects.RectPositioned;
  #onSetSize;
  #el: T;
  #containerEl: HTMLElement;
  #disposed = false;
  #resizeObservable: Reactive<any> | undefined;

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
      this.#resizeObservable.dispose(`ElementSizing (${ reason })`);
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

  static svgViewport(svg: SVGElement): ElementSizer<SVGElement> {
    const er = new ElementSizer<SVGElement>(svg, {
      containerEl: document.body,
      stretch: `both`,
      onSetSize(size) {
        svg.setAttribute(`width`, size.width.toString());
        svg.setAttribute(`height`, size.height.toString());
      },
    });
    return er;
  }


  #byContainer() {
    const c = this.#containerEl;
    if (!c) throw new Error(`No container element`);

    // Listen for resize
    const r = resizeObservable(c);
    r.onValue((v) => { 
      this.#onParentResize(v); 
    });

    // Get current value
    const current = this.#computeSizeBasedOnParent(c.getBoundingClientRect());
    this.size = current;

    this.#resizeObservable = r;
  }

  #byViewport() {
    const r = windowResize();
    r.onValue(v => {
      this.#onViewportResize();
    });

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

  #computeSizeBasedOnParent(parentSize: Rect) {
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
      width -= (b.borderLeftWidth+b.borderRightWidth);
      height -= (b.borderTopWidth+b.borderBottomWidth);
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

  set size(size: Rect) {
    Rects.guard(size, `size`);
    this.#size = size;
    this.#onSetSize(size, this.#el);
  }

  get size() {
    return this.#size;
  }
}