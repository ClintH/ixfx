

// interface WindowEventMap extends GlobalEventHandlersEventMap, WindowEventHandlersEventMap {
//   "devicemotion": DeviceMotionEvent;
//   "deviceorientation": DeviceOrientationEvent;
//   "gamepadconnected": GamepadEvent;
//   "gamepaddisconnected": GamepadEvent;
//   "orientationchange": Event;
// }

// interface EventSourceEventMap {
//   "error": Event;
//   "message": MessageEvent;
//   "open": Event;
// }

// interface EventListener {
//   (evt: Event): void;
// }


// export interface EventMap {
//   [key: string]: any;
// }

//export type EventHandler<EventArgs> = (args: EventArgs, source: SimpleEventEmitter<EventArgs>) => void;

// class Registration<Events, K extends keyof Events> {
//   id: string;
//   listener: Listener<Events, K>;

//   constructor(id: string, listener: Listener<Events, K>) {
//     this.id = id;
//     this.listener = listener;
//   }
// }


//export type Listener<K extends keyof Events, Events> = (this: any, ev: Events[K]) => any;

//type ValidEvents<Events> = keyof Events;
//type ValidStates<M extends Machine> = keyof M;
//type ValidEventArgs<K extends keyof Events, Events> = Events[K];

export type Listener<Events> = (ev: unknown, sender: SimpleEventEmitter<Events>) => void;

export class SimpleEventEmitter<Events> {
  readonly #listeners = new SimpleMutableMapArray<Listener<Events>>();

  protected fireEvent<K extends keyof Events>(type: K, args: Events[K]) {
    const listeners = this.#listeners.get(type as string);
    if (listeners === undefined) return;
    listeners.forEach(l => {
      // eslint-disable-next-line functional/no-try-statement
      try {
        l(args, this);
      } catch (err) {
        console.debug(`Event listener error: `, err);
      }
    });
  }

  /**
   * Adds event listener
   *
   * @template K
   * @param {K} type
   * @param {Listener<Events>} listener
   * @memberof SimpleEventEmitter
   */
  addEventListener<K extends keyof Events>(type: K, listener: (ev: Events[K], sender: SimpleEventEmitter<Events>) => void): void { // (this: any, ev: Events[K]) => any): void {
    this.#listeners.add(type as string, listener as Listener<Events>);
  }
  //addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;

  /**
   * Remove event listener
   *
   * @param {Listener<Events>} listener
   * @memberof SimpleEventEmitter
   */
  removeEventListener<K extends keyof Events>(type: K, listener: Listener<Events>): void {
    this.#listeners.delete(type as string, listener);
  }

  /**
   * Clear all event listeners
   *
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

/**
 * A simple mutable map of arrays, without events
 *
 * @export
 * @class SimpleMutableMapArray
 * @template V
 */
export class SimpleMutableMapArray<V> {
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly #map: Map<string, ReadonlyArray<V>> = new Map();
 
  add(key:string, ...values:ReadonlyArray<V>) {
    const existing = this.#map.get(key);
    if (existing === undefined) {
      this.#map.set(key, values);
    } else {
      this.#map.set(key, [...existing, ...values]);
    }
  }

  debugString(): string {
    // eslint-disable-next-line functional/no-let
    let r = ``;
    const keys = Array.from(this.#map.keys());
    keys.every(k => {
      const v = this.#map.get(k);
      if (v === undefined) return;
      r += k + ` (${v.length}) = ${JSON.stringify(v)}\r\n`;
    });
    return r;
  }

  get(key:string):ReadonlyArray<V>|undefined {
    return this.#map.get(key);
  }

  delete(key:string, v:V):boolean {
    const existing = this.#map.get(key);
    if (existing === undefined) return false;
    const without = existing.filter(i => i !== v);
    this.#map.set(key, without);
    return without.length < existing.length;
  }

  clear() {
    this.#map.clear();
  }
}