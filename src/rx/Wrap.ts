import { batch, annotate, annotateElapsed, field, filter, split, splitLabelled, switcher, sync, debounce, throttle, transform } from "./Ops.js";
import { resolveSource } from "./ResolveSource.js";
import { toArray, toArrayOrThrow } from "./ToArray.js";
import type { ReactiveOrSource, Wrapped, ToArrayOptions, BatchOptions, FieldOptions, FilterPredicate, InitStreamOptions, SplitOptions, SwitcherOptions, Reactive, DebounceOptions, ThrottleOptions, TransformOpts, RxValueTypes, SyncOptions } from "./Types.js";
import { messageHasValue } from "./Util.js";
import { map as ImmutableMap } from '../Immutable.js';

/**
 * Wrap a reactive source in a OOP wrapper to allow for chained
 * function calls.
 * 
 * For every `pointerup` event on the body, batch the events over
 * periods of 200ms, and then get the number of events in that period,
 * finally printing it out.
 * 
 * eg. detecting single or double-clicks
 * ```js
 * wrap(event<{ x: number, y: number }>(document.body, `pointerup`))
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
    },
    batch: (options: Partial<BatchOptions>): Wrapped<Array<TIn>> => {
      const w = wrap<Array<TIn>>(batch(source, options));
      return w;
    },
    annotate: <TAnnotation>(transformer: (value: TIn) => TIn & TAnnotation): Wrapped<TIn & TAnnotation> => {
      const a = annotate<TIn, TAnnotation>(source, transformer);
      return wrap(a);
    },
    annotateElapsed: () => {
      return wrap(annotateElapsed<TIn>(source));
    },
    field: <TFieldType>(fieldName: keyof TIn, options: Partial<FieldOptions<TFieldType>> = {}) => {
      const f = field<TIn, TFieldType>(fieldName, options)(source);
      return wrap<TFieldType>(f);
    },
    filter: (predicate: FilterPredicate<TIn>, options: Partial<InitStreamOptions>) => {
      return wrap(filter(source, predicate, options));
    },
    split: (options: Partial<SplitOptions> = {}) => {
      const streams = split<TIn>(options)(source).map(v => wrap(v));
      return streams;
    },
    splitLabelled: <K extends keyof TIn>(...labels: Array<K>) => {
      const l = splitLabelled<TIn, keyof TIn>(...labels)(source);
      const m = ImmutableMap<typeof l, Wrapped<TIn>>(l, v => wrap(v as Reactive<TIn>)) as Record<K, Wrapped<TIn>>;
      return m;
    },
    switcher: <TRec extends Record<string, FilterPredicate<TIn>>, TLabel extends keyof TRec>(cases: TRec, options: Partial<SwitcherOptions> = {}) => {
      const s = switcher<TIn, TRec, TLabel>(source, cases, options);
      const m = ImmutableMap<typeof s, Wrapped<TIn>>(s, v => wrap(v as Reactive<TIn>));
      return m as Record<TLabel, Wrapped<TIn>>;
    },
    //synchronise: (...additionalSources: Array<Wrapped<TIn> | ReactiveOrSource<TIn>>) => {
    synchronise: <const T extends ReadonlyArray<ReactiveOrSource<any>>>(additionalSources: T, options: Partial<SyncOptions> = {}) => {
      const unwrapped = [ source, ...additionalSources ].map(v => resolveSource(v));
      const x = sync(unwrapped, options) as Reactive<[ TIn, ...RxValueTypes<T> ]>;
      return wrap(x); //synchronise<TIn>([ source, ...unwrapped ] as const));
    },
    debounce: (options: Partial<DebounceOptions> = {}) => {
      return wrap(debounce<TIn>(source, options));
    },
    throttle: (options: Partial<ThrottleOptions> = {}) => {
      return wrap(throttle<TIn>(source, options));
    },
    transform: <TOut>(transformer: (value: TIn) => TOut, options: Partial<TransformOpts> = {}) => {
      return wrap(transform(source, transformer, options));
    }
  }
}
