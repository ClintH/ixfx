import type { Interval } from 'src/flow/IntervalType.js';
import * as Rx from '../rx/index.js';

/**
 * Returns an Reactive for window resize. Default 100ms debounce.
 * @param timeoutMs
 * @returns
 */
export const windowResize = (elapsed?: Interval) => Rx.Ops.debounce<{ innerWidth: number, innerHeight: number }>({ elapsed: elapsed ?? 100 })(Rx.From.event(window, `resize`, { innerWidth: 0, innerHeight: 0 }));

/**
 * Observe when document's class changes
 *
 * ```js
 * const c = themeChangeObservable();
 * c.on(msg => {
 *  // do something...
 * });
 * ```
 * @returns
 */
export const themeChange = () => {
  const m = Rx.From.observable<Array<MutationRecord>>(stream => {
    const ro = new MutationObserver((entries) => {
      stream.set(entries);
    });
    const opts: MutationObserverInit = {
      attributeFilter: [ `class` ],
      attributes: true,
    };
    ro.observe(document.documentElement, opts);

    return () => {
      ro.disconnect();
    }
  });
  return m;
}

/**
 * Observe when element resizes. Specify `timeoutMs` to debounce, uses 100ms by default.
 *
 * ```
 * const o = resizeObservable(myEl, 500);
 * o.subscribe(() => {
 *  // called 500ms after last resize
 * });
 * ```
 * @param elem
 * @param timeoutMs Tiemout before event gets triggered
 * @returns
 */
export const resizeObservable = (
  elem: Readonly<Element>,
  timeout?: Interval
) => {
  if (elem === null) {
    throw new Error(`elem parameter is null. Expected element to observe`);
  }
  if (elem === undefined) {
    throw new Error(`elem parameter is undefined. Expected element to observe`);
  }

  const m = Rx.From.observable<Array<ResizeObserverEntry>>(stream => {
    const ro = new ResizeObserver((entries) => {
      stream.set(entries);
    });
    ro.observe(elem);

    return () => {
      ro.unobserve(elem);
    };
  });
  return Rx.Ops.debounce<Array<ResizeObserverEntry>>({ elapsed: timeout ?? 100 })(m);
}
