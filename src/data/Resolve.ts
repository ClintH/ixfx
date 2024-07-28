import { hasLast, isReactive } from "../rx/Util.js";
import type { ReactiveNonInitial } from "../rx/Types.js";
import type { ValueType } from "./Types.js";
import { getErrorMessage } from "../debug/GetErrorMessage.js";

/**
 * Something that can resolve to a value
 */
export type ResolveToValueSync<V> = ValueType | ReactiveNonInitial<V> | Generator<V> | IterableIterator<V> | ((args: any) => V)
export type ResolveToValueAsync<V> = AsyncGenerator<V> | AsyncIterableIterator<V> | Promise<V> | ((args: any) => Promise<V>);
export type ResolveToValue<V> = ResolveToValueAsync<V> | ResolveToValueSync<V>;

/**
 * Resolves `r` to a value, where `r` is:
 * * primitive value
 * * a/sync function
 * * a/sync generator/iterator
 * * ReactiveNonInitial
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

export function resolveSync<V extends ValueType>(r: ResolveToValueSync<V>, ...args: any): V {
  if (typeof r === `object`) {
    if (`next` in r) {
      const tag = (r as any)[ Symbol.toStringTag ];
      if (tag === `Generator` || tag == `Array Iterator`) {
        const v = r.next();
        if (`done` in v && `value` in v) return v.value as V;
        return v as V;
      } else if (tag === `AsyncGenerator`) {
        throw new Error(`resolveSync cannot work with an async generator`);
      } else {
        throw new Error(`Object has 'next' prop, but does not have 'Generator' or 'Array Iterator' string tag symbol. Got: '${ tag }'`);
      }
    } else if (isReactive<V>(r)) {
      if (hasLast(r)) return r.last();
      throw new Error(`Reactive does not have last value`);
    } else {
      // Some regular object
      return r as V;
    }
  } else if (typeof r === `function`) {
    return r(args) as V;
  } else {
    // Primitive value?
    return r as V;
  }
}

/**
 * Resolves a value as per {@link resolve}, however
 * If an error is thrown or the resolution results in _undefined_ 
 * or NaN, `fallbackValue` is returned instead.
 * 
 * `null` is an allowed return value.
 * 
 * ```js
 * // Function returns undefined 50% of the time or 0
 * const fn = () => {
 *  if (Math.random() >= 0.5) return; // undefined
 *  return 0;
 * }
 * const r = resolveWithFallback(fn, 1);
 * const value = r(); // Always 0 or 1
 * ```
 * @param p Thing to resolve
 * @param fallback Fallback value if an error happens, undefined or NaN
 * @param args 
 * @returns 
 */
export async function resolveWithFallback<T extends ValueType>(p: ResolveToValue<T>, fallback: ResolveFallbackOpts<T>, ...args: any) {
  let errored = false;
  let fallbackValue = fallback.value;
  const overrideWithLast = fallback.overrideWithLast ?? false;
  if (fallbackValue === undefined) throw new Error(`Needs a fallback value`);

  try {
    const r = await resolve(p, ...args);
    if (typeof r === `undefined`) return fallbackValue;
    if (typeof r === `number` && Number.isNaN(r)) return fallbackValue;
    if (overrideWithLast) fallbackValue = r;
    return r;
  } catch (error) {
    if (!errored) {
      errored = true;
      console.warn(`resolveWithFallback swallowed an error. Additional errors not reported.`, getErrorMessage(error));
    }
    return fallbackValue;
  }
}

export function resolveWithFallbackSync<T extends ValueType>(p: ResolveToValueSync<T>, fallback: ResolveFallbackOpts<T>, ...args: any) {
  let errored = false;
  let fallbackValue = fallback.value;
  const overrideWithLast = fallback.overrideWithLast ?? false;
  if (fallbackValue === undefined) throw new Error(`Needs a fallback value`);

  try {
    const r = resolveSync(p, ...args);
    if (typeof r === `undefined`) return fallbackValue;
    if (typeof r === `number` && Number.isNaN(r)) return fallbackValue;
    if (overrideWithLast) fallbackValue = r;
    return r;
  } catch (error) {
    if (!errored) {
      errored = true;
      console.warn(`resolveWithFallbackSync swallowed an error. Additional errors not reported.`, getErrorMessage(error));
    }
    return fallbackValue;
  }
}

export type ResolveFallbackOpts<T> = { value: T, overrideWithLast?: boolean }