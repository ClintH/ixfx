import { zipKeyValue } from "../../data/maps/MapFns.js";
import type { ReactiveOrSource, Reactive, RxValueTypeObject } from "../Types.js";
import { syncToArray } from "./SyncToArray.js";
import { transform } from "./Transform.js";
import type { SyncOptions } from "./Types.js";

export function syncToObject<const T extends Record<string, ReactiveOrSource<any>>>(reactiveSources: T, options: Partial<SyncOptions> = {}): Reactive<RxValueTypeObject<T>> {
  const keys = Object.keys(reactiveSources)
  const values = Object.values(reactiveSources);

  const s = syncToArray(values, options);
  const st = transform(s, (streamValues) => {
    return zipKeyValue(keys, streamValues);
  });
  return st as Reactive<RxValueTypeObject<T>>;
}