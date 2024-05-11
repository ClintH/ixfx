import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, Reactive } from "../Types.js";
import { toReadable } from "../ToReadable.js";
import type { TransformOpts } from "./Types.js";

/**
 * Transforms values from `source` using the `transformer` function.
 * @param transformer 
 * @returns 
 */
export function transform<In, Out>(input: ReactiveOrSource<In>, transformer: (value: In) => Out, options: Partial<TransformOpts> = {}): Reactive<Out> {
  const upstream = initUpstream<In, Out>(input, {
    lazy: `initial`,
    ...options,
    onValue(value) {
      const t = transformer(value);
      upstream.set(t);
    },
  })

  return toReadable(upstream);
}