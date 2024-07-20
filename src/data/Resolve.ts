import { hasLast, isReactive } from "../rx/Util.js";
import type { ReactiveNonInitial } from "../rx/Types.js";
import type { ValueType } from "./Types.js";

/**
 * Something that can resolve to a value
 */
export type ResolveToValue<V> = ValueType | Promise<V> | ReactiveNonInitial<V> | Generator<V> | AsyncGenerator<V> | IterableIterator<V> | AsyncIterableIterator<V> | ((args: any) => V)

/**
 * Resolves `r` to a value, where `r` is:
 * * primitive value
 * * a/sync function
 * * a/sync generator/iterator
 * * ReactiveNonInitial
 * 
 * ```js
 * await resolve(10);       // 10
 * await resolve(() => 10); // 10
 * await resole(async () => {
 *  sleep(100);
 *  return 10;
 * });                // 10
 * ```
 * 
 * To resolve an object's properties, use {@link resolveFields}.
 * 
 * Resolve is not recursive. So if `r` is an object, it will be returned, even
 * though its properties may be resolvable.
 * @param r 
 * @param args 
 * @returns 
 */
export async function resolve<V extends ValueType>(r: ResolveToValue<V>, ...args: any): Promise<V> {
  if (typeof r === `object`) {
    if (`next` in r) {
      const tag = (r as any)[ Symbol.toStringTag ];
      //console.log(tag);
      if (tag === `Generator` || tag == `Array Iterator`) {
        const v = r.next();
        if (`done` in v && `value` in v) return v.value as V;
        return v as V;
      } else if (tag === `AsyncGenerator`) {
        const v = await r.next() as IteratorResult<V>;
        //console.log(`  hasDone: ${ `done` in v } value:`, v);
        if (`done` in v && `value` in v) return v.value as V;
        return v as V;
      } else {
        throw new Error(`Object has 'next' prop, but does not have 'AsyncGenerator', 'Generator' or 'Array Iterator' string tag symbol. Got: '${ tag }'`);
      }
    } else if (isReactive<V>(r)) {
      if (hasLast(r)) return r.last();
      throw new Error(`Reactive does not have last value`);
    } else {
      // Some regular object
      return r as V;
    }
  } else if (typeof r === `function`) {
    const v = await r(args) as V;
    return v;
  } else {
    // Primitive value?
    return r as V;
  }
}