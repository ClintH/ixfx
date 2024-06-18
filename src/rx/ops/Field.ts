/* eslint-disable @typescript-eslint/unbound-method */
import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, Reactive } from "../Types.js";
import { toReadable } from "../ToReadable.js";
import type { FieldOptions } from "./Types.js";

/**
 * From a source value, yields a field from it. Only works
 * if stream values are objects.
 * 
 * If a source value doesn't have that field, it is skipped.
 *
 * @returns 
 */
export function field<TIn extends object, TFieldType>(fieldSource: ReactiveOrSource<TIn>, fieldName: keyof TIn, options: Partial<FieldOptions<TIn, TFieldType>> = {}): Reactive<TFieldType> {
  const fallbackFieldValue = options.fallbackFieldValue;
  const fallbackObject = options.fallbackObject;

  const upstream = initUpstream<TIn, TFieldType>(fieldSource, {
    disposeIfSourceDone: true,
    ...options,
    onValue(value) {
      let v: TFieldType | undefined;
      // 1. Try to read from value
      if (fieldName in value) {
        v = value[ fieldName ] as TFieldType;
      } else if (fallbackObject && fieldName in fallbackObject) {
        // 2. Read from fallback object
        v = fallbackObject[ fieldName ] as TFieldType;
      }
      // 3. Use fallback value
      if (v === undefined) {
        v = fallbackFieldValue;
      }
      if (v !== undefined) {
        upstream.set(v);
      }
    },
  })
  return toReadable(upstream);
}