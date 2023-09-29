// import { DispatchList } from "../../flow/DispatchList.js";
// import type { Signal } from "./Signal.js";
// import * as Signals from './Signal.js';
// import type { IReadable, IWriteable, OutletCallback, SubscribeOptions, Subscription } from "./Types.js";

// export type BidiOptions<V> = {
//   initialValue?: V
//   finite?: boolean
//   primeOutlet?: boolean
//   signalIntercept?: (signal: Signal) => boolean
// }

// export class Bidi<V> implements IReadable<V>, IWriteable<V> {
//   #primeOutlet: boolean;
//   #handler: DispatchList<Signals.InOut<V>>;
//   #finite: boolean;

//   #signalIntercept?: (signal: Signal) => boolean;
//   #last?: Signals.InOut<V>;
//   #closed = false;

//   constructor(options: BidiOptions<V> = {}) {
//     this.#finite = options.finite ?? false;
//     this.#signalIntercept = options.signalIntercept;
//     this.#last = [ options.initialValue, undefined, this ];
//     this.#primeOutlet = options.primeOutlet ?? false;
//     this.#handler = new DispatchList<Signals.InOut<V>>();
//   }

//   push(value: Signals.InOut<V>) {
//     if (this.#closed) throw new Error(`Pipe is closed`);
//     if (Signals.isValue(value)) {
//       this.#last = value;
//     }

//     this.#handler.notify(value);

//     if (Signals.isClosed(value)) {
//       if (!this.#finite) throw new Error(`Cannot close infinite pipe`);
//       this.#closed = true;
//       this.#handler.clear();
//     }
//   }

//   pushValue(value: V) {
//     this.push([ value, undefined, this ]);
//   }

//   unsubscribe(subscription: Subscription) {
//     if (subscription === undefined) throw new Error(`Parameter 'subscription' is undefined`);
//     if (subscription.source !== this) throw new Error(`Parameter 'source' does not match this pipe`);
//     this.#handler.remove(subscription.id.toString());

//   }

//   subscribe(callback: IWriteable<V> | OutletCallback<V>, options: SubscribeOptions = {}): Subscription {
//     if (this.#closed) throw new Error(`Pipe is closed`);
//     // eslint-disable-next-line @typescript-eslint/unbound-method
//     const co = (typeof callback === `function`) ? callback : callback.push;

//     const id = this.#handler.add(co, options);

//     if (this.#last !== undefined) {
//       // eslint-disable-next-line unicorn/no-lonely-if
//       if (this.#primeOutlet || options?.primeOutlet) {
//         co(this.#last);
//       }
//     }
//     return { id: id.toString(), source: this }
//   }

//   signal(signal: Signal) {
//     if (this.#signalIntercept) {
//       // eslint-disable-next-line unicorn/no-lonely-if
//       if (this.#signalIntercept(signal)) return;
//     }

//     this.#handler.notify([ undefined, signal, this ]);
//   }

//   close(reason: string) {
//     this.signal({ source: reason, type: `closed` });
//   }

//   get last() {
//     if (this.#last === undefined) return;
//     return this.#last[ 0 ];
//   }
//   get isClosed() {
//     return this.#closed;
//   }

//   get isFinite() {
//     return this.#finite;
//   }
// }
