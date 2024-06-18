import * as Colour from '../../visual/Colour.js';
import { scale } from "../../data/Scale.js";
import type { ReactiveInitial, ReactiveWritable, ReactiveStream, Reactive } from "../Types.js";
import { eventField, event, eventTrigger } from "./Event.js";
import type { DomValueOptions } from "./Types.js";
import { resolveEl } from '../../dom/ResolveEl.js';
import { transform } from '../ops/Transform.js';

/**
 * Fires when the value of a HTMLInputElement changes.
 * This function expects numeric values.
 * 
 * ```js
 * const r = domValueAsNumber(el);
 * ```
 * 
 * Options:
 * * makeRelative: if _true_, uses min/max attributes to make value relative (default: false)
 * * when: if 'change' (default), fires when value has been changed. Use 'progress' to emit in-progress values.
 * @param targetOrQuery 
 * @param options 
 * @returns 
 */
// export function domValueAsNumber(targetOrQuery: HTMLInputElement | string, options: Partial<DomValueAsNumberOptions> = {}): ReactiveInitial<number> & ReactiveDisposable<number> & ReactiveWritable<number> {
//   const target: HTMLInputElement | null = (typeof targetOrQuery === `string` ? document.querySelector(targetOrQuery) : targetOrQuery);
//   if (target === null && typeof targetOrQuery === `string`) throw new Error(`Element query could not be resolved '${ targetOrQuery }`);
//   if (target === null) throw new Error(`targetOrQuery is null`)

//   const when = options.when ?? `changed`;
//   const eventName = when === `changed` ? `change` : `input`;
//   const makeRelative = options.makeRelative ?? false;
//   const invert = options.invert ?? false;
//   const initialValue = options.initialValue;
//   const postTransform = options.transform;

//   const setToDom = (value: number) => {
//     target.valueAsNumber = value;
//     target.setAttribute(`value`, value.toString())
//   }

//   if (initialValue !== undefined) {
//     setToDom(initialValue);
//   }

//   const p = (value: string | null) => {
//     // eslint-disable-next-line unicorn/no-null
//     if (value === null) return null;
//     return Number.parseFloat(value);
//   }

//   const max = p(target.getAttribute(`max`));
//   const min = p(target.getAttribute(`min`));
//   if (makeRelative && max === null) throw new Error(`Cannot make a relative value if 'max' attribute missing from target element.`);
//   if (makeRelative && min === null) throw new Error(`Cannot make a relative value if 'min' attribute missing from target element.`);

//   const transform = (value?: number) => {
//     if (value === undefined) return 0;
//     if (makeRelative) {
//       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//       value = scale(value, min!, max!);
//       if (invert) value = 1 - value;
//     } else if (invert && max !== null && min !== null) {
//       value = scale(value, min, max, max, min);
//     }

//     if (postTransform) value = postTransform(value);
//     return value;
//   }

//   options = {
//     ...options,
//     transform
//   }
//   const stream = eventPluckedField<number>(target, eventName, `valueAsNumber`, options);
//   return {
//     ...stream,
//     set: setToDom,
//   };
// }

// export function domValueAsHsl(targetOrQuery: HTMLInputElement | string, options: Partial<DomValueOptions<Colour.Hsl>> = {}): ReactiveInitial<Colour.Hsl> & ReactiveDisposable<Colour.Hsl> {
//   const target: HTMLInputElement | null = (typeof targetOrQuery === `string` ? document.querySelector(targetOrQuery) : targetOrQuery);
//   if (target === null && typeof targetOrQuery === `string`) throw new Error(`Element query could not be resolved '${ targetOrQuery }`);
//   if (target === null) throw new Error(`targetOrQuery is null`)

//   const postTransform = options.transform;
//   const when = options.when ?? `changed`;
//   const eventName = when === `changed` ? `change` : `input`;
//   const value = Colour.resolve(options.initialValue ?? target.value);

//   if (options.initialValue) {
//     const hex = Colour.toHex(value);
//     target.value = hex;
//     target.setAttribute(`value`, hex);
//   }

//   const transform = (value?: string | Colour.Hsl): Colour.Hsl => {
//     if (value === undefined) return Colour.toHsl(`white`);
//     let colour = Colour.toHsl(value);
//     if (postTransform) colour = postTransform(colour);
//     return colour;
//   }

//   options = {
//     ...options,
//     transform,
//     initialValue: transform(value)
//   }
//   const stream = eventPluckedField<Colour.Hsl>(target, eventName, `value`, options);
//   return stream;
// }

/**
 * A stream of values when the a HTMLInputElement changes. Eg a <input type="range">
 * ```js
 * const r = Rx.From.domValue(`#myEl`);
 * r.onValue(value => {
 *  // value will be string
 * });
 * ```
 * 
 * Options:
 * * when: Events can fire when the value is settled, or live
 * * initialValue: Sets a value on the output stream when starting. It also sets the HTML element
 * * domToValue: function to convert from DOM field (usually a string) to the destination type
 * * valueToDom: function to convert from stream value type to something assignable to DOM (usually a string)
 * 
 * The conversion functions for example are useful for <input type="color">. It needs a hex-encoded colour, but that's
 * not necessarily 
 * @param targetOrQuery 
 * @param options 
 * @returns 
 */
export function domInputValue(targetOrQuery: HTMLInputElement | string, options: Partial<DomValueOptions> = {}): ReactiveInitial<string> & Reactive<string> & ReactiveWritable<string> {
  const target: HTMLInputElement | null = (typeof targetOrQuery === `string` ? document.querySelector(targetOrQuery) : targetOrQuery);
  if (target === null && typeof targetOrQuery === `string`) throw new Error(`Element query could not be resolved '${ targetOrQuery }`);
  if (target === null) throw new Error(`targetOrQuery is null`)

  const el = resolveEl(targetOrQuery);
  const when = options.when ?? `changed`;
  const eventName = when === `changed` ? `change` : `input`;
  const emitInitialValue = options.emitInitialValue ?? false;
  const fallbackValue = options.fallbackValue ?? ``;

  let attribName = options.attributeName;
  let fieldName = options.fieldName;

  if (fieldName === undefined && attribName === undefined) {
    attribName = fieldName = `value`;
  }

  const readValue = () => {
    let value: string | null | undefined;
    if (attribName) {
      value = el.getAttribute(attribName);
    }
    if (value === null && fieldName) {
      value = (el as any)[ fieldName ]
    }
    if (value === undefined || value === null) value = fallbackValue;
    return value;
  }

  const setValue = (value: string) => {
    if (attribName) {
      el.setAttribute(attribName, value);
    }
    if (fieldName) {
      (el as any)[ fieldName ] = value;
    }
  }

  // Input element change event stream
  const rxEvents = eventTrigger(el, eventName, {
    fireInitial: emitInitialValue,
    debugFiring: options.debugFiring ?? false,
    debugLifecycle: options.debugLifecycle ?? false
  });

  // Transform to get values
  const rxValues = transform(rxEvents, _trigger => {
    // Event has fired
    return readValue();
  });

  return {
    ...rxValues,
    last() {
      return readValue()
    },
    set(value) {
      setValue(value);
    },
  }
  // if (options.initialValue) {
  //   const domValue = options.valueToDom ? options.valueToDom(options.initialValue) : options.initialValue.toString()
  //   target.value = domValue;
  //   target.setAttribute(`value`, domValue);
  // }

  // const transform = (value?: string): string => {
  //   if (postTransform) value = postTransform(value);
  //   return value ?? ``;
  // }

  // options = {
  //   ...options
  // }
  // const stream = eventPluckedField(target, eventName, `value`, options);
  // return stream;
}