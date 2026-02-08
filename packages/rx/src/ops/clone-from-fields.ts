
import { testPlainObjectOrPrimitive } from "@ixfx/guards";
import type { Reactive, ReactiveOrSource } from "../types.js";
import { transform } from "./transform.js";

/**
 * Create a new object from input, based on cloning fields rather than a destructured copy.
 * This is useful for event args.
 * @param source 
 * @returns 
 */
export const cloneFromFields = <In>(source: ReactiveOrSource<In>): Reactive<In> => {
  return transform<In, In>(source, (v): In => {
    const entries: [ key: string, value: any ][] = [];
    for (const field in v) {
      const value = (v)[ field ];
      if (value === null || Array.isArray(value) || testPlainObjectOrPrimitive(value as unknown).success) {
        entries.push([ field, value ]);
      }
    }
    return Object.fromEntries(entries) as In;
  })
}