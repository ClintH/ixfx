import { intervalToMs, type Interval } from "../flow/IntervalType.js";
import { DispatchList, type Dispatch } from "../flow/DispatchList.js"
import * as Immutable from '../Immutable.js';
import { QueueMutable } from "../collections/index.js";
import * as DiGraph from "./graphs/DirectedGraph.js";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type Reactive<V> = {
  on(handler: (value: V) => void): void
}

export type ReactiveNonInitial<V> = Reactive<V> & {
  last(): V | undefined
}

export type ReactiveWritable<V> = {
  set(value: V): void
}

export type ReactiveDiff<V> = ReactiveWritable<V> & {
  onDiff(handler: (changes: Array<Immutable.Change<any>>) => void): void
  update(changedPart: Record<string, any>): void
  updateField(field: string, value: any): void
}

export type ReactiveInitial<V> = Reactive<V> & {
  last(): V
}

export type ReactiveDisposable = {
  dispose(reason: string): void
}

export function number(initialValue: number): ReactiveWritable<number> & ReactiveInitial<number>;
export function number(): ReactiveWritable<number> & ReactiveNonInitial<number>;
export function number(initialValue?: number): ReactiveWritable<number> & (ReactiveNonInitial<number> | ReactiveInitial<number>) {
  let value = initialValue;
  const events = initEvent<number>();

  const set = (v: number) => {
    value = v;
    events.notify(v);
  }

  return {
    last: () => value,
    on: events.on,
    set
  }
}

/**
 * Monitors input reactive values, storing values as they happen to an array.
 * Whenever a new value is emitted, the whole array is sent out, containing current
 * values from each source.
 * @param values 
 * @returns 
 */
export function mergeAsArray<V>(...values: Array<Reactive<V>>): Reactive<Array<V | undefined>> {
  const event = initEvent<Array<V | undefined>>();
  const data: Array<V | undefined> = [];

  for (const [ index, v ] of values.entries()) {
    data[ index ] = undefined;
    v.on(valueChanged => {
      data[ index ] = valueChanged;
      event.notify(data);
    });
  }

  return {
    on: event.on
  }
}

/**
 * Waits for all sources to produce a value, sending the combined results as an array.
 * After sending, it waits again for each source to send a value.
 * 
 * Each source's latest value is returned, in the case of some sources producing results
 * faster than others.
 * @param sources 
 * @returns 
 */
export function synchronise<V>(...sources: Array<Reactive<V>>): Reactive<Array<V | undefined>> {
  const event = initEvent<Array<V>>();
  let data: Array<V | undefined> = [];

  for (const [ index, v ] of sources.entries()) {
    data[ index ] = undefined;
    v.on(valueChanged => {
      data[ index ] = valueChanged;

      if (!data.includes(undefined)) {
        // All array elements contain values
        event.notify(data as Array<V>);
        data = [];
      }
    });
  }

  return {
    on: event.on
  }
}

export type EventOptions<V> = {
  process: (args?: Event | undefined) => V
  lazy?: boolean
}

export type ResolveAfterOptions = {
  loops?: number
  infinite?: boolean
}

export function resolveAfter<V extends Record<string, any>>(interval: Interval, callbackOrValue: V | (() => V), options: ResolveAfterOptions = {}): Reactive<V> {
  const intervalMs = intervalToMs(interval, 0);
  const event = initEvent<V>();
  const loops = options.infinite ? Number.MAX_SAFE_INTEGER : options.loops ?? 1;
  let remaining = loops;

  const run = () => {
    if (typeof callbackOrValue === `function`) {
      const value = callbackOrValue();
      event.notify(value);
    } else {
      event.notify(callbackOrValue);
    }
    remaining--;
    if (remaining > 0) {
      setTimeout(run, intervalMs);
    }
  }
  setTimeout(run, intervalMs);

  const r: Reactive<V> = {
    on: event.on
  }
  return r;
}

export function event<V extends Record<string, any>, EventName extends string>(target: EventTarget, name: EventName, options: EventOptions<V>): ReactiveInitial<V> & ReactiveDisposable;

export function event<V extends Record<string, any>, EventName extends string>(target: EventTarget, name: EventName, options?: Optional<EventOptions<V>, `process`>): ReactiveNonInitial<V> & ReactiveDisposable;

export function event<V extends Record<string, any>, EventName extends string>(target: EventTarget, name: EventName, options: Partial<EventOptions<V>> = {}): (ReactiveInitial<V> | ReactiveNonInitial<V>) & ReactiveDisposable {
  const process = options.process;
  const initialValue = process ? process() : undefined;
  const rxObject = initialValue ? object<V>(initialValue) : object<V>();
  const lazy = options.lazy ?? false;
  let eventAdded = false;

  const callback = (args: any) => {
    rxObject.set(process ? process(args) : args);
  }

  const remove = () => {
    if (!eventAdded) return;
    eventAdded = false;
    target.removeEventListener(name, callback);
  }

  const add = () => {
    if (eventAdded) return;
    eventAdded = true;
    console.log(`event added ${ name }`);
    target.addEventListener(name, callback);
  }

  if (!lazy) add();

  return {
    last: () => {
      if (lazy) add();
      return rxObject.last();
    },
    dispose: (_: string) => {
      remove();
    },
    on: (handler: (v: V) => void) => {
      if (lazy) add();
      rxObject.on(handler);
    }
  }
  // const result = {
  //   dispose: () => {
  //     target.removeEventListener(name, callback)
  //   },
  //   [ `${ name }` ]: rxObject
  // }

  // return result as {
  //   [ key in EventName ]: typeof rxObject
  // } & {
  //   dispose: () => void
  // };

}
export function object<V extends Record<string, any>>(eq?: Immutable.IsEqualContext<V>): ReactiveDiff<V> & ReactiveNonInitial<V>;
export function object<V extends Record<string, any>>(initialValue: V, eq?: Immutable.IsEqualContext<V>): ReactiveDiff<V> & ReactiveInitial<V>;

export function object<V extends Record<string, any>>(initialValue?: V, eq = Immutable.isEqualContextString): ReactiveDiff<V> & (ReactiveInitial<V> | ReactiveNonInitial<V>) {
  const setEvent = initEvent<V>();
  const diffEvent = initEvent<Array<Immutable.Change<any>>>();

  let value: V | undefined = initialValue;

  const set = (v: V) => {
    if (value !== undefined) {
      const diff = Immutable.compareData(value, v, ``, eq);
      if (diff.length === 0) return;
      diffEvent.notify(diff);
    }

    value = v;
    setEvent.notify(v);
  }

  const update = (toMerge: Partial<V>) => {
    const pd = Immutable.getPathsAndData(toMerge);
    // eslint-disable-next-line unicorn/prefer-ternary
    if (value === undefined) {
      value = toMerge as V;
    } else {
      value = {
        ...value,
        ...toMerge
      }
    }
    diffEvent.notify(pd);
    setEvent.notify(value);
  }

  const updateField = (path: string, valueForField: any) => {
    if (value === undefined) throw new Error(`Cannot update value when it has not already been set`);
    const existing = Immutable.getField(value, path);
    if (eq(existing, valueForField, path)) return;
    const o = Immutable.updateByPath(value, path, valueForField);
    value = o;
    diffEvent.notify([ { path, value: valueForField, previous: existing } ]);
    setEvent.notify(o);
  }

  return {
    updateField,
    last: () => value,
    on: setEvent.on,
    onDiff: diffEvent.on,
    set,
    update
  }
}

function initEvent<V>() {
  let dispatcher: DispatchList<V> | undefined;
  return {
    clear: () => dispatcher?.clear(),
    notify: (v: V) => {
      dispatcher?.notify(v);
    },
    on: (handler: Dispatch<V>) => {
      if (dispatcher === undefined) dispatcher = new DispatchList();
      const id = dispatcher.add(handler);
      return () => {
        dispatcher?.remove(id);
      }
    }
  }
}

export type BatchOptions = {
  elapsed?: Interval
  limit?: number
  logic?: `or` | `and`
}

export function field<In, Out>(source: Reactive<In>, field: keyof In): Reactive<Out> & ReactiveDisposable {
  const events = initEvent<Out>();

  source.on(value => {
    const t = value[ field ];
    events.notify(t as Out);
  })

  return {
    on: events.on,
    dispose: events.clear
  }
}

export function transform<In, Out>(source: Reactive<In>, transformer: (value: In) => Out): Reactive<Out> & ReactiveDisposable {
  const events = initEvent<Out>();

  source.on(value => {
    const t = transformer(value);
    events.notify(t);
  })

  return {
    on: events.on,
    dispose: events.clear
  }
}

/**
 * Queue from `source`, emitting when thresholds are reached.
 * Can use a combination of elapsed time or number of data items.
 * 
 * By default options are ORed
 *
 * @param source 
 * @param options 
 * @returns 
 */
export function batch<V>(source: Reactive<V>, options: BatchOptions = {}): Reactive<Array<V>> {
  const elapsed = intervalToMs(options.elapsed, 0);
  const queue = new QueueMutable<V>();
  const limit = options.limit ?? 0;
  const logic = options.logic ?? `or`;

  let lastFire = performance.now();
  const events = initEvent<Array<V>>();

  const trigger = () => {
    const now = performance.now();
    let byElapsed = false;
    let byLimit = false;
    if (elapsed > 0 && (now - lastFire > elapsed)) {
      lastFire = now;
      byElapsed = true;
    }
    if (limit > 0 && queue.length >= limit) {
      byLimit = true;
    }
    if (logic === `or` && (!byElapsed && !byLimit)) return;
    if (logic === `and` && (!byElapsed || !byLimit)) return;

    // Fire queued data
    const data = queue.data;
    queue.clear();
    events.notify(data as Array<V>);
  }

  source.on(value => {
    queue.enqueue(value);
    trigger();
  });

  const r: Reactive<Array<V>> = {
    on: events.on
  }
  return r;
}

export type ThrottleOptions = {
  elapsed?: Interval
}

export function throttle<V>(source: Reactive<V>, options: ThrottleOptions = {}): Reactive<V> {
  const elapsed = intervalToMs(options.elapsed, 0);
  let lastFire = performance.now();
  const events = initEvent<V>();
  let lastValue: V | undefined;

  const trigger = () => {
    const now = performance.now();
    let byElapsed = false;
    if (elapsed > 0 && (now - lastFire > elapsed)) {
      lastFire = now;
      byElapsed = true;
    }
    if (!byElapsed) return;

    if (lastValue !== undefined) {
      events.notify(lastValue);
    }
  }

  source.on(value => {
    lastValue = value;
    trigger();
  });

  const r: Reactive<V> = {
    on: events.on
  }
  return r;
}


export function win() {
  const generateRect = () => ({ width: window.innerWidth, height: window.innerHeight });

  const size = event(window, `resize`, {
    lazy: true,
    process: () => generateRect(),
  });
  const pointer = event(window, `pointermove`, {
    lazy: true,
    process: (args: Event | undefined) => {
      if (args === undefined) return { x: 0, y: 0 };
      const pe = args as PointerEvent;
      return { x: pe.x, y: pe.y }
    }
  });
  const dispose = (reason = `Reactive.win.dispose`) => {
    size.dispose(reason);
    pointer.dispose(reason);
  }
  return { dispose, size, pointer };
}


type RxNodeBase = {
  type: `primitive` | `rx` | `object`
}

type RxNodeRx = RxNodeBase & {
  type: `rx`,
  value: Reactive<any>
}

type RxNodePrimitive = RxNodeBase & {
  type: `primitive`,
  value: any
}

type RxNode = RxNodeRx | RxNodePrimitive;

function isReactive(o: object): o is Reactive<any> {
  if (typeof o !== `object`) return false;
  if (`on` in o) {
    return (typeof o.on === `function`);
  }
  return false;
}

/**
 * Build a graph of reactive dependencies for `rx`
 * @param rx 
 */
export function prepare<V extends Record<string, any>>(rx: V): Reactive<V> {
  let g = DiGraph.graph();
  const nodes = new Map<string, RxNode>();
  const events = initEvent<V>();

  const process = (o: object, path: string) => {
    for (const [ key, value ] of Object.entries(o)) {
      const subPath = path + `.` + key;
      g = DiGraph.connect(g, {
        from: path,
        to: subPath
      });
      if (isReactive(value)) {
        nodes.set(subPath, { value, type: `rx` });
        value.on(v => {
          console.log(`Reactive.prepare value: ${ v } path: ${ subPath }`);
        });
      } else {
        const valueType = typeof value;
        // eslint-disable-next-line unicorn/prefer-switch
        if (valueType === `bigint` || valueType === `boolean` || valueType === `number` || valueType === `string`) {
          nodes.set(subPath, { type: `primitive`, value });
        } else if (valueType === `object`) {
          process(value, subPath)
        } else if (valueType === `function`) {
          console.log(`Reactive.process - not handling functions`);
        }
      }
    }
  }

  // const produce = () => {
  //   Object.fromEntries(entries);
  // }

  process(rx, `_root`);
  console.log(DiGraph.dumpGraph(g));

  console.log(`--- Map ---`);

  for (const entries of nodes.entries()) {
    console.log(entries[ 0 ]);
    console.log(entries[ 1 ]);
    console.log(``)
  }


  const returnValue = {
    graph: g,
    on: events.on
  }
  return returnValue;
}

