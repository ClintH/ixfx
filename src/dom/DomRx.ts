import type { Interval } from 'src/flow/IntervalType.js';
import * as Rx from '../data/Reactive.js';

/**
 * Returns an Reactive for window resize. Default 100ms debounce.
 * @param timeoutMs
 * @returns
 */
export const windowResize = (elapsed?: Interval) => Rx.Ops.debounce<UIEvent>({ elapsed: elapsed ?? 100 })(Rx.fromEvent(window, `resize`));
//Rx.fromEvent(window, `resize`).pipe(debounceTime(timeoutMs));

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
  const m = Rx.observable<Array<MutationRecord>>(stream => {
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
// export const themeChangeObservable = (): Observable<
//   ReadonlyArray<MutationRecord>
// > => {
//   const o = new Observable<Array<MutationRecord>>((subscriber) => {
//     const ro = new MutationObserver((entries) => {
//       subscriber.next(entries);
//     });

//     const opts: MutationObserverInit = {
//       attributeFilter: [ `class` ],
//       attributes: true,
//     };

//     ro.observe(document.documentElement, opts);
//     return function unsubscribe() {
//       ro.disconnect();
//     };
//   });
//   return o;
// };

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

  const m = Rx.observable<Array<ResizeObserverEntry>>(stream => {
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

//   const o = new Observable<Array<ResizeObserverEntry>>((subscriber) => {
//     const ro = new ResizeObserver((entries) => {
//       subscriber.next(entries);
//     });

//     ro.observe(elem);
//     return function unsubscribe() {
//       ro.unobserve(elem);
//     };
//   });
//   return o.pipe(debounceTime(timeoutMs));
// };
