import * as Rx from '../../../src/rx/index.js';
import { type PrimitiveOrObject } from "../PrimitiveTypes.js";
import { isPrimitive } from '../util/IsPrimitive.js';
import { mapObjectShallow } from './MapObject.js';
import * as Pathed from './Pathed.js';
import type { ValueType } from './Types.js';


//type FunctionType<V> = (() => V) | (() => Promise<V>);
//type ValueOrFunction<V> = ValueType | FunctionType<V> | Iterator<V> | AsyncIterator<V>;

// export type PullRecord<T extends Record<string, PrimitiveOrObject | (() => any) | Rx.Reactive<any>>> =
//   { [ K in keyof T ]:
//     T[ K ] extends number ? number | undefined :
//     T[ K ] extends string ? string | undefined :
//     T[ K ] extends boolean ? boolean | undefined :
//     T[ K ] extends bigint ? bigint | undefined :
//     T[ K ] extends () => Promise<any> ? Awaited<ReturnType<T[ K ]>> :
//     T[ K ] extends () => any ? ReturnType<T[ K ]> :
//     T[ K ] extends Rx.Reactive<infer V> ? V | undefined :
//     T[ K ] extends Generator<infer V> ? V | undefined :
//     T[ K ] extends AsyncGenerator<infer V> ? V | undefined :
//     T[ K ] extends IterableIterator<infer V> ? V | undefined :
//     T[ K ] extends AsyncIterableIterator<infer V> ? V | undefined :
//     T[ K ] extends Array<infer V> ? V | undefined :
//     T[ K ] extends object ? T[ K ] :
//     never };

// export type PullRecordWithInitial<T extends Record<string, PrimitiveOrObject | (() => any) | Rx.Reactive<any>>> =
//   { [ K in keyof T ]:
//     T[ K ] extends number ? number :
//     T[ K ] extends string ? string :
//     T[ K ] extends boolean ? boolean :
//     T[ K ] extends bigint ? bigint :
//     T[ K ] extends () => Promise<any> ? Awaited<ReturnType<T[ K ]>> :
//     T[ K ] extends () => any ? ReturnType<T[ K ]> :
//     T[ K ] extends Rx.Reactive<infer V> ? V :
//     T[ K ] extends Generator<infer V> ? V :
//     T[ K ] extends AsyncGenerator<infer V> ? V :
//     T[ K ] extends IterableIterator<infer V> ? V :
//     T[ K ] extends AsyncIterableIterator<infer V> ? V :
//     T[ K ] extends Array<infer V> ? V :
//     T[ K ] extends object ? T[ K ] :
//     never };

// export type ResolveValue<V> =
//   V extends () => Promise<any> ? Awaited<ReturnType<V>> :
//   V extends () => any ? ReturnType<V> :
//   V extends Iterator<object> ? object :
//   V extends Iterator<number> ? number :
//   V extends Iterator<string> ? string :
//   V extends Iterator<boolean> ? boolean :
//   V extends AsyncIterator<object> ? object :
//   V extends AsyncIterator<number> ? number :
//   V extends AsyncIterator<string> ? string :
//   V extends AsyncIterator<boolean> ? boolean :
//   V extends ValueType ? V : never;



// type ValueOrFunction2<TInput, TOutput> = ((value: TInput) => TOutput) | TOutput;

// type DeepPartial<TSource> = {
//   [ P in keyof TSource ]?: TSource[ P ] extends object ? DeepPartial<TSource[ P ]> : TSource[ P ];
// };

// type Updated<TInput extends Record<string, any>,TOutput extends { [key in keyof TInput]:any}> = {
//   [ K in keyof TInput ]: TInput[K] extends object ? 
//       Updated<TInput[K],TOutput[K]> : 
//       UpdatedMap<TInput[K],TOutput[K]>
// }

// type Updated<TInput extends Record<string, any>,TOutput extends { [key in keyof TInput]:any}> = {
//   [ K in keyof TInput ]: TInput[K] extends object ? UpdatedMap<TInput[K],TOutput[K]> | Updated<TInput[K],TOutput[K]>
// }
// type Updated<TInput extends Record<string, any>,TOutput extends DeepPartial<TInput>> = {
//   [ K in keyof TInput ]: TInput[K] extends object ? 
//       Updated<TInput[K],TOutput[K]> : 
//       UpdatedMap<TInput[K],TOutput[K]>
// }

// type Updated<
//   TInput extends Record<string, any>,
//   TUpdaters extends { [key in keyof TInput]?:any}> = 
//   {
//     [ K in keyof TInput ]: TInput[K] extends object ? 
//       Updated<TInput[K],TUpdaters[K]> : 
//       (input:TInput[K])=> boolean
//   }

// type Updated<
//   TInput extends Record<string, any>,
//   TUpdaters extends Updaters<TInput>> = 
//   {
//     [ K in keyof TInput ]: TInput[K] extends object ? 
//       Updated<TInput[K],TUpdaters> : 
//       (input:TInput[K])=> boolean
//   }

// type MergeRecord<A extends Record<string,any>,B extends { [key in keyof A]?:any}> = {
//   [ K in keyof A ]: 
//     A[K] extends object ? 
//       MergeRecord<A[K],B[K]>:
//       B[K] extends never ? A[K] : B[K]
//       //(B[K] extends never ? A[K] : B[K])
// }

// declare function mergeTest<TInput extends Record<string,any>,TOutput extends { [key in keyof TInput]?:any}>(a:TInput,b:TOutput):MergeRecord<TInput,TOutput>;
// const m1 = mergeTest({
//   a:``,
//   b:0,
//   c:true
// }, {a:10, b:``});
// m1.c

// type Updaters<TInput extends Record<string, any>> = {
//   [ K in keyof TInput ]: (input: TInput[ K ], context: TInput) => any
// }
// const a = {
//   num: 1,
//   str: ``,
//   same: true
// } as const;

// const b: Partial<Updaters<typeof a>> = {
//   num: (v, context) => 10,
//   same: () => true
// }
// declare function test<TInput extends Record<string, any>, TUpdaters extends Updaters<TInput>>(initial: TInput, updaters: TUpdaters);

// const c = test(a, b);
// const c1 = c.str(`hello`);
// const c2 = c.num(10);

// type Updated<Type extends Record<string, any>> = Partial<{
//   [ Property in keyof Type ]: ((value: Type[ Property ], context: any) => Resolvable<Type[ Property ]> | Type[ Property ]) | Updated<Type[ Property ]>
// }>

// type Updated<Type extends Record<string, any>> = Partial<{
//   [ Property in keyof Type ]: Resolvable<Type[ Property ]> | Updated<Type[ Property ]>
// }>

/**
 * Given an starting data-shape, `reactiveUpdate` allows you to selectively update
 * fields or use a structured set of functions to update fields on-demand.
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
 * You can subscribe to changes to the object using `onValue`, `onDiff` & `onField`:
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
 *
 * Caveats:
 * * Updaters cannot be nested (ie a deeper object strcture)
 *
 * @param schema
 * @param updaters
 * @returns
 * */
// export function magic<
//   TInput extends Record<string, PrimitiveOrObject>,
//   TOutput extends TInput | { [ key in keyof TInput ]: any },
// >(input: TInput, output: TOutput, updaters: Partial<Updaters<TInput>>) {
//   const basicValues = Rx.From.object<TInput>(input);
//   const producers = new Map<string, Resolvable<any>>();

//   // If a basic value changes, check to see if we have an 'updater'
//   // to use to compute derived values
//   basicValues.onDiff(changes => {
//     console.log(`basicValues onDiff`, changes);
//     for (const c of changes) {
//       const updater = Pathed.getField(updaters, c.path);
//       if (updater.success) {
//         console.log(`found updater for path: ${ c.path }`);
//         const existing = producers.get(c.path);
//         if (existing) {
//           if (`dispose` in existing) existing.dispose(`magic dispose`);
//         }
//         //producers.set(c.path, updater.value);

//       } else {
//         console.log(`no updater for path: ${ c.path }`);
//       }
//     }
//   });

//   // const update = (values: Partial<S>) => {
//   //   current.update(values);
//   // }

//   const asdf = {} as TOutput;
//   return { update: basicValues.update, asdf }
// }

// const aRaw = {
//   rpm: 0,
//   hsl: { h: 0, s: 0.4, l: 0 },
//   fade: 0,
//   filter: ``
// } as const
// const bOutput = {
//   ...aRaw,
//   hsl: ``
// } as const

// const r1 = magic(aRaw, bOutput, {
//   hsl: (input, context) => {
//     return true
//   }
// });

// export function reactiveUpdate<S extends Record<string, PrimitiveOrObject>>(schema: S, updaters?: Updated<S>) {
//   const current = Rx.From.object<S>(schema);

//   // eslint-disable-next-line @typescript-eslint/require-await
//   let fetch = async (): Promise<S> => { return current.last() };

//   let replaceSource = (field: Extract<keyof S, string>, source: Resolvable<any>, disposeOld: boolean) => { /** no-op */ }

//   const applyNewData = (data: Partial<S>): S => {
//     return current.update(data);
//   }

//   if (updaters !== undefined) {
//     const rx = pull(updaters as Required<S>);
//     fetch = async (): Promise<S> => {
//       const data = await rx.compute() as Partial<S>;
//       return applyNewData(data);
//     }
//     replaceSource = rx.replaceSource;
//   }
//   return { ...current, pull: fetch, replaceSource }
// }

// export type ReactiveUpdate<T> = {
//   source?: Resolvable<T>
//   value: T
// }

// export type PullResult<T extends Record<string, PrimitiveOrObject | Resolvable<any>>> = {
//   /**
//     * Replace a source, by key.
//     * If key does not exist, an error is thrown.
//     * @param field Field to replace
//     * @param source New source
//     * @param disposeOld If _true_, 'dispose' will be called on the previous source (the one being removed)
//     * @returns 
//     */
//   replaceSource: (field: Extract<keyof T, string>, source: PrimitiveOrObject | Resolvable<any>, disposeOld: boolean) => Rx.Reactive<any> | PrimitiveOrObject | Function,
//   /**
//    * Compute new values
//    * @returns 
//    */
//   compute: () => Promise<PullRecord<T>>,
//   /**
//    * Dispose resources, rendering it unusable
//    * @returns 
//    */
//   dispose: () => void,
//   /**
//    * The last value
//    * @returns 
//    */
//   last: () => Partial<PullRecord<T>>
// }

/**
 * Given a {@link Resolvable}, manually pull a composite set of values from it.
 * ```js
 * const data = {
 *  name: `ace`,
 *  x: Math.random,
 * }
 * // Setup
 * const p = pull(data);
 * // 'Pull' a value
 * const v = await p.compute(); // Yields: { name: `ace`, x: 0.213 }
 * ```
 *
 * A {@link Resolvable} is a plain value, function, generator/iterable, promise or Reactive.
 *
 * It's also possible to replace a source by key
 * ```js
 *
 * p.replaceSource(`x`, () => { Math.random() / 2 });
 * ```
 * @param value
 * @returns
 */
// export function pull<T extends Record<string, PrimitiveOrObject | Resolvable<any>>>(value: T): PullResult<T> {
//   const sources: Record<string, Rx.Reactive<any>> = {};
//   const fixedValues: Record<string, Array<any> | PrimitiveOrObject> = {};
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   const callers: Record<string, Function | (() => any)> = {};
//   let initialised = false;

//   const setSource = (field: string, source: Resolvable<any> | PrimitiveOrObject) => {
//     if (Array.isArray(source) || isPrimitive(source)) {
//       fixedValues[ field ] = source;
//     } else if (typeof source === `function`) {
//       callers[ field ] = source;
//     } else {
//       try {
//         const s = Rx.resolveSource(source as any);
//         if (initialised) {
//           latestToObjectRx.replaceSource(field, s);
//         } else {
//           sources[ field ] = s;
//         }
//       } catch (_e) {
//         fixedValues[ field ] = source;
//       }
//     }
//   }

//   const removeSource = (field: string, disposeOld: boolean): Rx.Reactive<any> | PrimitiveOrObject | Function => {
//     if (field in sources) {
//       const s = sources[ field ];
//       delete sources[ field ];
//       if (disposeOld) s.dispose(`ResolveFields.pull.removeSource`);
//       return s;
//     } else if (field in fixedValues) {
//       const s = fixedValues[ field ];
//       delete fixedValues[ field ];
//       return s;
//     } else if (field in callers) {
//       const s = callers[ field ];
//       delete callers[ field ];
//       return s;
//     } else throw new Error(`Field '${ field }' not found`);
//   }

//   for (const [ key, v ] of Object.entries(value)) {
//     setSource(key, v);
//   }

//   // Merge sources to one Rx
//   const latestToObjectRx = Rx.combineLatestToObject(sources, { onSourceDone: `allow` });
//   initialised = true;
//   let lastRxValue: Record<string, any> | undefined;

//   // Record latest value
//   const latestToObjectOff = latestToObjectRx.onValue(v => {
//     lastRxValue = v;
//   });
//   // See if we can pull the value from those that have one
//   lastRxValue = latestToObjectRx.last();

//   const computeCallers = async () => {
//     const r = {};
//     for (const [ key, value ] of Object.entries(callers)) {
//       (r as any)[ key ] = await value();
//     }
//     return r;
//   }

//   let lastComputed: PullRecord<T> = mapObjectShallow<T, undefined>(value, args => {
//     return undefined;
//   }) as PullRecord<T>;

//   const compute = async () => {
//     lastComputed = { ...fixedValues, ...lastRxValue, ...(await computeCallers()) } as PullRecord<T>;
//     return lastComputed;
//   }

//   const dispose = () => {
//     latestToObjectOff();
//     latestToObjectRx.dispose(`ResolveFields.dispose`);
//   }
//   return {
//     last: () => lastComputed,
//     compute,
//     dispose,
//     replaceSource: (field, source, disposeOld) => {
//       const existing = removeSource(field, disposeOld);
//       setSource(field, source);
//       return existing;
//     }
//   };
// }