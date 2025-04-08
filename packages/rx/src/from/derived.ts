import { isEqualValueDefault } from "@ixfxfun/core";
import { cache } from "../cache.js";
import { initUpstream } from "../init-stream.js";
import { type CombineLatestToObject, combineLatestToObject } from "../ops/combine-latest-to-object.js";
import type { ReactiveNonInitial, ReactiveOrSource, RxValueTypeObject } from "../types.js";
import type { DerivedOptions } from "./types.js";

export function derived<TResult, const T extends Record<string, ReactiveOrSource<any>>>(fn: (combined: RxValueTypeObject<T>) => TResult | undefined, reactiveSources: T, options: Partial<DerivedOptions<TResult, CombineLatestToObject<T>>> = {}): ReactiveNonInitial<TResult> {
  const ignoreIdentical = options.ignoreIdentical ?? true;
  const eq = options.eq ?? isEqualValueDefault<TResult>;

  const sources = combineLatestToObject(reactiveSources);

  const handle = (v: RxValueTypeObject<T>) => {
    const last = output.last();
    const vv = fn(v);
    if (vv !== undefined) {
      if (ignoreIdentical && last !== undefined) {
        if (eq(vv, last)) return vv;
      }
      output.set(vv);
    }

    return vv;
  }

  // When the combined stream emits a value, output it
  const s = initUpstream<RxValueTypeObject<T>, TResult>(sources, {
    ...options,
    onValue(v) {
      handle(v);
    },
  });
  const output = cache(s, fn(sources.last()));
  return output;
}

