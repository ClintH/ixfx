import type { EventOptions, Optional, Passed, ReactiveDisposable, ReactiveInitial, ReactiveNonInitial } from "./Types.js";
import { fromObject } from "./index.js";

export function fromEvent<V extends Record<string, any>>(target: EventTarget | null, name: string, options: EventOptions<V>): ReactiveInitial<V> & ReactiveDisposable;

export function fromEvent<V extends Record<string, any>>(target: EventTarget | null, name: string, options?: Optional<EventOptions<V>, `transform`>): ReactiveNonInitial<V> & ReactiveDisposable;

/**
 * Subscribes to an event, emitting data
 * 
 * @example Print x,y position of mouse as it moves
 * ```js
 * const r = Rx.fromEvent(document, `pointermove`);
 * r.value(event => {
 *  const { x, y } = event;
 * });
 * ```
 * 
 * As a convienence, there is an in-built transform option, via `options.transform`. Event data
 * passes through this function before emitting. 
 * ```js
 * // Emit relative pixel values rather than absolute
 * Rx.fromEvent(document,`pointermove`, { 
 *  transform: (event) => ({ x: event.x/window.innerWidth, y:event.y/window.innerHeight })
 * })
 * ```
 * Providing the transform function also properly types the stream.
 * 
 * To create an initial value for an event stream, provide `options.transform`, and have it
 * return the default value if there is undefined input.
 * 
 * ```js
 * // Makes an initial value of {x:0.5,y:0.5},
 * // but later yields relative pixel values
 * Rx.fromEvent(document,`pointermove`, { 
 *  transform: (event) => {
 *    if (!event) return { x: 0.5, y: 0.5 }
 *    return { x: event.x / window.innerWidth, y: event.y / window.innerHeight }
 *  }
 * })
 * ```
 * 
 * If `options.lazy` is _true_ (default: _false_), event will only be subscribed to when the stream
 * itself has a subscriber.
 * 
 * `options.debugFiring` and `options.debugLifecycle` can be turned on to troubleshoot behaviour
 * of the stream if necessary.
 * @param target Event emitter
 * @param name Event name
 * @param options Options
 * @returns 
 */
export function fromEvent<V extends Record<string, any>>(target: EventTarget | null, name: string, options: Partial<EventOptions<V>> = {}): (ReactiveInitial<V> | ReactiveNonInitial<V>) & ReactiveDisposable {
  // TODO could this have better typing to pick up on the proper eventargs?
  if (target === null) throw new Error(`Param 'target' is null`);
  const transform = options.transform;
  const initialValue = transform ? transform() : undefined;
  const debugLifecycle = options.debugLifecycle ?? false;
  const debugFiring = options.debugFiring ?? false;
  const rxObject = initialValue ? fromObject<V>(initialValue, { deepEntries: true }) : fromObject<V>(undefined, { deepEntries: true });
  const lazy = options.lazy ?? false;
  let eventAdded = false;
  let disposed = false;

  const callback = (args: any) => {
    if (debugFiring) console.log(`Reactive.event '${ name }' firing '${ JSON.stringify(args) }`)
    rxObject.set(transform ? transform(args) : args);
  }

  const remove = () => {
    if (!eventAdded) return;
    eventAdded = false;
    target.removeEventListener(name, callback);
    if (debugLifecycle) {
      console.log(`Reactive.event remove '${ name }'`);
    }
  }

  const add = () => {
    if (eventAdded) return;
    eventAdded = true;
    target.addEventListener(name, callback);
    if (debugLifecycle) {
      console.log(`Reactive.event add '${ name }'`);
    }
  }

  if (!lazy) add();

  return {
    last: () => {
      if (lazy) add();
      return rxObject.last();
    },
    dispose: (reason: string) => {
      if (disposed) return;
      disposed = true;
      remove();
      rxObject.dispose(reason);
    },
    isDisposed() {
      return disposed;
    },
    on: (handler: (v: Passed<V>) => void) => {
      if (lazy) add();
      return rxObject.on(handler);
    },
    value: (handler: (v: V) => void) => {
      if (lazy) add();
      return rxObject.value(handler);
    }
  }
}
