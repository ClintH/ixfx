import { DispatchList } from "../flow/DispatchList.js";
import type { SubscribeOptions } from "./Pipe.js";


export type Signals = `closed`;

export type Subscription = {
  id: string
  off: () => void
}

export type Message<V> = {
  value?: V
  signal?: Signals
}

export type ValueMessage<V> = Message<V> & {
  value: V
  signal: undefined
}

export type SignalMessage = Message<any> & {
  value: undefined
  signal: Signals
}

export type MessageHandler<V> = (message: Message<V>) => void;

export type ByRequest<V> = {
  request(outlet: MessageHandler<V>): void
}

export type GenerateValueSync<V> = {
  generateSync: () => V
}

export type Inlet<In> = {
  inlet(message: Message<In>): void
}

export type TransformSync<In, Out> = {
  transformSync(message: Message<In>): Out
}

export type ThroughSync<In, Out> = {
  throughSync(message: Message<In>): Message<Out>
}

export type Emit<Out> = {
  emit: (outlet: MessageHandler<Out>) => {
    start(): void
    stop(reason: string): void
  }
}

export type Source<V> = ByRequest<V> | Emit<V>;
export type Sink<In, Out> = Inlet<In> | TransformSync<In, Out> | GenerateValueSync<Out> | ThroughSync<In, Out>;

const withValue = <V>(value: V): ByRequest<V> & Inlet<V> => {
  let current = value;

  const inlet = (message: Message<V>) => {
    if (message.value) {
      current = message.value;
    }
  }

  const request = (outlet: MessageHandler<V>) => {
    outlet({ value: current });
  }
  return { request, inlet }
}

export const generateValueSync = <V>(callback: () => V): GenerateValueSync<V> => {
  const generateSync = () => callback();
  return { generateSync }
}

export const fromAsyncGenerator = <V>(gen: AsyncGenerator<V>): Emit<V> => {
  const emit = (outlet: MessageHandler<V>) => {
    let cancel = false;
    const start = async () => {
      console.log(`fromAsyncGenerator.start`);
      for await (const value of gen) {
        outlet({ value });
        if (cancel) break;
      }
      console.log(`fromAsyncGenerator.start exiting. cancel: ${ cancel }`);
    }

    const stop = (reason: string) => {
      console.log(`fromAsyncGenerator.stop: ${ reason }`);
      cancel = true;
    }
    return { start, stop }
  }
  return { emit }
}

export const fromEvent = <Out>(target: EventTarget, name: string): Emit<Out> => {
  const emit = (outlet: MessageHandler<Out>) => {
    const callback = (args: any) => {
      outlet({ value: args as Out });
    }

    const start = () => {
      target.addEventListener(name, callback);
    }

    const stop = (reason: string) => {
      console.log(`fromEvent stop: ${ name } reason: ${ reason }`);
      target.removeEventListener(name, callback);
    }

    return { start, stop }
  }
  return { emit }
}

const initReadableEvents = <V>() => {
  let _messages: DispatchList<Message<V>> | undefined;
  let _values: DispatchList<V> | undefined;
  const me = new Object();

  const value = (handler: (value: V) => void, options: SubscribeOptions): Subscription => {
    if (_values === undefined) _values = new DispatchList<V>();
    const id = _values.add(handler, options);
    return {
      id,
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


export const chainSync = <In, Out>(source: Emit<In>, ...additional: Array<Sink<In, Out>>) => {
  let lastValue: Out | undefined;
  const events = initReadableEvents<Out>();

  const hasValue = (value: Out) => {
    lastValue = value;
    events.onValue(value);
  }

  const dispose = (reason: string) => {
    sourceControl.stop(reason);
  }

  const produceSomething = () => {
    for (const s of additional) {
      if (`generateSync` in s) {
        const outValue = s.generateSync();
        hasValue(outValue);
      }
    }
  }

  const sourceDestination = (message: Message<any>) => {
    for (const s of additional) {
      if (`inlet` in s) {
        // Pass data to sink
        s.inlet(message);
      }
      if (`transformSync` in s) {
        // Transform
        message = { ...message, value: s.transformSync(message) }
      }
      if (`generateSync` in s) {
        message = { ...message, value: s.generateSync() }
      }
      if (`throughSync` in s) {
        message = s.throughSync(message);
      }
    }
    hasValue(message.value);
    events.onMessage(message);
    return message.value as Out;
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const sourceControl = source.emit(sourceDestination);
  sourceControl.start();

  produceSomething();

  return {
    lastValue: () => lastValue,
    value: events.value,
    message: events.message,
    dispose
  }
}

