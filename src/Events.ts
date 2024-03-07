
import type { ISimpleEventEmitter, Listener } from './ISimpleEventEmitter.js';
import { ofSimpleMutable } from './collections/map/MapOfSimpleMutable.js';
import { intervalToMs, type Interval } from './flow/IntervalType.js';

/**
 * Subscribes to events on `target`, returning the event data
 * from the first event that fires.
 * 
 * By default waits a maximum of 1 minute.
 * 
 * Automatically unsubscribes on success or failure (ie. timeout)
 * 
 * ```js
 * // Event will be data from either event, whichever fires first
 * // Exception is thrown if neither fires within 1 second
 * const event = await eventRace(document.body, [`pointermove`, `pointerdown`], { timeout: 1000 });
 * ```
 * @param target 
 * @param eventNames 
 * @param opts 
 * @returns 
 */
export const eventRace = (target: EventTarget, eventNames: Array<string>, opts: Partial<{ timeout: Interval, signal: AbortSignal }> = {}) => {
  const intervalMs = intervalToMs(opts.timeout, 60 * 1000);
  const signal = opts.signal;
  let triggered = false;
  let disposed = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const promise = new Promise<Event>((resolve, reject) => {
    const onEvent = (event: Event) => {
      if (`type` in event) {
        if (eventNames.includes(event.type)) {
          triggered = true;
          resolve(event);
          dispose();
        } else {
          console.warn(`eventRace: Got event '${ event.type }' that is not in race list`);
        }
      } else {
        console.warn(`eventRace: Event data does not have expected 'type' field`);
        console.log(event);
      }
    }

    for (const name of eventNames) {
      target.addEventListener(name, onEvent);
    }

    const dispose = () => {
      if (disposed) return;
      if (timeout !== undefined) clearTimeout(timeout);
      timeout = undefined;
      disposed = true;
      for (const name of eventNames) {
        target.removeEventListener(name, onEvent);
      }
    }

    timeout = setTimeout(() => {
      if (triggered || disposed) return;
      dispose();
      reject(new Error(`Events not fired within interval. Events: ${ JSON.stringify(eventNames) }`));
    }, intervalMs);


    signal?.addEventListener(`abort`, () => {
      if (triggered || disposed) return;
      dispose();
      reject(new Error(`Abort signal received ${ signal.reason }`));
    });
  });
  return promise;
}


export class SimpleEventEmitter<Events> implements ISimpleEventEmitter<Events> {
  readonly #listeners = ofSimpleMutable<Listener<Events>>();

  /**
   * Fire event
   * @private
   * @param type Type of event
   * @param args Arguments for event
   * @returns
   */
  protected fireEvent<K extends keyof Events>(type: K, args: Events[ K ]) {
    const listeners = this.#listeners.get(type as string);
    //console.log(`Firing ${type as string}`);
    for (const l of listeners) {
      l(args, this);
    }
  }

  /**
   * Adds event listener
   *
   * @template K
   * @param {K} type
   * @param {Listener<Events>} listener
   * @memberof SimpleEventEmitter
   */
  addEventListener<K extends keyof Events>(
    type: K,
    listener: (event: Events[ K ], sender: SimpleEventEmitter<Events>) => void
  ): void {
    // (this: any, ev: Events[K]) => any): void {
    this.#listeners.addKeyedValues(
      type as string,
      listener as Listener<Events>
    );
  }

  /**
   * Remove event listener
   *
   * @param {Listener<Events>} listener
   * @memberof SimpleEventEmitter
   */
  removeEventListener<K extends keyof Events>(
    type: K,
    listener: (event: Events[ K ], sender: SimpleEventEmitter<Events>) => void
  ) {
    // listener: Listener<Events>): void {
    this.#listeners.deleteKeyValue(
      type as string,
      listener as Listener<Events>
    );
  }

  /**
   * Clear all event listeners
   * @private
   * @memberof SimpleEventEmitter
   */
  clearEventListeners() {
    this.#listeners.clear();
  }
}

// type TestEventMap = {
//   readonly change: TestEvent
//   readonly other: TestEvent2;
// }

// interface TestEvent2 {
//   readonly something: string;
// }
// interface TestEvent {
//   readonly blah: boolean;
// }

// class TestEmitter extends SimpleEventEmitter<TestEventMap> {
//   constructor() {
//     super();
//     this.addEventListener(`change`, (e) => {
//       e.blah;
//     });
//   }
// }

/*
export class Event {
  public target: any;
  public type: string;
  constructor(type: string, target: any) {
    this.target = target;
    this.type = type;
  }
}

export class ErrorEvent extends Event {
  public message: string;
  public error: Error;
  constructor(error: Error, target: any) {
    super('error', target);
    this.message = error.message;
    this.error = error;
  }
}

export class CloseEvent extends Event {
  public code: number;
  public reason: string;
  public wasClean = true;
  constructor(code = 1000, reason = '', target: any) {
    super('close', target);
    this.code = code;
    this.reason = reason;
  }
}
export interface WebSocketEventMap {
  close: CloseEvent;
  error: ErrorEvent;
  message: MessageEvent;
  open: Event;
}

export interface WebSocketEventListenerMap {
  close: (event: CloseEvent) => void | {handleEvent: (event: CloseEvent) => void};
  error: (event: ErrorEvent) => void | {handleEvent: (event: ErrorEvent) => void};
  message: (event: MessageEvent) => void | {handleEvent: (event: MessageEvent) => void};
  open: (event: Event) => void | {handleEvent: (event: Event) => void};
}
*/

export { type ISimpleEventEmitter, type Listener } from './ISimpleEventEmitter.js';