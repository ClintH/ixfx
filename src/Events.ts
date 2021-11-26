import {MapMulti} from "./collections/MapMulti.js";

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

type ValidEvents<Events> = keyof Events;
//type ValidStates<M extends Machine> = keyof M;
type ValidEventArgs<Events> = Events[keyof Events];
export type Listener<Events> = (this: any, ev: ValidEventArgs<Events>) => void;

export class SimpleEventEmitter<Events> {
  #listeners = new MapMulti<Listener<Events>>();

  protected fireEvent<K extends keyof Events>(type: K, args: Events[K]) {
    const listeners = this.#listeners.get(type);
    if (listeners === undefined) return;
    for (const l of listeners) {
      l(args);
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
  addEventListener<K extends keyof Events>(type: K, listener: Listener<Events>): void {// (this: any, ev: Events[K]) => any): void {
    this.#listeners.add(type, listener);
  }

  /**
   * Remove event listener
   *
   * @param {Listener<Events>} listener
   * @memberof SimpleEventEmitter
   */
  removeEventListener(listener: Listener<Events>): void {
    this.#listeners.deleteDeep(listener);
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

type TestEventMap = {
  'change': TestEvent
  'other': TestEvent2;
}

interface TestEvent2 {
  something: string;
}
interface TestEvent {
  blah: boolean;
}

class TestEmitter extends SimpleEventEmitter<TestEventMap> {

  constructor() {
    super();
    this.addEventListener('other', (e) => {

    })
  }
}

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