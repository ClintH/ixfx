import { interpolateString } from "./string.js";
import { interpolate as interpolateNumber } from "./number.js";
import {isEqualValueDefault} from "@ixfx/core/is-equal";
import { BooleanInterpolateOptions, InterpolateOptions, StringInterpolateOptions } from "./types.js";
import { interpolatorBoolean } from "./boolean.js";

export type InterpolateObjectOptions<T> = {
  useFallbacks?:boolean;
  b:T;
  /**
   * Default interpolation options for numeric values
   */
  optionsNumbers: InterpolateOptions;
  /**
   * Default interpolation options for string values
   */
  optionsStrings: Partial<StringInterpolateOptions>;
  /**
   * Default interpolation options for boolean values
   */
  optionsBooleans: Partial<BooleanInterpolateOptions>;
  /**
   * Default interpolation options if there's no handler for that property name or type.
   * It's a threshold from when return the A or B value. For example, with a threshold of 0.5, if progression is less than 0.5, return A, otherwise return B.
   */
  fallbackThreshold:number
  valueEq: (a: any, b: any) => boolean;
}

/**
 * Interpolate child values between two objects. Non-recursive.
 * 
 * ```js
 * const a = { name: `Alice`, age: 30, city: `New York`, radians: 0, point: { x: 0, y: 0 } };
 * const b = { name: `ALICE`, age: 4, city: `New York`, radians: Math.PI * 2, length: 10, point: { x: 10, y: 10 } };
 * 
 * // Interpolate using default settings
 * const m = interpolatorObject(a);
 * const r = m(0.5, b); // Interpolate by 50% to value of `b`
 * // { name: `ALIce`,  age: 17, city: `New York`, radians: 3.14, point: {x: 10, y:10}}
 * ```
 * 
 * Note in the above example the 'point' property isn't interpolated, because it's an object. In the case of unsupported data types like this,
 * the interpolator snaps between the A value and the B value based on a threshold (default: 0.5). In the above example, because the progression is 0.5, the interpolator returns the B value for 'point'. If the progression were 0.49, it would return the A value for 'point'.
 * 
 * Provide handlers for interpolating specific properties:
 * ```js
 * import * as Points from '@ixfx/geometry/point';
 * 
 * // Use default interplators except for the 'point' property
 * const m = interpolatorObject(a, {
 *   point: (a, b) => Points.interpolator(a, b), // Use @ixfx/geometry point interpolator for the 'point' property
 * });
 * const r= m(0.5, b);
 * // Now the 'point' is interpolated as well:
 * // { name: `ALIce`,  age: 17, city: `New York`, radians: 3.14, point: {x: 5, y:5}}
 * ```
 * 
 * If a handler for a given property is not defined, we use fallback interpolation for number, string and boolean value types. These
 * will use the default settings for their respective interpolator functions, or they can be provided:
 * ```js
 * const m = interpolatorObject(a, {}, {
 *   optionsStrings: { style: `token`, tokenise: `character` }, // Use character tokenisation for string interpolation
 *   optionsNumbers: { easing: `easeInOutQuad` }, // Use easeInOutQuad easing for number interpolation
 *   optionsBooleans: { threshold: 0.8 }, // Use a threshold of 0.8 for boolean interpolation
 * });
 * const r = m(0.5, b);
 * ```
 * 
 * When creating the interpolator you can pass in the initial target ('B' value) and also set the threshold used for unknown value types:
 * ```js
 * const m = interpolatorObject(a, {}, { b: targetValue, fallbackThreshold: 0.25 });
 * m(0.6); // Don't need to pass in target, since it's already baked-in.
 * ```
 * 
 * If you don't pass in the target, it defaults to the start value, so the interpolator doesn't 'move'. Provide a target when calling the returned function
 * as shown in the earlier examples.
 * 
 * The function is stateful in that the last set target is remembered. It's also possible to change the initial value:
 * ```js
 * m(0.5, newTarget); // Set a new target to interpolate to
 * m(0.5, newTarget, newOrigin); // Set both a new target and new origin
 * ``` 
 * 
 * When target or origin changes, we recreate the handlers defined on the `handlerFactory`, or set up the fallback defaults.
 * @param startingValue 
 * @param handlerFactory 
 * @param options 
 * @returns 
 */
export function interpolatorObject<T>(
  startingValue: T, 
  handlerFactory: Partial<{ [K in keyof T]: (valueA: T[K], valueB: T[K]) => (progression:number) => T[K] }>, 
  //handlerFactory: Partial<{ [K in keyof T]: (progression:number, valueA: T[K], valueB: T[K]) => T[K] }>, 
  options:Partial<InterpolateObjectOptions<T>> = {}): 
    (progression: number, retarget?: T, pickupFrom?: T) => T {
  //  {lastValue:T, retarget:(newTarget?:T, newOrigin?:T) => void, interpolate:(progression: number, retarget: T, pickupFrom?: T) => T} {
  const valueEq = options.valueEq ?? isEqualValueDefault;
  const fallbackThreshold = options.fallbackThreshold ?? 0.5;

  let handlers: Partial<{ [K in keyof T]: (progression:number) => T[K] }> = {};
  let a:T = startingValue;
  let b:T = options.b ?? startingValue;
  //let lastValue:T = startingValue;

  //const defaultStrings = options.defaultStrings ?? interpolateString
  //const defaultNumbers = options.defaultNumbers ?? interpolateNumber;
  //const defaultBooleans = options.defaultBooleans ?? ((amount:number, a:boolean, b:boolean) => amount < 0.5 ? a : b);
  let created = false;
  const createHandlers = () => {
    created = true;
    //console.log(`Creating handlers for props: ${Object.keys(handlerFactory).join(', ')}` );
    handlers = {}
    for (const key in startingValue) {
      const value = startingValue[key];
      if (key in handlerFactory) {
        const factory = handlerFactory[key];
        if (factory) {
          // Got a factory for this key
          //console.log(`Creating handler for ${key} using factory`);
          handlers[key] = factory(a[key], b[key]);
          continue;
        }
      }

      // No factory for this key, use default
      //console.log(`Using fallback for ${key} type: ${typeof startingValue[key]}`);
      if (typeof value === `string`) {
        (handlers as any)[key] = interpolateString(a[key] as unknown as string, b[key] as unknown as string, options.optionsStrings);
      } else if (typeof value === `number`) {
        (handlers as any)[key] = interpolateNumber(a[key] as unknown as number, b[key] as unknown as number, options.optionsNumbers);
      } else if (typeof value === `boolean`) {
        (handlers as any)[key] = interpolatorBoolean(a[key] as unknown as boolean, b[key] as unknown as boolean, options.optionsBooleans);
      }
      continue;
    }
  }

  const retarget = (newTarget?:T, newOrigin?:T) => {
    //console.log(`Retargeting with`, { newTarget, newOrigin });
    let newA = newOrigin ?? a;
    let newB = newTarget ?? b;
    if (created && valueEq(newA, a) && valueEq(newB, b)) return;
    a = newA;
    b = newB;
    createHandlers();
  }

  const interpolate = (progression:number, newB?:T, newA?:T) => {
    //console.log(`Interpolating with progression ${progression}`, { newA, newB });
    retarget(newB, newA);
    const result = {} as T;
    for (const key in b) {
      const handler = handlers[key];
      if (handler === undefined) {
        //console.log(`No handler for ${key}, using value from b. Progression: ${progression}`);
        if (progression < fallbackThreshold) {
          result[key] = a[key];
        } else {
          result[key] = b[key];
        }
      } else {
        result[key] = handler(progression);
      }
    }
    return result;
  }
  return interpolate;
}
