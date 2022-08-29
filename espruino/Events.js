"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SimpleEventEmitter_listeners;
exports.__esModule = true;
exports.SimpleEventEmitter = void 0;
/* eslint-disable */
var SimpleMapArray_js_1 = require("./collections/SimpleMapArray.js");
;
var SimpleEventEmitter = /** @class */ (function () {
    function SimpleEventEmitter() {
        _SimpleEventEmitter_listeners.set(this, (0, SimpleMapArray_js_1.simpleMapArrayMutable)());
    }
    /**
     * Fire event
     * @private
     * @param type Type of event
     * @param args Arguments for event
     * @returns
     */
    SimpleEventEmitter.prototype.fireEvent = function (type, args) {
        var _this = this;
        var listeners = __classPrivateFieldGet(this, _SimpleEventEmitter_listeners, "f").get(type);
        if (listeners === undefined)
            return;
        listeners.forEach(function (l) {
            try {
                l(args, _this);
            }
            catch (err) {
                console.debug("Event listener error: ", err);
            }
        });
    };
    /**
     * Adds event listener
     *
     * @template K
     * @param {K} type
     * @param {Listener<Events>} listener
     * @memberof SimpleEventEmitter
     */
    SimpleEventEmitter.prototype.addEventListener = function (type, listener) {
        __classPrivateFieldGet(this, _SimpleEventEmitter_listeners, "f").add(type, listener);
    };
    /**
     * Remove event listener
     *
     * @param {Listener<Events>} listener
     * @memberof SimpleEventEmitter
     */
    SimpleEventEmitter.prototype.removeEventListener = function (type, listener) {
        __classPrivateFieldGet(this, _SimpleEventEmitter_listeners, "f")["delete"](type, listener);
    };
    /**
     * Clear all event listeners
     * @private
     * @memberof SimpleEventEmitter
     */
    SimpleEventEmitter.prototype.clearEventListeners = function () {
        __classPrivateFieldGet(this, _SimpleEventEmitter_listeners, "f").clear();
    };
    return SimpleEventEmitter;
}());
exports.SimpleEventEmitter = SimpleEventEmitter;
_SimpleEventEmitter_listeners = new WeakMap();
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
//# sourceMappingURL=Events.js.map