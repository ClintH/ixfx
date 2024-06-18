import * as Rx from '../rx/index.js';
import { type PrimitiveOrObject } from "../PrimitiveTypes.js";
import { isPrimitive } from '../IsPrimitive.js';

type ValueType = string | number | boolean | object

type FunctionType<V> = (() => V) | (() => Promise<V>);
type ValueOrFunction<V> = ValueType | FunctionType<V> | Iterator<V> | AsyncIterator<V>;
type Resolvable<V> = Promise<V> | Rx.Reactive<V> | Generator<V> | AsyncGenerator<V> | IterableIterator<V> | AsyncIterableIterator<V> | ((args: any) => V)

export type PullRecord<T extends Record<string, PrimitiveOrObject | (() => any) | Rx.Reactive<any>>> =
  { [ K in keyof T ]:
    T[ K ] extends number ? number | undefined :
    T[ K ] extends string ? string | undefined :
    T[ K ] extends boolean ? boolean | undefined :
    T[ K ] extends bigint ? bigint | undefined :
    T[ K ] extends () => Promise<any> ? Awaited<ReturnType<T[ K ]>> :
    T[ K ] extends () => any ? ReturnType<T[ K ]> :
    T[ K ] extends Rx.Reactive<infer V> ? V | undefined :
    T[ K ] extends Generator<infer V> ? V | undefined :
    T[ K ] extends AsyncGenerator<infer V> ? V | undefined :
    T[ K ] extends IterableIterator<infer V> ? V | undefined :
    T[ K ] extends AsyncIterableIterator<infer V> ? V | undefined :
    T[ K ] extends Array<infer V> ? V | undefined :
    T[ K ] extends object ? T[ K ] :
    never };

export type PullRecordWithInitial<T extends Record<string, PrimitiveOrObject | (() => any) | Rx.Reactive<any>>> =
  { [ K in keyof T ]:
    T[ K ] extends number ? number :
    T[ K ] extends string ? string :
    T[ K ] extends boolean ? boolean :
    T[ K ] extends bigint ? bigint :
    T[ K ] extends () => Promise<any> ? Awaited<ReturnType<T[ K ]>> :
    T[ K ] extends () => any ? ReturnType<T[ K ]> :
    T[ K ] extends Rx.Reactive<infer V> ? V :
    T[ K ] extends Generator<infer V> ? V :
    T[ K ] extends AsyncGenerator<infer V> ? V :
    T[ K ] extends IterableIterator<infer V> ? V :
    T[ K ] extends AsyncIterableIterator<infer V> ? V :
    T[ K ] extends Array<infer V> ? V :
    T[ K ] extends object ? T[ K ] :
    never };

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
 * import { count } from './numbers.js';
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

type Updated<Type extends Record<string, any>> = Partial<{
  [ Property in keyof Type ]: Resolvable<Type[ Property ]> | Updated<Type[ Property ]>
}>

/**
 * Given an starting data-shape, `reactiveUpdate` allows you to selectively update
 * fields or use a structured set of functions to update fields on-demand.
 * 
 * 
 * ```js
 * // Shape of the data to update & default values
 * let state = {
 *  size: 0,
 *  text: `s_orig`,
 *  missing: false
 * }
 * 
 * // We want to update `size` and `text` fields on-demand (ie when .fetch is called)
 * const updaters = {
 *  size: () => Math.random(),
 *  text: () => `1`,
 * }
 * // Put them together
 * const r = Data.reactiveUpdate(state, updaters);
 * 
 * // Fetch a value, triggering updaters
 * state = await r.fetch();
 * 
 * // Get the last value witout triggering
 * state = await r.last();
 * ```
 * 
 * Data can be updated manually:
 * ```js
 * // Update just the value of the 'missing' field
 * r.update( { missing: true });
 * ```
 * 
 * You can subscribe to changes to the object using `onValue`, `onDiff` & `onField`
 * 
 * ```js
 * r.onValue(value => {
 *  // Snapshot of whole data when anything changes
 * });
 * 
 * r.onDiff(diff => {
 *  // Set of changes that have been made
 * });
 * 
 * r.onField(`size`, value => {
 *  // Notified only when 'size' field changes
 * });
 * ```
 * Caveats:
 * * Updaters cannot be nested (ie a deeper object strcture)
 * 
 * @param schema 
 * @param updaters 
 * @returns 
 * */
export function reactiveUpdate<S extends Record<string, PrimitiveOrObject>>(schema: S, updaters?: Updated<S>) {
  const current = Rx.From.object<S>(schema);

  // eslint-disable-next-line @typescript-eslint/require-await
  let fetch = async (): Promise<S> => { return current.last() };

  const applyNewData = (data: Partial<S>): S => {
    return current.update(data);
  }

  if (updaters !== undefined) {
    const rx = pull(updaters as Required<S>);
    fetch = async (): Promise<S> => {
      const data = await rx.compute() as Partial<S>;
      return applyNewData(data);
    }
  }
  return { ...current, pull: fetch }
}


export function pull<T extends Record<string, PrimitiveOrObject | Resolvable<any>>>(value: T): { compute: () => Promise<PullRecord<T>>, dispose: () => void } {
  const sources: Record<string, Rx.Reactive<any>> = {};
  const fixedValues: Record<string, Array<any> | PrimitiveOrObject> = {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  const callers: Record<string, Function | (() => any)> = {};

  for (const [ key, v ] of Object.entries(value)) {
    if (Array.isArray(v) || isPrimitive(v)) {
      fixedValues[ key ] = v;
    } else if (typeof v === `function`) {
      callers[ key ] = v;
    } else {
      try {
        const s = Rx.resolveSource(v as any);
        (sources as any)[ key ] = s;
      } catch {
        fixedValues[ key ] = v;
      }
    }
  }

  // Merge sources to one Rx
  const latestToObjectRx = Rx.combineLatestToObject(sources, { onSourceDone: `allow` });
  let lastRxValue: Record<string, any> | undefined;
  const latestToObjectOff = latestToObjectRx.onValue(v => {
    lastRxValue = v;
  });

  const computeCallers = async () => {
    const r = {};
    for (const [ key, value ] of Object.entries(callers)) {
      (r as any)[ key ] = await value();
    }
    return r;
  }

  const compute = async () => ({ ...fixedValues, ...lastRxValue, ...(await computeCallers()) } as PullRecord<T>);
  const dispose = () => {
    latestToObjectOff();
    latestToObjectRx.dispose(`ResolveFields.dispose`);
  }
  return { compute, dispose };
}

// export function push<T extends Record<string, Primitive | Rx.ReactiveOrSource<any>>>(value: T): { compute: () => Rx.RxPrimitiveValueTypeObject<T>, dispose: () => void } {
//   const sources: Record<string, Rx.Reactive<any>> = {};
//   //const interval = intervalToMs(options.interval, 100);
//   const fixedValues: Record<string, Array<any> | Primitive> = {};

//   // Convert dynamic things to a Reactive and stash under 'sources'
//   // Stash fixed values to 'fixedValues'
//   for (const [ key, v ] of Object.entries(value)) {
//     if (Array.isArray(v) || isPrimitive(v)) {
//       fixedValues[ key ] = v;
//       continue;
//     }
//     const s = Rx.resolveSource(v);
//     (sources as any)[ key ] = s;
//   }

//   // Merge sources to one Rx
//   const r = Rx.mergeToObject(sources, { onSourceDone: `allow` });

//   // Throttle data if necessary
//   // if (interval > 0) {
//   //   r = Rx.throttle(r, { elapsed: interval });
//   // }

//   let lastRxValue: Record<string, any> | undefined;
//   const off = r.onValue(v => {
//     lastRxValue = v;
//   });

//   const compute = () => ({ ...fixedValues, ...lastRxValue } as Rx.RxPrimitiveValueTypeObject<T>);
//   const dispose = () => {
//     off();
//     if (Rx.isDisposable(r)) {
//       r.dispose(`ResolveFields.dispose`);
//     }
//   }
//   return { compute, dispose };
// }
