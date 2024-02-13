import { updateByPath } from "../Immutable.js";
import { compareData, type ChangeRecord } from "../Compare.js";
import { DispatchList } from "../flow/DispatchList.js";
export * as Dom from './PipeDom.js'
export type Signals = `closed`;

/**
 * A message that flows through a Pipe.
 * Two more specific types: {@link ValueMessage} and {@link SignalMessage}
 */
export type Message<V> = {
  /**
   * Value of message, if any
   */
  value?: V
  /**
   * Signal message conveys, if any
   */
  signal?: Signals
  paths?: Array<string>
  changes?: Array<ChangeRecord>
}

/**
 * A {@link Message} that conveys a value.
 * Its signal is an empty string
 */
export type ValueMessage<V> = Message<V> & {
  value: V
  signal: ``
  changes: ChangeRecord
}

/**
 * A {@link Message} that conveys a signal.
 * Its value is _undefined_
 */
export type SignalMessage = Message<any> & {
  value: undefined
  signal: Signals
}

export type MessageHandler<V> = (message: Message<V>) => void;
export type ValueHandler<V> = (value: V) => void;
export type ClosedHandler = (reason: string) => void

/**
 * Subscription
 */
export type Subscription = {
  /**
   * Id of subscription, used for matching unsubscribe requests
   */
  id: string
  source: any

  off: () => void
}

/**
 * Options when subscribing
 */
export type SubscribeOptions = {
  /**
   * If _true_, subscription is automatically removed after it fires once
   */
  once: boolean
}

export type ReadableEvents<V> = {
  value: (handler: ValueHandler<V>, options?: Partial<SubscribeOptions>) => Subscription
  message: (handler: MessageHandler<V>, options?: Partial<SubscribeOptions>) => Subscription
}

type ReadWriteStreamOptions = Readonly<{
  closed?: (reason: string) => void
}>

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IReadable<V> {
  on: ReadableEvents<V>
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IWritable<V> {
  push(message: Message<V>): void;
}

export type StreamEvents = {
  closed: (handler: ClosedHandler, options: Partial<SubscribeOptions>) => Subscription
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IStream {
  on: StreamEvents
  /**
   * Closes a stream
   * @param reason 
   */
  close(reason: string): void
  get isClosed(): boolean;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IReadableValue<V> {
  get value(): V
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IWritableValue<V> {
  set value(value: V);
}

export const isReadableValue = <V>(r: IReadable<V> | IReadableValue<V>): r is IReadableValue<V> => {
  return (`value` in r);
}

/**
 * Wrap a number
 * ```js
 * // Init
 * const v = Pipes.number(10);
 * // Listen for changes
 * v.on.value(x => console.log(`Value is now ${x}`)); 
 * // Update
 * v.value = 20;
 * @param initialValue Initial value
 * @returns 
 */
export const number = (initialValue: number) => {
  const r = new ReadWriteValue<number>(initialValue);
  return r;
}

/**
 * Wrap an object as a {@link ReadWriteObject}.
 * 
 * ```js
 * const o = object({ person: `Jane`, colour: `red` });
 * 
 * ```
 * @param initialValue Initial value
 * @returns 
 */
export const object = <V extends Record<string, any>>(initialValue: V) => {
  const r = new ReadWriteObject<V>(initialValue);
  return r;
}

export const event = <EventType extends Event>(target: EventTarget, name: string): IReadable<EventType> & IStream => {
  const callback = (args: any) => {
    pipe.push({ value: args });
  }

  target.addEventListener(name, callback);

  const closed = () => {
    target.removeEventListener(name, callback);
  }

  const pipe = new ReadWriteStream<EventType>({ closed });
  return pipe;
}



/**
 * Merge two or more readables into one
 * @param readables 
 * @returns 
 */
export const merge = (...readables: Array<IReadable<any>>): IReadable<any> => {
  const s = initReadableEvents();

  for (const r of readables) {
    r.on.message(s.onMessage);
    r.on.value(s.onValue);
  }

  return { on: s }
}

/**
 * Returns one writeable that writes to each of the input writables
 */
export const split = (...writables: Array<IWritable<any>>): IWritable<any> => {
  const push = (v: any) => {
    for (const w of writables) {
      w.push(v);
    }
  }
  return { push }
}

export const initialValue = <V extends Record<string, any>>(value: V): IWritable<V> => {

  const pipe = new ReadWriteObject<V>(value);
  return pipe;
}


class ReadWriteStream<V> implements IReadable<V>, IWritable<V>, IStream {

  #closed = false;
  readonly on;
  private readonly dispatch;

  #opts: ReadWriteStreamOptions;
  constructor(opts: ReadWriteStreamOptions) {
    this.#opts = opts;
    const eventsReadable = initReadableEvents<V>();
    const eventsStream = initStreamEvents();
    this.on = {
      closed: eventsStream.closed,
      value: eventsReadable.value,
      message: eventsReadable.message
    };
    this.dispatch = {
      closed: eventsStream.onClosed,
      value: eventsReadable.onValue,
      message: eventsReadable.onMessage
    };
  }

  push(message: Message<V>): void {
    if (this.#closed) throw new Error(`Pipe closed`);
    console.log(message);
    if (message.signal === `closed`) {
      if (this.#closed) return; // Ignore message
      if (this.#opts.closed) this.#opts.closed(`closed signal recv`);
      this.#closed = true;
    }
    this.dispatch.message(message);
    if (message.value) {
      this.dispatch.value(message.value);
    }
  }

  /**
   * Pushes a close message
   */
  close() {
    this.push({ signal: `closed` })
  }

  get isClosed(): boolean {
    return this.#closed;
  }
}

const initStreamEvents = () => {
  let _closed: DispatchList<string> | undefined;

  const closed = (handler: ClosedHandler, options: Partial<SubscribeOptions> = {}): Subscription => {
    if (_closed === undefined) _closed = new DispatchList<string>();
    const id = _closed.add(handler, options);
    return { id, source: menubar, off: () => { _closed?.remove(id) } }
  }

  const onClosed = (reason: string) => {
    _closed?.notify(reason);
  }

  const clear = () => {
    _closed?.clear();
  }

  return { closed, onClosed, clear }
}

const initReadableEvents = <V>() => {
  let _messages: DispatchList<Message<V>> | undefined;
  let _values: DispatchList<V> | undefined;
  const me = new Object();

  const value = (handler: ValueHandler<V>, options: Partial<SubscribeOptions> = {}): Subscription => {
    if (_values === undefined) _values = new DispatchList<V>();
    const id = _values.add(handler, options);
    return {
      id,
      source: me,
      off: () => {
        _values?.remove(id)
      }
    }
  }

  const message = (handler: MessageHandler<V>, options: Partial<SubscribeOptions> = {}): Subscription => {
    if (_messages === undefined) _messages = new DispatchList<Message<V>>();
    const id = _messages.add(handler, options);
    return {
      id,
      source: me,
      off: () => {
        _messages?.remove(id)
      }
    }
  }

  const onValue = (v: V) => {
    _values?.notify(v);
  }

  /**
   * Fire event
   * @param message 
   */
  const onMessage = (message: Message<V>) => {
    _messages?.notify(message);
  }

  const clear = () => {
    _messages?.clear()
    _values?.clear();
  }
  return { value, message, onValue, onMessage, clear }
}

export class ReadWriteValue<V> implements IReadable<V>, IReadableValue<V>, IWritable<V>, IWritableValue<V> {
  protected _value: V;
  readonly on;
  private readonly dispatch;
  #closed = false;

  constructor(initialValue: V) {
    this._value = initialValue;
    const events = initReadableEvents<V>();
    this.on = {
      value: events.value,
      message: events.message
    };
    this.dispatch = {
      value: events.onValue,
      message: events.onMessage
    };
  }

  close() {
    this.push({ signal: `closed` });
  }

  set value(value: V) {
    if (this.#closed) throw new Error(`ReadWriteValue closed`);
    this.push({ value });
  }
  get value(): V {
    return this._value;
  }


  get isClosed() {
    return this.#closed;
  }


  push(message: Message<V>): void {
    if (this.#closed) throw new Error(`ReadWriteValue cannot receive messages when closed`);
    if (message.signal === `closed`) {
      this.#closed = true;
    }

    if (message.value !== undefined) {
      this.setLastValue(message.value);
    }
    this.dispatch.message(message);
  }

  protected setLastValue(value: V) {
    this._value = value;
    this.dispatch.value(value);
  }
}

export class ReadWriteObject<V extends Record<string, any>> implements IReadable<V>, IReadableValue<V>, IWritableValue<V> {
  protected _value: V;
  readonly on;
  private readonly dispatch;

  constructor(initialValue: V) {
    this._value = initialValue;
    const events = initReadableEvents<V>();
    this.on = {
      value: events.value,
      message: events.message
    };
    this.dispatch = {
      value: events.onValue,
      message: events.onMessage
    };
  }

  set value(value: V) {
    this.push({ value });
  }

  get value(): V {
    return this._value;
  }

  setPath(path: string, value: any): void {
    const updatedValue = updateByPath(this._value, path, value);
    this.setLastValue(updatedValue);
    this.dispatch.message({
      value: updatedValue, changes: [
        `mutate`, path, value
      ]
    })
  }

  protected setLastValue(value: V) {
    this._value = value;
    this.dispatch.value(value);
  }

  push(message: Message<V>): void {
    // Is it a signal?
    if (typeof message.value === `undefined`) {
      this.dispatch.message(message);
      return;
    }

    const v = message.value;

    // Compare to existing
    const r = compareData(this._value, v);
    if (!r.hasChanged) return;

    this.setLastValue(v);
    this.dispatch.message({ value: v, changes: r.summary });
  }
}

// const wrap = <V>(stream: IReadableValue<V> & IReadable<V>) => {
//   return {
//     on: stream.on.value,
//     value: stream.value
//   }
// }

// export const rxWindow = () => {
//   const sizeStream = event(window, `resize`);

//   const dispose = () => {
//     sizeStream.close(`rxWindow.dispose`);
//   }
//   return {
//     size: wrap(sizeStream),
//     dispose
//   }
// }
