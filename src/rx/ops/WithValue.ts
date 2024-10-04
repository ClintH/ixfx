import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, WithValueOptions, ReactiveInitial } from "../Types.js";
import { toReadable } from "../ToReadable.js";

/**
 * A reactive where the last value can be read at any time.
 * An initial value must be provided.
 * ```js
 * const r = Rx.withValue(source, { initial: `hello` });
 * r.last(); // Read last value
 * ```
 * 
 * Warning: Since most reactives only active when subscribed to, it's important to also subscribe
 * to the results of `r` for this flow to happen. Alternatively, use `lazy: 'never'` as an option.
 * @param input 
 * @param options 
 * @returns 
 */
export function withValue<In>(input: ReactiveOrSource<In>, options: WithValueOptions<In>): ReactiveInitial<In> {
  let lastValue: In | undefined = options.initial;
  const upstream = initUpstream<In, In>(input, {
    ...options,
    onValue(value) {
      //console.log(`Rx.Ops.WithValue onValue: ${ value }`);
      lastValue = value;
      upstream.set(value);
    },
  })

  const readable = toReadable(upstream);
  return {
    ...readable,
    last() {
      return lastValue!;
    },
  }
}