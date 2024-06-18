import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, Reactive, ReactiveOp } from "../Types.js";
import { toReadable } from "../ToReadable.js";
import type { TransformOpts } from "./Types.js";
import { resolveSource, syncToObject } from "../index.js";

/**
 * Annotates values from `source`. Output values will be
 * in the form `{ value: TIn, annotation: TAnnotation }`.
 * Where `TIn` is the type of the input, and `TAnnotation` is
 * the return type of the annotator function.
 * 
 * Example calculating area from width & height:
 * ```js
 * const data = Rx.From.array(
 *  { w: 1, h: 3 }, { w: 1, h: 1 }, { w: 2, h: 2 }
 * );
 * const annotated = Rx.Ops.annotate(data, v => {
 *  return { area: v.w * v.h }
 * });
 * const data = await Rx.toArray(annotated);
 * // Data =  [ { value: { w:1, h:3 }, annotation: { area:3 } } ...]
 * ```
 * 
 * If you would rather annotate and have values merge with the input,
 * use `transform`:
 * ```js
 * const data = Rx.From.array(
 *  { w: 1, h: 3 }, { w: 1, h: 1 }, { w: 2, h: 2 }
 * );
 * const withArea = Rx.Ops.transform(data, v => {
 *  return { ...v, area: v.w * v.h }
 * });
 * const data = await Rx.toArray(withArea);
 * // Data =  [ { w:1, h:3, area:3 }, ...]
 * ```
 */
export function annotate<In, TAnnotation>(input: ReactiveOrSource<In>, annotator: (value: In) => TAnnotation, options: Partial<TransformOpts> = {}): Reactive<{ value: In, annotation: TAnnotation }> {
  const upstream = initUpstream<In, { value: In, annotation: TAnnotation }>(input, {
    ...options,
    onValue(value) {
      const annotation = annotator(value);
      upstream.set({ value, annotation });
    },
  })
  return toReadable(upstream);
}

/**
 * Annotates the input stream using {@link ReactiveOp} as the source of annotations.
 * The output values will have the shape of `{ value: TIn, annotation: TAnnotation }`.
 * Meaning that the original value is stored under `.value`, and the annotation under `.annotation`.
 * 
 * ```js
 * const data = Rx.From.array([ 1, 2, 3 ]);
 * const annotated = Rx.Ops.annotateWithOp(data, Rx.Ops.sum());
 * const data = await annotated.toArray(annotated);
 * // Data =  [ { value: 1, annotation: 1 }, { value: 2, annotation: 3 }, { value: 3, annotation: 6 } ]
 * ```
 * @param annotatorOp Operator to generate annotations
 * @param input Input stream
 * @returns 
 */
export function annotateWithOp<In, TAnnotation>(input: ReactiveOrSource<In>, annotatorOp: ReactiveOp<In, TAnnotation>): Reactive<{ value: In, annotation: TAnnotation }> {

  const inputStream = resolveSource(input);

  // Create annotations from input
  const stream = annotatorOp(inputStream);

  const synced = syncToObject({
    value: inputStream,
    annotation: stream
  })
  return synced as Reactive<{ value: In, annotation: TAnnotation }>;
}

