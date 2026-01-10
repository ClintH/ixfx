//import { hasLast, isReactive } from "@ixfx/rx";
//import type { ReactiveNonInitial } from "@ixfx/rx";
import type { BasicType } from "@ixfx/core";
import { getErrorMessage } from "@ixfx/debug";
import type { ReactiveNonInitial } from "./types-reactive.js";
import { hasLast, isReactive } from "./reactive-core.js";


/**
 * Something that can resolve to a value
 */
export type ResolveToValueSync<V> = BasicType | ReactiveNonInitial<V> | Generator<V> | IterableIterator<V> | ((...args: unknown[]) => V)
export type ResolveToValueAsync<V> = AsyncGenerator<V> | AsyncIterableIterator<V> | Promise<V> | ((...args: unknown[]) => Promise<V>);
export type ResolveToValue<V> = ResolveToValueAsync<V> | ResolveToValueSync<V>;

/**
 * Resolves the input to a concrete value. 
 * 
 * The input can be:
 * * primitive value (string, boolean, number, object)
 * * a/sync function
 * * a/sync generator/iterator
 * * ReactiveNonInitial
 * 
 * Examples:
 * ```js
 * await resolve(10);       // 10
 * await resolve(() => 10); // 10
 * await resole(async () => {
 *  sleep(100);
 *  return 10;
 * });                // 10
 * ```
 * 
 * If the input is a function, any arguments given to `resolve` are passed to it as a spread.
 * 
 * Resolve is not recursive. If the input is an object, it will be returned, even
 * though its properties may be resolvable. Use {@link resolveFields} if you want to handle this case.
 * @param resolvable Input to resolve
 * @param args Additional arguments to pass to function-resolvables.
 * @returns 
 */
export async function resolve<V extends BasicType>(resolvable: ResolveToValue<V>, ...args: unknown[]): Promise<V> {
  if (typeof resolvable === `object`) {
    if (`next` in resolvable) {
      const tag = (resolvable as any)[ Symbol.toStringTag ];
      if (tag === `Generator` || tag == `Array Iterator`) {
        const v = resolvable.next();
        if (`done` in v && `value` in v) return v.value as V;
        return v as V;
      } else if (tag === `AsyncGenerator`) {
        const v = await resolvable.next();
        //console.log(`  hasDone: ${ `done` in v } value:`, v);
        if (`done` in v && `value` in v) return v.value as V;
        return v as V;
      } else {
        throw new Error(`Object has 'next' prop, but does not have 'AsyncGenerator', 'Generator' or 'Array Iterator' string tag symbol. Got: '${ tag }'`);
      }
    } else if (isReactive<V>(resolvable)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (hasLast(resolvable)) return resolvable.last()!;
      throw new Error(`Reactive does not have last value`);
    } else {
      // Some regular object
      return resolvable as V;
    }
  } else if (typeof resolvable === `function`) {

    const v = await resolvable(...args) as V;
    return v;
  } else {
    // Primitive value?
    return resolvable as V;
  }
}

/**
 * For the given input, attempts to 'resolve' it. See {@link resolve} for details and asynchronous version.
 * @param resolvable 
 * @param args 
 * @returns 
 */
export function resolveSync<V extends BasicType>(resolvable: ResolveToValueSync<V>, ...args: unknown[]): V {
  if (typeof resolvable === `object`) {
    if (`next` in resolvable) {
      const tag = (resolvable as any)[ Symbol.toStringTag ];
      if (tag === `Generator` || tag == `Array Iterator`) {
        const v = resolvable.next();
        if (`done` in v && `value` in v) return v.value as V;
        return v as V;
      } else if (tag === `AsyncGenerator`) {
        throw new Error(`resolveSync cannot work with an async generator`);
      } else {
        throw new Error(`Object has 'next' prop, but does not have 'Generator' or 'Array Iterator' string tag symbol. Got: '${ tag }'`);
      }
    } else if (isReactive<V>(resolvable)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (hasLast(resolvable)) return resolvable.last()!;
      throw new Error(`Reactive does not have last value`);
    } else {
      // Some regular object
      return resolvable as V;
    }
  } else if (typeof resolvable === `function`) {
    return resolvable(...args);
  } else {
    // Primitive value?
    return resolvable as V;
  }
}

/**
 * Resolves a value as per {@link resolve}, however f an error is thrown 
 * or the resolution results in _undefined_ 
 * or NaN, the fallback value is returned instead.
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
 * 
 * See also {@link resolveWithFallbackSync}
 * @param p Thing to resolve
 * @param options Fallback value if an error happens, undefined or NaN
 * @param args 
 * @returns 
 */
export async function resolveWithFallback<T extends BasicType>(p: ResolveToValue<T>, options: ResolveFallbackOptions<T>, ...args: unknown[]): Promise<T> {
  let errored = false;
  let fallbackValue = options.value;
  const overrideWithLast = options.overrideWithLast ?? false;
  if (fallbackValue === undefined) throw new Error(`Param 'options.value' is undefined`);

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

/**
 * Resolves a 'resolvable', using a fallback value if it results to _undefined_ or _NaN_. _null_ is allowed.
 * 
 * See also {@link resolveWithFallback} for the asynchronous version.
 * 
 * Options:
 * * value: Fallback value
 * * overrideWithLast: If true, uses the previously-valid value as the replacement fallback (default: false)
 * @param p 
 * @param options 
 * @param args 
 * @returns 
 */
export function resolveWithFallbackSync<T extends BasicType>(p: ResolveToValueSync<T>, options: ResolveFallbackOptions<T>, ...args: unknown[]): T {
  let errored = false;
  let fallbackValue = options.value;
  const overrideWithLast = options.overrideWithLast ?? false;
  if (fallbackValue === undefined) throw new Error(`Param 'options.value' is undefined`);

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

/**
 * Options for {@link resolveWithFallbackSync}
 */
export type ResolveFallbackOptions<T> = {
  /**
   * Fallback value
   */
  value: T,
  /**
   * If _true_, will use the last valid value as a replacement fallback
   * Default: false
   */
  overrideWithLast?: boolean
}