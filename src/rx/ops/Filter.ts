import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, InitStreamOptions, Reactive } from "../Types.js";
import { toReadable } from "../ToReadable.js";
import type { FilterPredicate } from "./Types.js";

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
