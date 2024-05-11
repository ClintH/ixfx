import * as Ops from "./ops/index.js";
import { resolveSource } from "./ResolveSource.js";
import { toArray, toArrayOrThrow } from "./ToArray.js";
import type { ReactiveOrSource, Wrapped, ToArrayOptions, InitStreamOptions, Reactive, RxValueTypes, CombineLatestOptions, } from "./Types.js";
import type { BatchOptions, FieldOptions, FilterPredicate, DebounceOptions, SwitcherOptions, SplitOptions, ThrottleOptions, TransformOpts, SyncOptions, } from './ops/Types.js'
import type { TimeoutTriggerOptions } from './sources/Types.js'
import { messageHasValue } from "./Util.js";
import { map as ImmutableMap } from '../Immutable.js';

/**
 * Wrap a reactive source to allow for chained
 * function calls.
 * 
 * Example:
 * For every `pointerup` event on the body, batch the events over
 * periods of 200ms, get the number of events in that period,
 * and print it out.
 * 
 * eg. detecting single or double-clicks
 * ```js
 * wrap(Rx.fromEvent<{ x: number, y: number }>(document.body, `pointerup`))
 *  .batch({ elapsed: 200 })
 *  .transform(v => v.length)
 *  .value(v => { console.log(v) });
 * ```
 * @param source 
 * @returns 
 */
export function wrap<TIn>(source: ReactiveOrSource<TIn>): Wrapped<TIn> {
  return {
    source: resolveSource(source),
    annotate: <TAnnotation>(transformer: (value: TIn) => TIn & TAnnotation): Wrapped<TIn & TAnnotation> => {
      const a = Ops.annotate<TIn, TAnnotation>(source, transformer);
      return wrap(a);
    },
    annotateElapsed: () => {
      return wrap(Ops.annotateElapsed<TIn>(source));
    },
    batch: (options: Partial<BatchOptions>): Wrapped<Array<TIn>> => {
      const w = wrap<Array<TIn>>(Ops.batch(source, options));
      return w;
    },
    debounce: (options: Partial<DebounceOptions> = {}) => {
      return wrap(Ops.debounce<TIn>(source, options));
    },
    field: <TFieldType>(fieldName: keyof TIn, options: Partial<FieldOptions<TFieldType>> = {}) => {
      // Ops.field requires TIn extends object
      // Would be good if `wrap` returns different versions depending on TIn, so .field
      // would not be present at all if we had Reactive<number>, for example
      // @ts-expect-error
      const f = Ops.field<TIn, TFieldType>(source, fieldName, options);
      return wrap<TFieldType>(f);
    },
    filter: (predicate: FilterPredicate<TIn>, options: Partial<InitStreamOptions>) => {
      return wrap(Ops.filter(source, predicate, options));
    },
    combineLatestToArray: <const T extends ReadonlyArray<ReactiveOrSource<any>>>(sources: T, options: Partial<CombineLatestOptions> = {}) => {
      const srcs = [ source, ...sources ] as any as T;
      return wrap(Ops.combineLatestToArray(srcs, options));
    },
    combineLatestToObject: <const T extends Record<string, ReactiveOrSource<any>>>(sources: T, options: { name?: string } & Partial<CombineLatestOptions>) => {
      const name = options.name ?? `source`;
      const o = { ...sources };
      (o as any)[ name ] = source;
      return wrap(Ops.combineLatestToObject(o, options));
    },
    split: (options: Partial<SplitOptions> = {}) => {
      const streams = Ops.split<TIn>(source, options).map(v => wrap(v));
      return streams;
    },
    splitLabelled: <K extends keyof TIn>(...labels: Array<K>) => {
      const l = Ops.splitLabelled<TIn, keyof TIn>(source, labels);
      const m = ImmutableMap<typeof l, Wrapped<TIn>>(l, v => wrap(v as Reactive<TIn>)) as Record<K, Wrapped<TIn>>;
      return m;
    },
    switcher: <TRec extends Record<string, FilterPredicate<TIn>>, TLabel extends keyof TRec>(cases: TRec, options: Partial<SwitcherOptions> = {}) => {
      const s = Ops.switcher<TIn, TRec, TLabel>(source, cases, options);
      const m = ImmutableMap<typeof s, Wrapped<TIn>>(s, v => wrap(v as Reactive<TIn>));
      return m as Record<TLabel, Wrapped<TIn>>;
    },
    syncToArray: <const T extends ReadonlyArray<ReactiveOrSource<any>>>(additionalSources: T, options: Partial<SyncOptions> = {}) => {
      const unwrapped = [ source, ...additionalSources ].map(v => resolveSource(v));
      const x = Ops.syncToArray(unwrapped, options) as Reactive<[ TIn, ...RxValueTypes<T> ]>;
      return wrap(x); //synchronise<TIn>([ source, ...unwrapped ] as const));
    },
    syncToObject: <const T extends Record<string, ReactiveOrSource<any>>>(sources: T, options: { name?: string } & Partial<SyncOptions> = {}) => {
      const name = options.name ?? `source`;
      const o = { ...sources };
      (o as any)[ name ] = source;
      return wrap(Ops.syncToObject(o, options));
    },
    throttle: (options: Partial<ThrottleOptions> = {}) => {
      return wrap(Ops.throttle<TIn>(source, options));
    },
    transform: <TOut>(transformer: (value: TIn) => TOut, options: Partial<TransformOpts> = {}) => {
      return wrap(Ops.transform(source, transformer, options));
    },
    timeoutTrigger: <TTrigger>(options: TimeoutTriggerOptions<TTrigger>) => {
      return wrap(Ops.timeoutTrigger<TIn, TTrigger>(source, options));
    },
    toArray: (options: Partial<ToArrayOptions<TIn>>) => {
      return toArray(source, options);
    },
    toArrayOrThrow: (options: Partial<ToArrayOptions<TIn>>) => {
      return toArrayOrThrow(source, options);
    },
    value: (callback: ((value: TIn) => void)) => {
      const s = resolveSource(source);
      s.on(message => {
        if (messageHasValue(message)) callback(message.value);
      })
    }
  }
}
