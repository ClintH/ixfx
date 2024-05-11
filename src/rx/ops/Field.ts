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
export function field<TIn extends object, TFieldType>(fieldSource: ReactiveOrSource<TIn>, fieldName: keyof TIn, options: Partial<FieldOptions<TFieldType>> = {}): Reactive<TFieldType> {
  const handleMissing = `missingFieldDefault` in options;
  const upstream = initUpstream<TIn, TFieldType>(fieldSource, {
    disposeIfSourceDone: true,
    ...options,
    onValue(value) {
      if (fieldName in value) {
        upstream.set(value[ fieldName ] as TFieldType);
      } else {
        if (handleMissing) {
          upstream.set(options.missingFieldDefault as TFieldType);
        }
      }
    },
  })
  return toReadable(upstream);
}