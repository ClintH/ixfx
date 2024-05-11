import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, Reactive } from "../Types.js";
import { toReadable } from "../ToReadable.js";
import type { TransformOpts, AnnotationElapsed } from "./Types.js";

/**
 * Annotates values from `source`, appending new fields to values.
 * Output stream will be the type `In & Out`.
 */
export function annotate<In, TAnnotation>(input: ReactiveOrSource<In>, transformer: (value: In) => In & TAnnotation, options: Partial<TransformOpts> = {}): Reactive<In & TAnnotation> {
  const upstream = initUpstream<In, In & TAnnotation>(input, {
    ...options,
    onValue(value) {
      const t = transformer(value);
      upstream.set(t);
    },
  })
  return toReadable(upstream);
}

/**
 * Annotates values from `source`, adding a `elapsedMs` field to values.
 * Elapsed will be the time in milliseconds since the last value. If it is the first value, -1 is used.
 * @param input 
 * @param transformer 
 * @param options 
 * @returns 
 */
export const annotateElapsed = <In>(input: ReactiveOrSource<In>) => {
  let last = 0;
  return annotate<In, AnnotationElapsed>(input, (value) => {
    const elapsed = last === 0 ? 0 : Date.now() - last;
    last = Date.now();
    return { ...value, elapsedMs: elapsed };
  });
}