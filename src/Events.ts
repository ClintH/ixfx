
import type { ISimpleEventEmitter, Listener } from './ISimpleEventEmitter.js';
import { ofSimpleMutable } from './collections/map/MapOfSimpleMutable.js';

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