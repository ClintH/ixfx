import type { ReactiveOp, ReactiveOrSource } from "../types.js";
import type { DebounceOptions } from "./types.js";
import { debounce as  debounceReactive  } from "../reactives/debounce.js";

export function debounce<V>(options: Partial<DebounceOptions>): ReactiveOp<V, V>  {
  return (source: ReactiveOrSource<V>) => {
    return debounceReactive<V>(source, options);
  }
}
