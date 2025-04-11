//import type { ReactiveNonInitial } from "src/rx/Types.js";
import { zip } from "@ixfxfun/arrays";
import { resolve, resolveSync, type ResolveToValue } from "../../core/src/resolve-core.js";
import type { ReactiveNonInitial } from "../../core/src/types-reactive.js";
// import { zip } from "./arrays/Zip.js";

export type ResolvedObject<T extends Record<string, ResolveToValue<any>>> =
  { [ K in keyof T ]:
    T[ K ] extends number ? number :
    T[ K ] extends string ? string :
    T[ K ] extends boolean ? boolean :
    T[ K ] extends bigint ? bigint :
    T[ K ] extends () => Promise<any> ? Awaited<ReturnType<T[ K ]>> :
    T[ K ] extends () => any ? ReturnType<T[ K ]> :
    T[ K ] extends ReactiveNonInitial<infer V> ? V :
    T[ K ] extends Generator<infer V> ? V :
    T[ K ] extends AsyncGenerator<infer V> ? V :
    T[ K ] extends IterableIterator<infer V> ? V :
    T[ K ] extends AsyncIterableIterator<infer V> ? V :
    T[ K ] extends Array<infer V> ? V : // array needed?
    T[ K ] extends object ? T[ K ] : never
  };


/**
 * Returns a copy of `object`, with the same properties. For each property
 * that has a basic value (string, number, boolean, object), the value is set
 * for the return object. If the property is a function or generator, its value
 * is used instead. Async functions and generators are also usable.
 * 
 * Use {@link resolveFieldsSync} for a synchronous version.
 * 
 * Not recursive.
 * 
 * In the below example, the function for the property `random` is invoked.
 * ```js
 * const state = {
 *  length: 10,
 *  random: () => Math.random();
 * }
 * const x = resolveFields(state);
 * // { length: 10, random: 0.1235 }
 * ```
 * 
 * It also works with generators
 * ```js
 * import { count } from './numbers.js';
 * 
 * const state = {
 *  length: 10,
 *  index: count(2) // Generator that yields: 0, 1 and then ends
 * }
 * resolveFields(state); // { length: 10, index: 0 }
 * resolveFields(state); // { length: 10, index: 1 }
 * // Generator finishes after counting twice:
 * resolveFields(state); // { length: 10, index: undefined }
 * ```
 * @param object 
 * @returns 
 */
export async function resolveFields<T extends Record<string, ResolveToValue<any>>>(object: T): Promise<ResolvedObject<T>> {
  const resolvers: any[] = [];
  const keys: string[] = [];
  for (const entry of Object.entries(object)) {
    const resolvable = entry[ 1 ] as ResolveToValue<typeof entry[ 1 ]>;
    resolvers.push(resolve(resolvable));
    keys.push(entry[ 0 ]);
  }
  const results = await Promise.all(resolvers);
  const entries = zip(keys, results);
  return Object.fromEntries(entries) as ResolvedObject<T>;
}

export function resolveFieldsSync<T extends Record<string, ResolveToValue<any>>>(object: T): ResolvedObject<T> {
  const entries: [ key: string, value: any ][] = [];
  for (const entry of Object.entries(object)) {
    const resolvable = entry[ 1 ] as ResolveToValue<typeof entry[ 1 ]>;
    const value = resolveSync(resolvable);
    entries.push([ entry[ 0 ], value ]);
  }
  return Object.fromEntries(entries) as ResolvedObject<T>;
}


/**
 * Returns a function that resolves `object`.
 *
 * Use {@link resolveFields} to resolve an object directly.
 * @param object
 * @returns
 */
// export function resolverFields<V extends object>(object: V) {
//   return () => resolveFields(object);
// }
