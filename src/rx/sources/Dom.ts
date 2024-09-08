import * as Colour from '../../visual/Colour.js';
import type { ReactiveInitial, ReactiveWritable, Reactive } from "../Types.js";
import { eventTrigger } from "./Event.js";
import type { DomNumberInputValueOptions, DomValueOptions } from "./Types.js";
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