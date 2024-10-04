import * as Colour from '../../visual/Colour.js';
import type { ReactiveInitial, ReactiveWritable, Reactive } from "../Types.js";
import { eventTrigger } from "./Event.js";
import type { DomFormOptions, DomNumberInputValueOptions, DomValueOptions } from "./Types.js";
import { resolveEl } from '../../dom/ResolveEl.js';
import { transform } from '../ops/Transform.js';
import { hasLast } from '../Util.js';

/**
 * Reactive getting/setting of values to a HTML INPUT element.
 * 
 * Options:
 * - relative: if _true_, values are 0..1 (default: false)
 * - inverted: if _true_, values are 1..0 (default: false)
 * 
 * If element is missing a 'type' attribute, this will be set to 'range'.
 * @param targetOrQuery 
 * @param options 
 * @returns 
 */
export function domNumberInputValue(targetOrQuery: HTMLInputElement | string, options: Partial<DomNumberInputValueOptions> = {}): ReactiveInitial<number> & ReactiveWritable<number> {
  const input = domInputValue(targetOrQuery, options);
  const el = input.el;
  const relative = options.relative ?? false;
  const inverted = options.inverted ?? false;

  const rx = transform(input, v => {
    return Number.parseFloat(v);
  });

  if (relative) {
    //el.setAttribute(`max`, inverted ? "0" : "1");
    el.max = inverted ? "0" : "1";
    //el.setAttribute(`min`, inverted ? "1" : "0");
    el.min = inverted ? "1" : "0";
    if (!el.hasAttribute(`step`)) {
      //el.setAttribute(`step`, "0.1");
      el.step = "0.1";
    }
  }
  if (el.getAttribute(`type`) === null) {
    el.type = `range`;
  }

  const set = (value: number) => {
    input.set(value.toString());
  }

  return {
    ...rx,
    last() {
      //console.log(`domNumberInputValue last: ${ input.last() }`);
      return Number.parseFloat(input.last())
    },
    set
  };
}

export function domHslInputValue(targetOrQuery: HTMLInputElement | string, options: Partial<DomValueOptions> = {}): ReactiveInitial<Colour.Hsl> & Reactive<Colour.Hsl> & ReactiveWritable<Colour.Hsl> {

  const input = domInputValue(targetOrQuery, {
    ...options,
    upstreamFilter(value) {
      return (typeof value === `object`) ? Colour.toHex(value) : value;
    },
  });
  const rx = transform(input, v => {
    return Colour.toHsl(v, true);
  });
  return {
    ...rx,
    last() {
      return Colour.toHsl(input.last(), true)
    },
    set(value) {
      input.set(Colour.toHex(value));
    },
  };
}

/**
 * A stream of values when the a HTMLInputElement changes. Eg a <input type="range">
 * ```js
 * const r = Rx.From.domInputValue(`#myEl`);
 * r.onValue(value => {
 *  // value will be string
 * });
 * ```
 * 
 * Options:
 * * emitInitialValue: If _true_ emits the HTML value of element (default: false)
 * * attributeName: If set, this is the HTML attribute value is set to when writing to stream (default: 'value')
 * * fieldName: If set, this is the DOM object field set when writing to stream (default: 'value')
 * * when: 'changed'|'changing' when values are emitted. (default: 'changed')
 * * fallbackValue:  Fallback value to use if field/attribute cannot be read (default: '')
 * @param targetOrQuery 
 * @param options 
 * @returns 
 */
export function domInputValue(targetOrQuery: HTMLInputElement | string, options: Partial<DomValueOptions> = {}): { el: HTMLInputElement } & ReactiveInitial<string> & ReactiveWritable<string> {
  const target: HTMLInputElement | null = (typeof targetOrQuery === `string` ? document.querySelector(targetOrQuery) : targetOrQuery);
  if (target === null && typeof targetOrQuery === `string`) throw new Error(`Element query could not be resolved '${ targetOrQuery }'`);
  if (target === null) throw new Error(`targetOrQuery is null`)

  const el = resolveEl(targetOrQuery);
  const when = options.when ?? `changed`;
  const eventName = when === `changed` ? `change` : `input`;
  const emitInitialValue = options.emitInitialValue ?? false;
  const fallbackValue = options.fallbackValue ?? ``;
  const upstreamSource = options.upstreamSource;
  let upstreamSourceUnsub = () => {}

  let attribName = options.attributeName;
  let fieldName = options.fieldName;

  if (fieldName === undefined && attribName === undefined) {
    attribName = fieldName = `value`;
  }

  const readValue = () => {
    let value: string | null | undefined;
    if (attribName) {
      value = el.getAttribute(attribName);
      //console.log(`  attrib: ${ attribName } value: ${ value }`);
    }
    if (fieldName) {
      value = (el as any)[ fieldName ]
    }
    if (value === undefined || value === null) value = fallbackValue;
    //console.log(`domInputValue readValue: ${ value }. attrib: ${ attribName } field: ${ fieldName }`);
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

  const setUpstream = (v: any) => {
    v = options.upstreamFilter ? options.upstreamFilter(v) : v;
    setValue(v);
  }
  if (upstreamSource) {
    upstreamSourceUnsub = upstreamSource.onValue(setUpstream);
    if (hasLast(upstreamSource)) {
      setUpstream(upstreamSource.last());
    }
  }

  // Input element change event stream
  const rxEvents = eventTrigger(el, eventName, {
    fireInitial: emitInitialValue,
    debugFiring: options.debugFiring ?? false,
    debugLifecycle: options.debugLifecycle ?? false,
  });

  // Transform to get values
  const rxValues = transform(rxEvents, _trigger => readValue());

  return {
    ...rxValues,
    el,
    last() {
      return readValue()
    },
    set(value) {
      setValue(value);
    },
    dispose(reason) {
      upstreamSourceUnsub();
      rxValues.dispose(reason);
      rxEvents.dispose(reason);
    },
  }
}

/**
 * Listens for data changes from elements within a HTML form element.
 * Input elements must have a 'name' attribute.
 * 
 * Simple usage:
 * ```js
 * const rx = Rx.From.domForm(`#my-form`);
 * rx.onValue(value => {
 *  // Object containing values from form
 * });
 * 
 * rx.last(); // Read current values of form
 * ```
 * 
 * UI can be updated
 * ```js
 * // Set using an object of key-value pairs
 * rx.set({
 *  size: 'large'
 * });
 * 
 * // Or set a single name-value pair
 * rx.setNamedValue(`size`, `large`);
 * ```
 * 
 * If an 'upstream' reactive is provided, this is used to set initial values of the UI, overriding
 * whatever may be in the HTML. Upstream changes modify UI elements, but UI changes do not modify the upstream
 * source.
 * 
 * ```js
 * // Create a reactive object
 * const obj = Rx.From.object({
 *  when: `2024-10-03`,
 *  size: 12,
 *  checked: true
 * });
 * 
 * // Use this as initial values for a HTML form
 * // (assuming appropriate INPUT/SELECT elements exist)
 * const rx = Rx.From.domForm(`form`, { 
 *  upstreamSource: obj
 * });
 * 
 * // Listen for changes in the UI
 * rx.onValue(value => {
 *  
 * });
 * ```
 * @param formElOrQuery 
 * @param options 
 * @returns 
 */
export function domForm<T extends Record<string, any>>(formElOrQuery: HTMLFormElement | string, options: Partial<DomFormOptions<T>> = {}): {
  setNamedValue: (name: string, value: any) => void,
  el: HTMLFormElement
} & ReactiveInitial<T> & ReactiveWritable<T> {
  const formEl = resolveEl<HTMLFormElement>(formElOrQuery);
  const when = options.when ?? `changed`;
  const eventName = when === `changed` ? `change` : `input`;

  const emitInitialValue = options.emitInitialValue ?? false;
  const upstreamSource = options.upstreamSource;

  const typeHints = new Map<string, string>();

  let upstreamSourceUnsub = () => {}

  const readValue = () => {
    const fd = new FormData(formEl);
    const entries = [];
    for (const [ k, v ] of fd.entries()) {
      const vStr = v.toString();

      // Get type hint for key
      let typeHint = typeHints.get(k);
      if (!typeHint) {
        // If not found, use the kind of input element as a hint
        const el = getFormElement(k, vStr);
        if (el) {
          if (el.type === `range` || el.type === `number`) {
            typeHint = `number`;
          } else if (el.type === `color`) {
            typeHint = `colour`;
          } else if (el.type === `checkbox` && (v === `true` || v === `on`)) {
            typeHint = `boolean`;
          } else {
            typeHint = `string`;
          }
          typeHints.set(k, typeHint);
        }
      }

      if (typeHint === `number`) {
        entries.push([ k, Number.parseFloat(vStr) ]);
      } else if (typeHint === `boolean`) {
        const vBool = (vStr === `true`) ? true : false;
        entries.push([ k, vBool ]);
      } else if (typeHint === `colour`) {
        const vRgb = Colour.resolve(vStr, true);
        entries.push([ k, Colour.toRgb(vRgb) ]);
      } else {
        entries.push([ k, v.toString() ]);
      }
    }

    // Checkboxes that aren't checked don't give a value, so find those
    for (const el of formEl.querySelectorAll<HTMLInputElement>(`input[type="checkbox"]`)) {
      if (!el.checked && el.value === `true`) {
        entries.push([ el.name, false ]);
      }
    }
    const asObj = Object.fromEntries(entries);
    //console.log(`readValue`, asObj);
    return asObj;
  }

  const getFormElement = (name: string, value: string): HTMLSelectElement | HTMLInputElement | undefined => {
    const el = formEl.querySelector(`[name="${ name }"]`) as HTMLInputElement | null;
    if (!el) {
      console.warn(`Form does not contain an element with name="${ name }"`);
      return;
    }
    if (el.type === `radio`) {
      // Get right radio option
      const radioEl = formEl.querySelector(`[name="${ name }"][value="${ value }"]`) as HTMLInputElement | null;
      if (!radioEl) {
        console.warn(`Form does not contain radio option for name=${ name } value=${ value }`);
        return;
      }
      return radioEl;
    }
    return el;
  }
  const setNamedValue = (name: string, value: any) => {
    const el = getFormElement(name, value);
    if (!el) return;

    //let typeHint = typeHints.get(name);
    // if (typeHint) {
    //   console.log(`${ name } hint: ${ typeHint } input type: ${ el.type }`);
    // } else {
    //   console.warn(`Rx.Sources.Dom.domForm no type hint for: ${ name }`);
    // }
    if (el.nodeName === `INPUT` || el.nodeName === `SELECT`) {
      if (el.type === `color`) {
        if (typeof value === `object`) {
          // Try to parse colour if value is an object
          const c = Colour.resolve(value, true);
          value = Colour.toHex(c);
        }
      } else if (el.type === `checkbox`) {
        if (typeof value === `boolean`) {
          el.checked = value;
          return;
        } else {
          console.warn(`Rx.Sources.domForm: Trying to set non boolean type to a checkbox. Name: ${ name } Value: ${ value } (${ typeof value })`);
        }
      } else if (el.type === `radio`) {
        el.checked = true;
        return;
      }
      el.value = value;
    }
  }

  const setFromUpstream = (value: T) => {
    //console.log(`setUpstream`, value);
    for (const [ name, v ] of Object.entries(value)) {
      let hint = typeHints.get(name);
      if (!hint) {
        hint = typeof v;
        if (hint === `object`) {
          const rgb = Colour.parseRgbObject(v);
          if (rgb.success) {
            hint = `colour`;
          }
        }
        typeHints.set(name, hint);
      }
      const valueFiltered = options.upstreamFilter ? options.upstreamFilter(name, v) : v;
      setNamedValue(name, valueFiltered);
    }
  }

  if (upstreamSource) {
    upstreamSourceUnsub = upstreamSource.onValue(setFromUpstream);
    if (hasLast(upstreamSource)) {
      setFromUpstream(upstreamSource.last());
    }
  }

  // Input element change event stream
  const rxEvents = eventTrigger(formEl, eventName, {
    fireInitial: emitInitialValue,
    debugFiring: options.debugFiring ?? false,
    debugLifecycle: options.debugLifecycle ?? false,
  });

  // Transform to get values
  const rxValues = transform(rxEvents, _trigger => readValue());

  return {
    ...rxValues,
    el: formEl,
    last() {
      return readValue()
    },
    set: setFromUpstream,
    setNamedValue,
    dispose(reason) {
      upstreamSourceUnsub();
      rxValues.dispose(reason);
      rxEvents.dispose(reason);
    },
  }
}