import { zipKeyValue } from "@ixfxfun/core/maps";
import type { ReactiveOrSource, Reactive, RxValueTypeObject } from "../types.js";
import { syncToArray } from "./sync-to-array.js";
import { transform } from "./transform.js";
import type { SyncOptions } from "./types.js";

export function syncToObject<const T extends Record<string, ReactiveOrSource<any>>>(reactiveSources: T, options: Partial<SyncOptions> = {}): Reactive<RxValueTypeObject<T>> {
  const keys = Object.keys(reactiveSources)
  const values = Object.values(reactiveSources);

  const s = syncToArray(values, options);
  const st = transform(s, (streamValues) => {
    return zipKeyValue(keys, streamValues);
  });
  return st as Reactive<RxValueTypeObject<T>>;
}