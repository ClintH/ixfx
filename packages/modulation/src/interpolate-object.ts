import { interpolateString } from "./interpolate-string.js";
import { interpolate as interpolateNumber, type InterpolateOptions } from "./interpolate.js";
import {isEqualValueDefault} from "@ixfx/core/is-equal";
import * as Points from "@ixfx/geometry/point";

export type InterpolateObjectOptions<T> = {
  useFallbacks?:boolean;
  b:T;
  optionsNumbers: InterpolateOptions;
  valueEq: (a: any, b: any) => boolean;
}

export function interpolatorObject<T>(
  startingValue: T, 
  handlerFactory: Partial<{ [K in keyof T]: (valueA: T[K], valueB: T[K]) => (progression:number) => T[K] }>, 
  //handlerFactory: Partial<{ [K in keyof T]: (progression:number, valueA: T[K], valueB: T[K]) => T[K] }>, 
  options:Partial<InterpolateObjectOptions<T>> = {}): 
    (progression: number, retarget?: T, pickupFrom?: T) => T {
  //  {lastValue:T, retarget:(newTarget?:T, newOrigin?:T) => void, interpolate:(progression: number, retarget: T, pickupFrom?: T) => T} {
  const valueEq = options.valueEq ?? isEqualValueDefault;
  const useFallbacks = options.useFallbacks ?? true;
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
    console.log(`Creating handlers for props: ${Object.keys(handlerFactory).join(', ')}` );
    handlers = {}
    for (const key in startingValue) {
      if (key in handlerFactory) {
        const factory = handlerFactory[key];
        if (factory) {
          // Got a factory for this key
          console.log(`Creating handler for ${key} using factory`);
          handlers[key] = factory(a[key], b[key]);
          continue;
        }
      }

      // No factory for this key, use default
      console.log(`Using fallback for ${key} type: ${typeof startingValue[key]}`);
      if (typeof startingValue[key] === `string`) {
        if (options.defaultStrings) {
          options.defaultStrings
          handlers[key] = options.defaultStrings(a[key] as unknown as string, b[key] as unknown as string);
        } else if (useFallbacks) {
          handlers[key] = interpolateString(a[key] as unknown as string, b[key] as unknown as string);
        }
      } else if (typeof startingValue[key] === `number`) {
        if (options.optionsNumbers) {
          handlers[key] = interpolateNumber(a[key] as unknown as number, b[key] as unknown as number, options.optionsNumbers) as ((progression:number) => number);
        } else {
          handlers[key] = interpolateNumber(a[key] as unknown as number, b[key] as unknown as number) as (progression:number) => number;
        }
      } else if (typeof startingValue[key] === `boolean`) {
        handlers[key] = defaultBooleans(a[key] as unknown as boolean, b[key] as unknown as boolean);
      }
      continue;
      
    }
  }

  const retarget = (newTarget?:T, newOrigin?:T) => {
    console.log(`Retargeting with`, { newTarget, newOrigin });
    let newA = newOrigin ?? a;
    let newB = newTarget ?? b;
    if (created && valueEq(newA, a) && valueEq(newB, b)) return;
    a = newA;
    b = newB;
    createHandlers();
  }

  const interpolate = (progression:number, newB?:T, newA?:T) => {
    console.log(`Interpolating with progression ${progression}`, { newA, newB });
    retarget(newB, newA);
    const result = {} as T;
    for (const key in b) {
      const handler = handlers[key];
      if (handler === undefined) {
        result[key] = b[key];
      } else {
        result[key] = handler(progression);
      }
    }
    //lastValue = result;
    return result;
  }
  //return { interpolate,retarget,get lastValue(): T { return lastValue }};
  return interpolate;
}

// const testA = {
//   name: `Alice`,
//   age: 30,
//   city: `New York`,
//   radians: 0,
//   point: { x: 0, y: 0 },
// };
// const testB = {
//   name: `ALICE`,
//   age: 31,
//   city: `New York`,
//   radians: Math.PI * 2,
//   point: { x: 10, y: 10 },
// };

// const m = interpolatorObject(testA, {
//   point: (a, b) => Points.interpolator(a, b),
// }, {
//   defaultStrings: interpolateString,
//   defaultNumbers: interpolateNumber
// });
// const result = m(0.5, testB);
// result.city
