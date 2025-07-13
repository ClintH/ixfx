import { observable } from "@ixfx/rx/from/observable";

/**
 * Observe when a class changes on a target element, by default the document.
 * Useful for tracking theme changes.
 *
 * ```js
 * const c = cssClassChange();
 * c.on(msg => {
 *  // some class has changed on the document
 * });
 * ```
 */
export const cssClassChange = (target = document.documentElement) => {
  const m = observable<MutationRecord[]>(stream => {
    const ro = new MutationObserver((entries) => {
      stream.set(entries);
    });
    const opts: MutationObserverInit = {
      attributeFilter: [ `class` ],
      attributes: true,
    };
    ro.observe(target, opts);

    return () => {
      ro.disconnect();
    }
  });
  return m;
}