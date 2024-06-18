import type { Point } from "src/geometry/point/PointType.js";
import { resolveEl } from "./ResolveEl.js";
import { resizeObservable, windowResize } from "./DomRx.js";

// eslint-disable-next-line unicorn/prevent-abbreviations
export type ElementResizeArgs<V extends HTMLElement | SVGSVGElement> = {
  readonly el: V;
  readonly bounds: {
    readonly width: number;
    readonly height: number;
    readonly center: Point;
    readonly min: number;
    readonly max: number;
  };
};


export const fullSizeElement = <V extends HTMLElement>(
  domQueryOrEl: string | V,
  onResized?: (args: ElementResizeArgs<V>) => void
) => {
  const el = resolveEl<V>(domQueryOrEl);

  const r = windowResize();
  const update = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    el.setAttribute(`width`, width.toString());
    el.setAttribute(`height`, height.toString());

    if (onResized !== undefined) {
      const bounds = {
        min: Math.min(width, height),
        max: Math.max(width, height),
        width,
        height,
        center: {
          x: width / 2,
          y: height / 2,
        },
      };
      onResized({ el, bounds });
    }
  };
  r.onValue(update);

  update();
  return r;
};

/**
 * Sets width/height atributes on the given element according to the size of its parent.
 * @param domQueryOrEl Elememnt to resize
 * @param onResized Callback when resize happens
 * @param timeoutMs Timeout for debouncing events
 * @returns
 */
export const parentSize = <V extends HTMLElement | SVGSVGElement>(
  domQueryOrEl: string | V,
  onResized?: (args: ElementResizeArgs<V>) => void,
  timeoutMs = 100
) => {
  const el = resolveEl<V>(domQueryOrEl);
  const parent = el.parentElement;
  if (parent === null) throw new Error(`Element has no parent`);

  const ro = resizeObservable(parent, timeoutMs).onValue(
    (entries: ReadonlyArray<ResizeObserverEntry>) => {
      const entry = entries.find((v) => v.target === parent);
      if (entry === undefined) return;

      const width = entry.contentRect.width;
      const height = entry.contentRect.height;

      el.setAttribute(`width`, `${ width }px`);
      el.setAttribute(`height`, `${ height }px`);
      if (onResized !== undefined) {
        const bounds = {
          min: Math.min(width, height),
          max: Math.max(width, height),
          width,
          height,
          center: { x: width / 2, y: height / 2 },
        };
        onResized({ el, bounds });
      }
    }
  );

  return ro;
};