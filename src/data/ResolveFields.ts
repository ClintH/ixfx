//import { resolveSource } from "src/rx/ResolveSource.js";
//import type { Reactive, ReactiveOrSource, RxValueTypeObject } from "../rx/Types.js";
//import { hasLast } from "../rx/Util.js";
import * as Rx from '../rx/index.js';
import { isPrimitive } from "../KeyValue.js";
import { isAsyncIterable, isIterable } from '../iterables/Iterable.js';

type ValueType = string | number | boolean | object

type FunctionType<V> = (() => V) | (() => Promise<V>);
type ValueOrFunction<V> = ValueType | FunctionType<V> | Iterator<V> | AsyncIterator<V>;

export type ResolveValue<V> =
  V extends () => Promise<any> ? Awaited<ReturnType<V>> :
  V extends () => any ? ReturnType<V> :
  V extends Iterator<object> ? object :
  V extends Iterator<number> ? number :
  V extends Iterator<string> ? string :
  V extends Iterator<boolean> ? boolean :

  V extends AsyncIterator<object> ? object :
  V extends AsyncIterator<number> ? number :
  V extends AsyncIterator<string> ? string :
  V extends AsyncIterator<boolean> ? boolean :
  V extends ValueType ? V : never;

export type ResolvedObject<V> = Readonly<{
  [ key in keyof V ]: ResolveValue<V[ key ]>
}>

async function resolveValue<V extends ValueType>(valueOrFunction: ValueOrFunction<V>): Promise<V> {
  if (typeof valueOrFunction === `object` && `next` in valueOrFunction) {
    const v = await valueOrFunction.next();
    return v.value as V;
  }
  if (typeof valueOrFunction === `function`) {
    const v = await valueOrFunction() as V;
    return v;
  }
  return valueOrFunction as V;
}

// const object = {
//   name: `blah`,
//   gen: count(5)
// }
// const c = resolveValue(count(5));
// const cc = resolveFields(object);
// cc.gen

/**
 * Returns a copy of `object`, with the same properties. For each property
 * that has a basic value (string, number, boolean, object), the value is set
 * for the return object. If the property is a function or generator, its value
 * is used instead. Async functions and generators are also usable.
 * 
 * In the below example, the function for the property `random` is invoked.
 * ```js
 * const state = {
 *  length: 10,
 *  random: () => Math.random();
 * }
 * const x = resolveFields(state);
 * // { length: 10, random: 0.1235 }
 * ```
 * 
 * It also works with generators
 * ```js
 * import { count } from './generators.js';
 * 
 * const state = {
 *  length: 10,
 *  index: count(2) // Generator that yields: 0, 1 and then ends
 * }
 * resolveFields(state); // { length: 10, index: 0 }
 * resolveFields(state); // { length: 10, index: 1 }
 * // Generator finishes after counting twice:
 * resolveFields(state); // { length: 10, index: undefined }
 * ```
 * @param object 
 * @returns 
 */
export async function fieldResolve<V extends object>(object: V): Promise<ResolvedObject<V>> {
  const output = [];
  for (const entry of Object.entries(object)) {
    const key = entry[ 0 ];
    const valueOrFunction = entry[ 1 ] as ValueOrFunction<typeof entry[ 1 ]>;
    const value = await resolveValue(valueOrFunction);
    output.push([ key, value ]);
  }
  return Object.fromEntries(output) as ResolvedObject<V>;
}

/**
 * Returns a function that resolves `object`.
 * 
 * Use {@link fieldResolve} to resolve an object directly.
 * @param object 
 * @returns 
 */
export function fieldResolver<V extends object>(object: V) {
  return () => fieldResolve(object);
}

export type Primitive = boolean | bigint | number | string;

export function pull<T extends Record<string, Primitive | Rx.ReactiveOrSource<any>>>(value: T): { compute: () => Rx.RxPrimitiveValueTypeObject<T>, dispose: () => void } {
  const sources: Record<string, Rx.Reactive<any>> = {};
  const fixedValues: Record<string, Array<any> | Primitive> = {};
  const generators: Record<string, Iterable<any> | Generator<any> | AsyncIterable<any> | AsyncGenerator<any>> = {};

  for (const [ key, v ] of Object.entries(value)) {
    if (Array.isArray(v) || isPrimitive(v)) {
      fixedValues[ key ] = v;
    } else if (isIterable(v) || isAsyncIterable(v)) {
      generators[ key ] = v;
    } else {
      const s = Rx.resolveSource(v);
      (sources as any)[ key ] = s;
    }
  }

  // Merge sources to one Rx
  const r = Rx.mergeToObject(sources, { onSourceDone: `allow` });

  let lastRxValue: Record<string, any> | undefined;
  const off = r.value(v => {
    lastRxValue = v;
  });

  const compute = () => ({ ...fixedValues, ...lastRxValue } as Rx.RxPrimitiveValueTypeObject<T>);
  const dispose = () => {
    off();
    if (Rx.isDisposable(r)) {
      r.dispose(`ResolveFields.dispose`);
    }
  }
  return { compute, dispose };
}


export function push<T extends Record<string, Primitive | Rx.ReactiveOrSource<any>>>(value: T): { compute: () => Rx.RxPrimitiveValueTypeObject<T>, dispose: () => void } {
  const sources: Record<string, Rx.Reactive<any>> = {};
  //const interval = intervalToMs(options.interval, 100);
  const fixedValues: Record<string, Array<any> | Primitive> = {};

  // Convert dynamic things to a Reactive and stash under 'sources'
  // Stash fixed values to 'fixedValues'
  for (const [ key, v ] of Object.entries(value)) {
    if (Array.isArray(v) || isPrimitive(v)) {
      fixedValues[ key ] = v;
      continue;
    }
    const s = Rx.resolveSource(v);
    (sources as any)[ key ] = s;
  }

  // Merge sources to one Rx
  const r = Rx.mergeToObject(sources, { onSourceDone: `allow` });

  // Throttle data if necessary
  // if (interval > 0) {
  //   r = Rx.throttle(r, { elapsed: interval });
  // }

  let lastRxValue: Record<string, any> | undefined;
  const off = r.value(v => {
    lastRxValue = v;
  });

  const compute = () => ({ ...fixedValues, ...lastRxValue } as Rx.RxPrimitiveValueTypeObject<T>);
  const dispose = () => {
    off();
    if (Rx.isDisposable(r)) {
      r.dispose(`ResolveFields.dispose`);
    }
  }
  return { compute, dispose };
}
