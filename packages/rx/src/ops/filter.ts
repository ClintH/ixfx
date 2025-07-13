import { initUpstream } from "../init-stream.js";
import type { ReactiveOrSource, InitStreamOptions, Reactive } from "../types.js";
import { toReadable } from "../to-readable.js";
import type { FilterPredicate } from "./types.js";

/**
 * Passes all values where `predicate` function returns _true_.
 */
export function filter<In>(input: ReactiveOrSource<In>, predicate: FilterPredicate<In>, options: Partial<InitStreamOptions>): Reactive<In> {
  const upstream = initUpstream<In, In>(input, {
    ...options,
    onValue(value) {
      if (predicate(value)) {
        upstream.set(value);
      }
    },
  })
  return toReadable(upstream);
}


/**
 * Drops all values where `predicate` function returns _true_.
 */
export function drop<In>(input: ReactiveOrSource<In>, predicate: FilterPredicate<In>, options: Partial<InitStreamOptions>): Reactive<In> {
  const upstream = initUpstream<In, In>(input, {
    ...options,
    onValue(value) {
      if (!predicate(value)) {
        upstream.set(value);
      }
    },
  })
  return toReadable(upstream);
}
