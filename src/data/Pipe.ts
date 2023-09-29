import { updateByPath } from "../Immutable.js";
import { compareData, type ChangeRecord } from "../Compare.js";
import { DispatchList } from "../flow/DispatchList.js";

export type Signals = `closed`;

export type Message<V> = {
  value?: V
  signal?: Signals
  paths?: Array<string>
  changes?: Array<ChangeRecord>
}

export type ValueMessage<V> = Message<V> & {
  value: V
  signal: ``
  changes: ChangeRecord
}

export type SignalMessage = Message<any> & {
  value: undefined
  signal: Signals
}

export type MessageHandler<V> = (message: Message<V>) => void;
export type ValueHandler<V> = (value: V) => void;

export type Subscription = {
  id: string
  source: any
  off: () => void
}

export type SubscribeOptions = {
  once?: boolean
}

export type ReadableEvents<V> = {
  value: (handler: ValueHandler<V>, options: SubscribeOptions) => Subscription
  message: (handler: MessageHandler<V>, options: SubscribeOptions) => Subscription
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IReadable<V> {
  on: ReadableEvents<V>
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IWritable<V> {
  push(message: Message<V>): void;
}

export type StreamEvents = {
  closed: (handler: ClosedHandler, options: SubscribeOptions) => Subscription
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IStream {
  on: StreamEvents
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

export const number = (initialValue: number) => {
  const r = new ReadWriteValue<number>(initialValue);
  return r;
}

export const object = (initialValue: Record<string, any>) => {
  const r = new ReadWriteObject<Record<string, any>>(initialValue);
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

export const initialValue = <V extends Record<string, any>>(value: V): IWritable<V> => {

  const pipe = new ReadWriteObject<V>(value);
  return pipe;
}

type ReadWriteStreamOptions = Readonly<{
  closed?: () => void
}>

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
    this.dispatch.message(message);
    if (message.value) {
      this.dispatch.value(message.value);
    }
  }

  close() {
    if (this.#closed) return;
    if (this.#opts.closed) this.#opts.closed();
    this.#closed = true;
  }

  get isClosed(): boolean {
    return this.#closed;
  }
}


export type ClosedHandler = (reason: string) => void

const initStreamEvents = <V>() => {
  let _closed: DispatchList<string> | undefined;

  const closed = (handler: ClosedHandler, options: SubscribeOptions): Subscription => {
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

  const value = (handler: ValueHandler<V>, options: SubscribeOptions): Subscription => {
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

  const message = (handler: MessageHandler<V>, options: SubscribeOptions): Subscription => {
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

  const onMessage = (message: Message<V>) => {
    _messages?.notify(message);
  }

  const clear = () => {
    _messages?.clear()
    _values?.clear();
  }
  return { value, message, onValue, onMessage, clear }
}

class ReadWriteValue<V> implements IReadable<V>, IReadableValue<V>, IWritable<V> {
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

  push(message: Message<V>): void {
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
