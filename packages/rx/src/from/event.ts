import type { Passed, Reactive, ReactiveInitial } from "../types.js";
import { field } from "../ops/field.js";
import { object } from "./object.js";
import type { FieldOptions } from "../ops/types.js";
import type { EventSourceOptions, EventSourceTriggerOptions } from "./types.js";
import { initLazyStream, initLazyStreamWithInitial, initStream } from "../init-stream.js";
import { elapsedInterval } from "@ixfx/core/elapsed";
/**
 * Fired when `eventName` fires on `target`. 
 * 
 * Rather than whole event args being emitted on the stream,
 * it plucks a field from the event args, or if that's missing, from the target.
 * 
 * ```js
 * // Emits the the value of a field named 'x'
 * // on the change event args
 * eventField(el, `pointermove`, `x`);
 * ```
 * @param targetOrQuery Event target, HTML element or HTML query (eg '#someId') 
 * @param eventName Name of event, eg. 'pointermove'
 * @param fieldName Name of field, eg 'x'
 * @param initialValue Initial data
 * @param options Options for source
 */
export function eventField<TFieldValue = string>(targetOrQuery: EventTarget | string | null, eventName: string, fieldName: string, initialValue: TFieldValue, options: Partial<EventSourceOptions & FieldOptions<any, TFieldValue>> = {}) {

  const initial: Record<string, any> = {};
  initial[ fieldName ] = initialValue;

  const rxField = field<any, TFieldValue>(
    event(targetOrQuery, eventName, initial, options),
    fieldName,
    options
  );
  return rxField;
}

//export function event<V extends Record<string, any>>(target: EventTarget | null | string, name: string, options: EventOptions<V>): ReactiveNonInitial<V> & ReactiveDisposable<V>;
//export function event<V extends Record<string, any>>(target: EventTarget | null | string, name: string, options?: Optional<EventOptions<V>, `transform`>): ReactiveNonInitial<V> & ReactiveDisposable<V>;

// export function event(targetOrQuery: EventTarget | null | string, name: `pointermove` | `pointerover` | `pointerup` | `pointerdown` | `pointerenter` | `pointercancel` | `pointerout` | `pointerleave` | `gotpointercapture` | `lostpointer`, initialValue: Partial<PointerEvent> | undefined, options: Partial<EventSourceOptions>): ReactiveInitial<PointerEvent> & Reactive<PointerEvent>;

/**
 * Subscribes to an event, emitting data
 * 
 * @example Print x,y position of mouse as it moves
 * ```js
 * const r = Rx.From.event(document, `pointermove`);
 * r.onValue(event => {
 *  const { x, y } = event;
 * });
 * ```
 * 
 * If `options.lazy` is _true_ (default: _false_), event will only be subscribed to when the stream
 * itself has a subscriber.
 * 
 * `options.debugFiring` and `options.debugLifecycle` can be turned on to troubleshoot behaviour
 * of the stream if necessary.
 * @param targetOrQuery Event emitter, HTML element or string. If a string, it will be queryed as a selector.
 * @param name Event name
 * @param options Options
 * @returns 
 */

export function event<TEventArgs extends Record<string, any>>(targetOrQuery: EventTarget | null | string, name: string, initialValue: TEventArgs | undefined, options: Partial<EventSourceOptions> = {}): ReactiveInitial<TEventArgs> & Reactive<TEventArgs> {
  let target: EventTarget | null;
  if (typeof targetOrQuery === `string`) {
    target = document.querySelector(targetOrQuery);
    if (target === null) throw new Error(`Target query did not resolve to an element. Query: '${ targetOrQuery }'`)
  } else {
    target = targetOrQuery;
  }

  if (target === null) throw new Error(`Param 'targetOrQuery' is null`);

  const debugLifecycle = options.debugLifecycle ?? false;
  const debugFiring = options.debugFiring ?? false;
  const diff = options.diff ?? false;
  const lazy = options.lazy ?? false;
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (initialValue === undefined) initialValue = {} as TEventArgs;

  const rxObject = object<TEventArgs>(initialValue, { deepEntries: true });
  let eventAdded = false;
  let disposed = false;

  const callback = (args: any) => {
    if (debugFiring) console.log(`Reactive.event '${ name }' firing '${ JSON.stringify(args) }`)
    rxObject.set(args as TEventArgs);
  }

  const remove = () => {
    if (!eventAdded) return;
    eventAdded = false;
    target.removeEventListener(name, callback);
    if (debugLifecycle) {
      console.log(`Rx.From.event remove '${ name }'`);
    }
  }

  const add = () => {
    if (eventAdded) return;
    eventAdded = true;
    target.addEventListener(name, callback);
    if (debugLifecycle) {
      console.log(`Rx.From.event add '${ name }'`);
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
    on: (handler: (v: Passed<TEventArgs>) => void) => {
      if (lazy) add();
      return rxObject.on(handler);
    },
    onValue: (handler: (v: TEventArgs) => void) => {
      if (lazy) add();
      return rxObject.onValue(handler);
    }
  }
}

export type TriggerData = {
  sinceLast: number
  total: number
}

/**
 * Emits a value whenever event happens.
 * Data emitted is `{ sinceLast, total }`, where 'sinceLast'
 * is milliseconds since last event and 'total' is total number of 
 * times event has been fired.
 * @param targetOrQuery 
 * @param name 
 * @param options 
 * @returns 
 */
export function eventTrigger(targetOrQuery: EventTarget | null | string, name: string, options: Partial<EventSourceTriggerOptions> = {}): Reactive<TriggerData> {
  let target: EventTarget | null;
  if (typeof targetOrQuery === `string`) {
    target = document.querySelector(targetOrQuery);
    if (target === null) throw new Error(`Target query did not resolve to an element. Query: '${ targetOrQuery }'`)
  } else {
    target = targetOrQuery;
  }

  if (target === null) throw new Error(`Param 'targetOrQuery' is null`);

  const debugLifecycle = options.debugLifecycle ?? false;
  const debugFiring = options.debugFiring ?? false;
  const fireInitial = options.fireInitial ?? false;

  let count = 0;
  const elapsed = elapsedInterval();

  const stream = initLazyStream<TriggerData>({
    lazy: options.lazy ?? `very`,
    onStart() {
      target.addEventListener(name, callback);
      if (debugLifecycle) {
        console.log(`Rx.From.eventTrigger add '${ name }'`);
      }
      if (fireInitial && count === 0) {
        if (debugLifecycle || debugFiring) console.log(`Rx.From.eventTrigger: firing initial`);
        callback();
      }
    },
    onStop() {
      target.removeEventListener(name, callback);
      if (debugLifecycle) {
        console.log(`Rx.From.eventTrigger remove '${ name }'`);
      }
    },
  });

  const callback = (_args?: any) => {
    if (debugFiring) console.log(`Rx.From.eventTrigger '${ name }' triggered'`)
    stream.set({
      sinceLast: elapsed(),
      total: ++count
    });
  }

  return stream;
}