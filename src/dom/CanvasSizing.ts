import { resizeObservable, windowResize } from "./DomRx.js";
import type { ElementResizeArgs as ElementResizeArguments } from "./ElementSizing.js";
import { resolveEl } from "./ResolveEl.js";

// eslint-disable-next-line unicorn/prevent-abbreviations
export type CanvasResizeArgs = ElementResizeArguments<HTMLCanvasElement> & {
  readonly ctx: CanvasRenderingContext2D;
};


/**
 * Resizes given canvas to its parent element.
 * To resize canvas to match the viewport, use {@link fullSizeCanvas}.
 *
 * Provide a callback for when resize happens.
 * @param domQueryOrEl Query string or reference to canvas element
 * @param onResized Callback for when resize happens, eg for redrawing canvas
 * @returns Observable
 */
export const parentSizeCanvas = (
  domQueryOrEl: Readonly<string | HTMLCanvasElement>,
  onResized?: (args: CanvasResizeArgs) => void,
  timeoutMs = 100
) => {
  const el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
  if (el.nodeName !== `CANVAS`) {
    throw new Error(
      `Expected HTML element with node name CANVAS, not ${ el.nodeName }`
    );
  }
  const parent = el.parentElement;
  if (parent === null) throw new Error(`Element has no parent`);

  const ctx = (el).getContext(`2d`);
  if (ctx === null) throw new Error(`Could not create drawing context`);

  //const safetyMargin = 4;

  el.style.width = `100%`;
  el.style.height = `100%`;


  const ro = resizeObservable(parent, timeoutMs).value(
    entries => {
      const entry = entries.find((v) => v.target === parent);
      if (entry === undefined) return;

      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      //console.log(`contentH: ${e.contentRect.height} current: ${el.getBoundingClientRect().height}`);

      // el.setAttribute(`width`, width-safetyMargin + `px`);
      // el.setAttribute(`height`, height-safetyMargin + `px`);
      el.setAttribute(`width`, el.offsetWidth + `px`);
      el.setAttribute(`height`, el.offsetHeight + `px`);

      if (onResized !== undefined) {
        const bounds = {
          min: Math.min(width, height),
          max: Math.max(width, height),
          width,
          height,
          center: { x: width / 2, y: height / 2 },
        };
        onResized({ ctx, el, bounds });
      }
    }
  );

  return ro;
};


/**
 * Resizes given canvas element to match window size.
 * To resize canvas to match its parent, use {@link parentSizeCanvas}.
 *
 * To make the canvas appear propery, it sets the following CSS:
 * ```css
 * {
 *  top: 0;
 *  left: 0;
 *  zIndex: -1;
 *  position: fixed;
 * }
 * ```
 * Pass _true_ for `skipCss` to avoid this.
 *
 * Provide a callback for when resize happens.
 * @param domQueryOrEl Query string or reference to canvas element
 * @param onResized Callback for when resize happens, eg for redrawing canvas
 * @param skipCss if true, style are not added
 * @returns Observable
 */
export const fullSizeCanvas = (
  domQueryOrEl: Readonly<string | HTMLCanvasElement | undefined | null>,
  onResized?: (args: CanvasResizeArgs) => void,
  skipCss = false
) => {
  if (domQueryOrEl === null || domQueryOrEl === undefined) {
    throw new Error(`domQueryOrEl is null or undefined`);
  }
  const el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
  if (el.nodeName !== `CANVAS`) {
    throw new Error(
      `Expected HTML element with node name CANVAS, not ${ el.nodeName }`
    );
  }
  const ctx = el.getContext(`2d`);
  if (ctx === null) throw new Error(`Could not create drawing context`);

  const update = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    el.width = width;
    el.height = height;

    if (onResized !== undefined) {
      const bounds = {
        min: Math.min(width, height),
        max: Math.max(width, height),
        width,
        height,
        center: { x: width / 2, y: height / 2 },
      };
      onResized({ ctx, el, bounds });
    }
  };

  // Setup
  if (!skipCss) {
    el.style.top = `0`;
    el.style.left = `0`;
    el.style.zIndex = `-100`;
    el.style.position = `fixed`;
  }

  const r = windowResize();
  r.value(update);

  update();
  return r;
};
