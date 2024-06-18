import { initUpstream } from "../InitStream.js";
import type { Reactive, ReactiveOrSource } from "../Types.js";
import { toReadable } from "../ToReadable.js";
import type { TransformOpts } from "./Types.js";

/**
 * Transforms values from `source` using the `transformer` function.
 * @param transformer 
 * @returns 
 */
export function transform<In, Out>(input: ReactiveOrSource<In>, transformer: (value: In) => Out, options: Partial<TransformOpts> = {}): Reactive<Out> {
  const traceInput = options.traceInput ?? false;
  const traceOutput = options.traceOutput ?? false;

  const upstream = initUpstream<In, Out>(input, {
    lazy: `initial`,
    ...options,
    onValue(value) {
      const t = transformer(value);
      if (traceInput && traceOutput) {
        console.log(`Rx.Ops.transform input: ${ JSON.stringify(value) } output: ${ JSON.stringify(t) }`);
      } else if (traceInput) {
        console.log(`Rx.Ops.transform input: ${ JSON.stringify(value) }`);
      } else if (traceOutput) {
        console.log(`Rx.Ops.transform output: ${ JSON.stringify(t) }`);
      }

      upstream.set(t);
    },
  })
  return toReadable(upstream);
}

