import type { Interval } from "@ixfx/core";
import { observable } from "@ixfx/rx/from";
import { debounce } from "@ixfx/rx/ops";
import * as Rx from "@ixfx/rx";

/**
 * Observe when element resizes. Specify `interval` to debounce, uses 100ms by default.
 *
 * ```
 * const o = resizeObservable(myEl, 500);
 * o.subscribe(() => {
 *  // called 500ms after last resize
 * });
 * ```
 * @param elem
 * @param interval Tiemout before event gets triggered
 * @returns
 */
export const browserResizeObservable = (
  elem: Readonly<Element>,
  interval?: Interval
): any => {
  if (elem === null) {
    throw new Error(`Param 'elem' is null. Expected element to observe`);
  }
  if (elem === undefined) {
    throw new Error(`Param 'elem' is undefined. Expected element to observe`);
  }

  const m = observable<ResizeObserverEntry[]>(stream => {
    const ro = new ResizeObserver((entries) => {
      stream.set(entries);
    });
    ro.observe(elem);

    return () => {
      ro.unobserve(elem);
    };
  });
  //return debounce({ elapsed: interval ?? 100 })(m);
  return debounce<ResizeObserverEntry[]>({ elapsed: interval ?? 100 })(m);
}

/**
 * Returns an Reactive for window resize. Default 100ms debounce.
 * @param elapsed
 * @returns
 */
export const windowResize = (elapsed?: Interval): any => debounce<{ innerWidth: number, innerHeight: number }>({ elapsed: elapsed ?? 100 })(Rx.From.event(window, `resize`, { innerWidth: 0, innerHeight: 0 }));
