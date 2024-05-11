export * as Dom from './Dom.js';
export * as Links from './Links.js';
export * from './Types.js';

export * from './AddToArray.js';
export * from './AsArray.js';
export * from './AsCallback.js';
export * from './AsPromise.js';
export * from './AsValue.js';
export * from './FromArray.js';
export * from './FromEvent.js';
export * from './FromFunction.js';
export * from './FromIterable.js';
export * from './Lazy.js';
export * from './MergeFlat.js';
export * from './CombineLatestToArray.js';
export * from './CombineLatestToObject.js';
export * from './Run.js';
export * from './Single.js';
export * from './Sync.js';
export * from './Ticks.js'
export * from './Util.js';

// export function syncToObject<const T extends Record<string, ReactiveOrSource<any>>>(reactiveSources: T, options: Partial<SyncOptions> = {}): AsyncGenerator<RxValueTypeObject<T>> {
//   const keys = Object.keys(reactiveSources)
//   const values = Object.values(reactiveSources);

//   const s = syncToArray(values, options);
//   const st = transform(s, (streamValues) => {
//     return zipKeyValue(keys, streamValues);
//   });
//   return st as Reactive<RxValueTypeObject<T>>;
// }



/**
 * Prepare a chain, allowing you to provide a source at execution time.
 * ```js
 * const chain = Chains.prepare(
 *  Chains.transform<string,number>( v => number.parseInt(v) ),
 *  Chains.filter<number>(v => v % 2 === 0)
 * );
 *
 * // Run it with provided source
 * for await (const v of chain([`1`, `2`, `3`])) {
 *
 * }
 * ```
 * @param functions
 * @returns
 */
// export function prepare<In, Out>(...functions: Links<In, Out>) {
//   const r = (source: GenOrData<In> | GenFactoryNoInput<Out>) => {
//     return run(source);
//   }
//   return r;
// }
